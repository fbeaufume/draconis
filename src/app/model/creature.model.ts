import {computeEffectiveDamage, computeEffectiveHeal, Skill, Wait} from './skill.model';
import {logs} from './log.model';
import {Constants} from './constants.model';
import {
  Class,
  CreatureClass,
  CreatureType,
  FactionType,
  LifeChangeEfficiency,
  LifeChangeType,
  LogType,
  StatusExpirationType,
  StatusTypeTagType
} from "./common.model";
import {StatusType} from "./status-type.model";
import {LifeChange} from "./life-change.model";
import {StatusApplication} from "./status-application.model";
import {Passive, Regeneration} from "./passive.model";

/**
 * Base class for enemies and characters.
 */
export abstract class Creature {

  /**
   * The faction type of the creature.
   */
  factionType: FactionType;

  /**
   * The type of creature.
   */
  type: CreatureType;

  /**
   * The effective creature name.
   * For a character it is the character name.
   * For an enemy ist may contain a letter to differentiate multiple enemies of the same name,
   * e.g. "Goblin A" and "Goblin B".
   */
  name: string

  /**
   * The character class or 'enemy' for enemies or 'end-round' for the end of round special creature.
   */
  clazz: CreatureClass

  /**
   * The maximum life amount.
   */
  lifeMax: number;

  /**
   * The current life amount.
   */
  life: number;

  /**
   * The current life percent.
   */
  lifePercent: number;

  /**
   * Damages or heals received this turn as a result or other creatures actions and displayed in a popup.
   */
  lifeChange: LifeChange | null = null;

  /**
   * Damages or heals received this turn as a result of the action of this creature,
   * e.g. damage received while attacking creatures with a thorn passive.
   * Is converted into lifeChange at the end of the creature turn.
   * Note that contrary to other life or energy amount, this amount is not round.
   */
  selfLifeChangeAmount: number = 0;

  /**
   * Maximum mana or tech points (depends on the character class) (currently only used by characters).
   */
  energyMax: number;

  /**
   * Current mana or tech points (depends on the character class) (currently only used by characters).
   */
  energy: number;

  /**
   * The current energy percent.
   */
  energyPercent: number;

  /**
   * Generic power of the creature, used to compute damage or heal amounts.
   */
  power: number;

  /**
   * Creature skills (currently only used by characters).
   */
  skills: Skill[];

  /**
   * The specialties are the creature types this creature is strong against (deals extra damage and receive less damage).
   */
  specialties: CreatureType[];

  /**
   * Passive skills of the creature.
   */
  passives: Passive[];

  /**
   * The distance between the enemy and the party, i.e. 1 means the opposition front row, 2 means the middle row, 3 the back row
   * Not in the Enemy class to prevent circular dependency issues.
   */
  distance: number = 1;

  /**
   * Dodge chance, 0.1 means 10% dodge chance.
   */
  dodgeChance: number = Constants.DODGE_CHANCE;

  /**
   * Critical hit chance, 0.1 means 10% critical hit chance.
   */
  criticalChance: number = Constants.CRITICAL_CHANCE;

  /**
   * Critical hit bonus, 1.5 means 50% extra hit or heal.
   */
  criticalBonus: number = Constants.CRITICAL_BONUS;

  /**
   * Applied statuses.
   */
  statusApplications: StatusApplication[] = [];

  protected constructor(
    factionType: FactionType,
    type: CreatureType,
    name: string,
    clazz: CreatureClass,
    lifeMax: number,
    energyMax: number,
    power: number,
    skills: Skill[],
    specialties: CreatureType[] = []
  ) {
    this.factionType = factionType;
    this.type = type;
    this.name = name;
    this.clazz = clazz;
    this.lifeMax = lifeMax;
    this.life = lifeMax;
    this.energyMax = energyMax;
    this.energy = energyMax;
    this.power = power;
    this.skills = skills;
    this.specialties = specialties;
    this.passives = [];
    this.updateLifePercent();
  }

  abstract isCharacter(): boolean;

  abstract isEnemy(): boolean;

  abstract isEndOfRound(): boolean;

  isSameFactionThan(creature: Creature) {
    return this.factionType === creature.factionType;
  }

  isAlive(): boolean {
    return this.life > 0;
  }

  isDead(): boolean {
    return !this.isAlive();
  }

  isFullLife(): boolean {
    return !this.isDamaged();
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
    this.selfLifeChangeAmount = 0;
  }

