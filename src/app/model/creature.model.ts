import {computeEffectiveDamage, computeEffectiveHeal, Skill, Wait} from './skill.model';
import {logs} from './log.model';
import {Constants} from './constants.model';
import {
  CreatureClass,
  CreatureType,
  FactionType,
  LogType,
  StatusExpirationType,
  StatusTypeTagType
} from "./common.model";
import {StatusType} from "./status-type.model";
import {LifeChange} from "./life-change.model";
import {StatusApplication} from "./status-application.model";

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
   * Damages and heals received this turn and displayed in a popup.
   */
  lifeChanges: LifeChange[] = [];

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
   * The distance between the creature and the other faction, i.e. 1 means the creature is in the front row, 2 is the back row.
   * Used to check if skill can reach the creature.
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
   * Creature skills (currently only used by characters).
   */
  skills: Skill[];

  /**
   * The specialties are the creature types this creature is strong against (deals extra damage and receive less damage).
   */
  specialties: CreatureType[];

  /**
   * Passive status applications of the creature do not expired.
   */
  passiveStatusApplications: StatusApplication[] = [];

  /**
   * Active status applications have a duration and eventually expire and get removed.
   */
  activeStatusApplications: StatusApplication[] = [];

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
    this.lifeMax = Creature.ensurePositiveAndRounded(lifeMax);
    this.life = this.lifeMax;
    this.energyMax = energyMax;
    this.energy = this.energyMax;
    this.power = Creature.ensurePositiveAndRounded(power);
    this.skills = skills;
    this.specialties = specialties;
    this.updateLifePercent();
  }

  /**
   * Return an integer with a minimum valuer of 1.
   */
  private static ensurePositiveAndRounded(amount: number): number {
    return Math.max(Math.ceil(amount), 1);
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
  addLifeChange(lifeChange: LifeChange): LifeChange {
    this.life += lifeChange.getSignedAmount();

    this.lifeChanges.push(lifeChange);

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
    this.lifeChanges = [];
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

  addPassiveStatusApplication(statusApplication: StatusApplication) {
    this.passiveStatusApplications.push(statusApplication);
  }

  /**
   * Used by the UI to display the positive active statuses.
   */
  getPositiveStatusApplications(): StatusApplication[] {
    return this.activeStatusApplications.filter(sa => sa.isImprovement());
  }

  /**
   * Used by the UI to display the negative active statuses.
   */
  getNegativeStatusApplications(): StatusApplication[] {
    return this.activeStatusApplications.filter(sa => !sa.isImprovement());
  }

  /**
   * Return all status application of the creature, i.e. passive ones and active ones.
   */
  getAllStatusApplications(): StatusApplication[] {
    const statusApplications: StatusApplication[] = [];
    statusApplications.push(...this.passiveStatusApplications);
    statusApplications.push(...this.activeStatusApplications);
    return statusApplications;
  }

  /**
   * Return all status applications from status types using a given tag.
   */
  getStatusApplicationsByTag(tagType: StatusTypeTagType): StatusApplication[] {
    return this.getAllStatusApplications().filter(sa => sa.hasTagType(tagType));
  }

  /**
   * Used to check the presence of a status type that is neither positive nor negative, e.g. combo or defend.
   */
  hasStatusType(status: StatusType): boolean {
    return this.getAllStatusApplications().map(sa => sa.statusType.name).includes(status.name);
  }

  /**
   * Used to check the presence of a status type that is positive, e.g. attack bonus or defense bonus.
   */
  hasPositiveStatusType(status: StatusType): boolean {
    return this.getAllStatusApplications().filter(sa => sa.isImprovement()).map(sa => sa.statusType.name).includes(status.name);
  }

  /**
   * Used to check the presence of a status type that is negative, e.g. attack malus or defense malus.
   */
  hasNegativeStatusType(status: StatusType): boolean {
    return this.getAllStatusApplications().filter(sa => !sa.isImprovement()).map(sa => sa.statusType.name).includes(status.name);
  }

  /**
   * Add a status to the creature.
   */
  applyStatus(statusApplication: StatusApplication | null) {
    if (statusApplication == null) {
      return;
    }

    // Do we have to add the new status
    let mustAdd: boolean = true;

    // Remove the current status if necessary
    this.activeStatusApplications = this.activeStatusApplications.filter(sa => {
      // Keep statuses with a different name
      if (sa.statusType.name != statusApplication.statusType.name) {
        return true;
      }

      // Keep statuses with the same name but with a different improvement flag
      if (sa.statusType.improvement != statusApplication.statusType.improvement) {
        return true;
      }

      // Keep cumulative statuses from other creatures
      if (statusApplication.statusType.cumulative && sa.getOriginCreatureName() != statusApplication.getOriginCreatureName()) {
        return true;
      }

      if (statusApplication.remainingDuration >= sa.remainingDuration) {
        // The new status has the same duration or is longer, so we use it instead of the current one
        return false;
      } else {
        // The new status has a shorter duration, so we keep the current status
        mustAdd = false;
        return true;
      }
    });

    if (mustAdd) {
      this.activeStatusApplications.push(statusApplication);
    }
  }

  /**
   * Reduce the remaining duration of all statuses that use a given expiration type and remove the expired ones.
   */
  decreaseStatusesDuration(expirationType: StatusExpirationType, originCreature: Creature | null = null) {
    for (let i = 0; i < this.activeStatusApplications.length; i++) {
      const statusApplication = this.activeStatusApplications[i];

      if (statusApplication.statusType.expirationType != expirationType) {
        continue;
      }

      if (originCreature != null && statusApplication.getOriginCreatureName() != originCreature.name) {
        continue;
      }

      statusApplication.decreaseDuration();
    }

    // Remove all expired statuses
    this.activeStatusApplications = this.activeStatusApplications.filter(sa => !sa.isOver());
  }

  /**
   * Remove all applications of a certain status type.
   */
  removeStatusApplications(statusType: StatusType) {
    this.activeStatusApplications = this.activeStatusApplications.filter(sa => !(sa.statusType.name === statusType.name));
  }

  /**
   * Apply all DOT and HOT to the creature and log a single message.
   */
  applyDotsAndHots() {
    // Use the DOT statuses
    this.getStatusApplicationsByTag(StatusTypeTagType.DOT).forEach(sa => {
      if (sa.originCreature != null) {
        const lifeChange = computeEffectiveDamage(null, sa.originCreature, this, sa.power, true);
        this.addLifeChange(lifeChange);
        logs.addParameterizedLog(LogType.DOT, this, lifeChange);
      }
    })

    // Use the HOT statuses
    this.getStatusApplicationsByTag(StatusTypeTagType.HOT).forEach(sa => {
      if (sa.originCreature != null) {
        const lifeChange = computeEffectiveHeal(sa.originCreature, this, sa.power);
        this.addLifeChange(lifeChange);
        logs.addParameterizedLog(LogType.HOT, this, lifeChange);
      }
    })
  }

  clearStatusApplications() {
    this.activeStatusApplications = [];
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
