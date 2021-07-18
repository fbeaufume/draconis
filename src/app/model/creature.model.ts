import {computeEffectiveDamage, computeEffectiveHeal, Skill} from './skill.model';
import {logs} from './log.model';
import {CRITICAL_BONUS, CRITICAL_CHANCE, DODGE_CHANCE} from './constants.model';
import {CreatureClass, LifeChangeEfficiency, LifeChangeType, LogType, StatusExpiration} from "./common.model";
import {StatusType} from "./status-type.model";
import {LifeChange} from "./life-change.model";
import {StatusApplication} from "./status-application.model";

/**
 * Base class for enemies and characters.
 */
export abstract class Creature {

  life: number;

  lifePercent: number;

  // Damages or heals received this turn and displayed in a popup
  lifeChange: LifeChange | null = null;

  // Current mana or tech points (depends on the character class) (currently only used by characters)
  energy: number;

  // Max mana or tech points (depends on the character class) (currently only used by characters)
  energyPercent: number;

  // The distance between the enemy and the party, i.e. 1 means the opposition front row, 2 means the middle row, 3 the back row
  // Not in the Enemy class to prevent circular dependency issues
  distance: number = 1;

  // Dodge chance, 0.1 means 10% dodge chance
  dodgeChance: number = DODGE_CHANCE;

  // Critical hit chance, 0.1 means 10% critical hit chance
  criticalChance: number = CRITICAL_CHANCE;

  // Critical hit bonus, 1.5 means 50% extra hit or heal
  criticalBonus: number = CRITICAL_BONUS;

  // Applied statuses
  statusApplications: StatusApplication[] = [];

  protected constructor(
    public name: string,
    // Character class or 'enemy' for enemies or 'end-round' for the end of round special creature
    public clazz: CreatureClass,
    public lifeMax: number,
    public energyMax: number,
    // Generic power of the creature, used to compute damage or heal amounts
    public power: number,
    // Creature skills (currently only used by characters)
    public skills: Skill[]
  ) {
    this.life = lifeMax;
    this.energy = energyMax;
    this.updateLifePercent();
  }

  abstract isCharacter(): boolean;

  abstract isEnemy(): boolean;

  abstract isEndOfRound(): boolean;

  isAlive(): boolean {
    return this.life > 0;
  }

  isDead(): boolean {
    return !this.isAlive();
  }

  isDamaged(): boolean {
    return this.life < this.lifeMax;
  }

  /**
   * Inflict some damage to the creature.
   */
  changeLife(lifeChange: LifeChange): LifeChange {
    this.life += lifeChange.getSignedAmount();

    this.lifeChange = lifeChange;

    // Enforce min and max values
    this.life = this.checkMinAndMax(this.life, this.lifeMax);

    this.updateLifePercent();

    // Remove all statuses when dead
    if (this.life <= 0) {
      this.clearStatusApplications();
    }

    return lifeChange;
  }

  updateLifePercent() {
    this.lifePercent = 100 * this.life / this.lifeMax;
  }

  clearLifeChange() {
    this.lifeChange = null;
  }

  /**
   * Can be used with a negative amount of energy, e.g. when the skill generates some energy.
   */
  spendEnergy(amount: number) {
    amount = Math.round(amount);
    this.energy -= amount;

    // Enforce min and max values
    this.energy = this.checkMinAndMax(this.energy, this.energyMax);

    this.updateEnergyPercent();
  }

  updateEnergyPercent() {
    this.energyPercent = 100 * this.energy / this.energyMax;
  }

  /**
   * Ensure that a given amount is between 0 and a max amount.
   */
  checkMinAndMax(amount: number, maxAmount: number): number {
    if (amount < 0) {
      return 0;
    }
    if (amount > maxAmount) {
      return maxAmount;
    }
    return amount;
  }

  getPositiveStatuses(): StatusApplication[] {
    return this.statusApplications.filter(sa => sa.improvement);
  }

  getNegativeStatuses(): StatusApplication[] {
    return this.statusApplications.filter(sa => !sa.improvement);
  }

  hasStatus(status: StatusType): boolean {
    return this.statusApplications.map(s => s.status.name).includes(status.name);
  }

  hasPositiveStatus(status: StatusType): boolean {
    return this.getPositiveStatuses().map(s => s.status.name).includes(status.name);
  }

  hasNegativeStatus(status: StatusType): boolean {
    return this.getNegativeStatuses().map(s => s.status.name).includes(status.name);
  }

  /**
   * Add a status to the creature. If already present, it is refreshed, i.e. replaced by a new one.
   */
  applyStatus(statusApplication: StatusApplication) {
    // Remove the status if necessary
    this.statusApplications = this.statusApplications.filter(s => s.status.name != statusApplication.status.name
      || (statusApplication.status.cumulative && s.getOriginCreatureName() != statusApplication.getOriginCreatureName()));

    this.statusApplications.unshift(statusApplication);
  }

  /**
   * Reduce the remaining duration of all statuses that use a given expiration type and remove the expired ones.
   */
  decreaseStatusesDuration(expiration: StatusExpiration, originCreature: Creature | null = null) {
    for (let i = 0; i < this.statusApplications.length; i++) {
      const statusApplication = this.statusApplications[i];

      if (statusApplication.status.expiration != expiration) {
        continue;
      }

      if (originCreature != null && statusApplication.getOriginCreatureName() != originCreature.name) {
        continue;
      }

      statusApplication.decreaseDuration();

      if (statusApplication.isOver()) {
        // Remove the status
        this.statusApplications.splice(i--, 1);
      }
    }
  }

  /**
   * Apply all DOT and HOT to the creature and log a single message.
   */
  applyDotsAndHots() {
    let hasAtLeastOneDotOrHot: boolean = false;

    // Compute the total amount of damage and heal
    let amount: number = 0;
    this.statusApplications.forEach(statusApplication => {
      if (statusApplication.originCreature != null) {
        if (statusApplication.isDot()) {
          hasAtLeastOneDotOrHot = true;
          amount -= computeEffectiveDamage(statusApplication.originCreature, this, statusApplication.power, false).amount;
        } else if (statusApplication.isHot()) {
          hasAtLeastOneDotOrHot = true;
          amount += computeEffectiveHeal(statusApplication.originCreature, this, statusApplication.power).amount;
        }
      }
    });

    if (hasAtLeastOneDotOrHot) {
      const lifeChange = this.changeLife(new LifeChange(Math.abs(amount), LifeChangeEfficiency.NORMAL, amount >= 0 ? LifeChangeType.GAIN : LifeChangeType.LOSS));

      // Log the total amount of life lost of gained, but do not display the critical type
      if (amount >= 0) {
        logs.addCreatureLog(LogType.Hot, this, null, lifeChange, null);
      } else if (amount < 0) {
        logs.addCreatureLog(LogType.Dot, this, null, lifeChange, null);
      }
    }
  }

  clearStatusApplications() {
    this.statusApplications = [];
  }
}

/**
 * A special creature only used to mark the end of a round in thr turn order panel.
 */
export class EndOfRound extends Creature {

  constructor() {
    super('End of round', CreatureClass.END_OF_ROUND, 1, 1, 0, []);
  }

  isCharacter(): boolean {
    return false;
  }

  isEnemy(): boolean {
    return false;
  }

  isEndOfRound(): boolean {
    return true;
  }
}

/**
 * An enemy actions.
 */
export class EnemyAction {

  constructor(
    // The executed skill
    public skill: Skill,
    // The target characters, if any
    public targetCreatures: Creature[]) {
  }
}