  addSelfLifeChangeAmount(amount: number) {
    this.selfLifeChangeAmount += amount;
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

  /**
   * Return true is the creature is in the front row of its faction.
   */
  isInFrontRow(): boolean {
    return this.distance == 1;
  }

  /**
   * Reduce the cooldown of all skills by one.
   */
  decreaseCooldowns() {
    this.skills.forEach(skill => skill.reduceCooldown());
  }

  /**
   * Return true if this creature has the specialty of the target creature.
   */
  hasSpecialtyOfCreature(creature: Creature): boolean {
    return this.specialties.includes(creature.type);
  }

  addPassive(passive: Passive) {
    this.passives.push(passive);
  }

  /**
   * Get all passives of a certain type.
   */
  getPassivesOfType<T extends Passive>(type: Class<T>): T[] {
    let passives:T[] = [];
    this.passives.forEach(passive => {
      if (passive instanceof type) {
        passives.push(passive);
      }
    });
    return passives;
  }

  getPositiveStatuses(): StatusApplication[] {
    return this.statusApplications.filter(sa => sa.isImprovement());
  }

  getNegativeStatuses(): StatusApplication[] {
    return this.statusApplications.filter(sa => !sa.isImprovement());
  }

  /**
   * Return all status applications from status types using a given tag.
   */
  getStatusApplicationsByTag(tagType: StatusTypeTagType): StatusApplication[] {
    return this.statusApplications.filter(statusApplication => statusApplication.hasTagType(tagType));
  }

  hasStatus(status: StatusType): boolean {
    return this.statusApplications.map(s => s.statusType.name).includes(status.name);
  }

  hasPositiveStatus(status: StatusType): boolean {
    return this.getPositiveStatuses().map(s => s.statusType.name).includes(status.name);
  }

  hasNegativeStatus(status: StatusType): boolean {
    return this.getNegativeStatuses().map(s => s.statusType.name).includes(status.name);
  }

  /**
   * Add a status to the creature.
   */
  applyStatus(statusApplication: StatusApplication) {
    // Do we have to add the new status
    let addStatus: boolean = true;

    // Remove the current status if necessary
    this.statusApplications = this.statusApplications.filter(s => {
      if (s.statusType.name != statusApplication.statusType.name) {
        // Keep other statuses
        return true;
      }

      if (statusApplication.statusType.cumulative && s.getOriginCreatureName() != statusApplication.getOriginCreatureName()) {
        // Keep cumulative statuses from other creatures
        return true;
      }

      if (statusApplication.remainingDuration >= s.remainingDuration) {
        // The new status has the same duration or is longer, so we use it instead of the current one
        return false;
      } else {
        // The new status has a shorter duration, so we keep the current status
        addStatus = false;
        return true;
      }
    });

    if (addStatus) {
      this.statusApplications.push(statusApplication);
    }
  }

  /**
   * Reduce the remaining duration of all statuses that use a given expiration type and remove the expired ones.
   */
  decreaseStatusesDuration(expirationType: StatusExpirationType, originCreature: Creature | null = null) {
    for (let i = 0; i < this.statusApplications.length; i++) {
      const statusApplication = this.statusApplications[i];

      if (statusApplication.statusType.expirationType != expirationType) {
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
    let foundSomething: boolean = false;

    // The total amount of damage and heal
    let amount: number = 0;

    // Use the DOT statuses
    this.getStatusApplicationsByTag(StatusTypeTagType.DOT).forEach(statusApplication => {
      if (statusApplication.originCreature != null) {
        foundSomething = true;
        amount -= computeEffectiveDamage(null, statusApplication.originCreature, this, statusApplication.power, true).amount;
      }
    })

    // Use the HOT statuses
    this.getStatusApplicationsByTag(StatusTypeTagType.HOT).forEach(statusApplication => {
      if (statusApplication.originCreature != null) {
        foundSomething = true;
        amount += computeEffectiveHeal(statusApplication.originCreature, this, statusApplication.power).amount;
      }
    })

    // Use the regeneration passives
    this.getPassivesOfType(Regeneration).forEach(passive => {
      foundSomething = true;
      amount += computeEffectiveHeal(this, this, passive.powerLevel).amount;
    });

    if (foundSomething) {
      const lifeChange = this.changeLife(new LifeChange(Math.abs(amount), LifeChangeEfficiency.NORMAL, amount >= 0 ? LifeChangeType.GAIN : LifeChangeType.LOSS));

      // Log the total amount of life lost of gained, but do not display the critical type
      if (amount > 0) {
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
    super(FactionType.OTHER, CreatureType.OTHER, 'End of round', CreatureClass.END_OF_ROUND, 1, 1, 0, []);
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
 * An enemy action.
 */
export class EnemyAction {

  /**
   * The executed skill.
   */
  skill: Skill;

  /**
   * The creatures targeted by the skill, if any.
   */
  targetCreatures: Creature[];

  constructor(
    skill: Skill,
    targetCreatures: Creature[]) {
    this.skill = skill;
    this.targetCreatures = targetCreatures;
  }
}

/**
 * Default action used when no other action can be used.
 */
export const defaultEnemyAction: EnemyAction = new EnemyAction(new Wait(), []);
