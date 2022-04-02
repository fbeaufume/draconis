import {StatusExpirationType, StatusTypeTagType} from "./common.model";

/**
 * This base class describes an effects that can be applied when a creature (that has the status of this effect) is involved
 * by a skill execution. For example, it may reflect part of the received damage back to the attacker.
 */
export abstract class StatusEffect {

  /**
   * Is this status effect only triggered by melee attacks.
   */
  melee: boolean;

  protected constructor(melee: boolean) {
    this.melee = melee;
  }
}

/**
 * A status effect that applies a damage-over-time to the attacker.
 */
export class ApplyDotStatusEffect extends StatusEffect {

  /**
   * The type of damage-over-time to apply.
   */
  dotType: StatusType;

  /**
   * The power of the damage-over-time.
   */
  power: number;

  /**
   * The duration, in rounds, of the applied damage-over-time.
   */
  duration: number;

  constructor(melee: boolean, dotType: StatusType, power: number, duration: number) {
    super(melee);
    this.dotType = dotType;
    this.power = power;
    this.duration = duration;
  }
}

/**
 * A status effect that applies a status to the attacker.
 */
export class ApplyStatusStatusEffect extends StatusEffect {

  /**
   * The type of status to apply.
   */
  statusType: StatusType;

  /**
   * The duration, in rounds, of the applied status.
   */
  duration: number;

  constructor(melee: boolean, statusType: StatusType, duration: number) {
    super(melee);
    this.statusType = statusType;
    this.duration = duration;
  }
}

/**
 * A status effect that reflects part of the received damages back to the attacker.
 */
export class ReflectDamageStatusEffect extends StatusEffect {

  /**
   * The percentage of the reflected damage. 0.5 means 50%.
   */
  percentage: number;


  constructor(melee: boolean, percentage: number) {
    super(melee);
    this.percentage = percentage;
  }
}

/**
 * An immutable status descriptor.
 * Should be an enumeration if they were properly implemented in TypeScript.
 */
export class StatusType {

  /**
   * Name of the status.
   */
  name: String;

  /**
   * True for a positive status, false otherwise.
   */
  improvement: boolean;

  /**
   * The expiration type of the status
   */
  expirationType: StatusExpirationType;

  /**
   * Can the status be applied multiple times (but only by different creatures).
   */
  cumulative: boolean;

  /**
   * The status type tags.
   */
  tagTypes: StatusTypeTagType[];

  /**
   * The effects triggered by this status.
   */
  statusEffects: StatusEffect[];

  constructor(
    name: string,
    improvement: boolean,
    expirationType: StatusExpirationType,
    cumulative: boolean,
    tagTypes: StatusTypeTagType[] = [],
    statusEffects: StatusEffect[] = []
  ) {
    this.name = name;
    this.improvement = improvement;
    this.expirationType = expirationType;
    this.cumulative = cumulative;
    this.tagTypes = tagTypes;
    this.statusEffects = statusEffects;
  }

  /**
   * Return true if this status type has a given tag type.
   */
  hasTagType(tagType: StatusTypeTagType): boolean {
    return this.tagTypes.includes(tagType);
  }
}

// The supported statuses
// When a new status is added, update status.component.html
export const defend = new StatusType('Defend', true, StatusExpirationType.ORIGIN_CREATURE_TURN_START, false);
export const bleed = new StatusType('Bleed', false, StatusExpirationType.END_OF_ROUND, true,
  [StatusTypeTagType.DOT]);
export const poison = new StatusType('Poison', false, StatusExpirationType.END_OF_ROUND, true,
  [StatusTypeTagType.DOT]);
export const burn = new StatusType('Burn', false, StatusExpirationType.END_OF_ROUND, true,
  [StatusTypeTagType.DOT]);
export const regeneration = new StatusType('Regeneration', true, StatusExpirationType.END_OF_ROUND, true,
  [StatusTypeTagType.HOT]);
export const combo1 = new StatusType('Combo1', false, StatusExpirationType.ORIGIN_CREATURE_TURN_END, true);
export const combo2 = new StatusType('Combo2', false, StatusExpirationType.ORIGIN_CREATURE_TURN_END, true);
export const attackBonus = new StatusType('Attack', true, StatusExpirationType.ORIGIN_CREATURE_TURN_START, false);
export const attackMalus = new StatusType('Attack', false, StatusExpirationType.ORIGIN_CREATURE_TURN_START, false);
export const defenseBonus = new StatusType('Defense', true, StatusExpirationType.ORIGIN_CREATURE_TURN_START, false);
export const defenseMalus = new StatusType('Defense', false, StatusExpirationType.ORIGIN_CREATURE_TURN_START, false);
export const fireTrap = new StatusType('Fire Trap', true, StatusExpirationType.ORIGIN_CREATURE_TURN_START, false,
  [], [new ApplyDotStatusEffect(true, burn, 0.25, 3)]);
export const iceTrap = new StatusType('Ice Trap', true, StatusExpirationType.ORIGIN_CREATURE_TURN_START, false,
  [], [new ApplyStatusStatusEffect(true, attackMalus, 2), new ApplyStatusStatusEffect(true, defenseMalus, 2)]);
export const reflectMeleeDamage = new StatusType('Blade Shield', true, StatusExpirationType.ORIGIN_CREATURE_TURN_START, false,
  [], [new ReflectDamageStatusEffect(true, 0.5)]);
