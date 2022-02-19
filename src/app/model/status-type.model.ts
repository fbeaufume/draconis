import {StatusExpirationType, StatusTypeTagType} from "./common.model";

/**
 * This base class describes an effects that can be applied when a creature (that has the status of this effect) is involved
 * by a skill execution. For example, it may reflect part of the received damage back to the attacker.
 */
export abstract class StatusEffect {

  /**
   * The range of the attacks that trigger this effect:
   * - 0 is the range is not used
   * - 1 for melee attacks only
   * - 2 for melee or distance attacks
   */
  attackRange: number;

  constructor(attackRange: number) {
    this.attackRange = attackRange;
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

  constructor(attackRange: number, dotType: StatusType, power: number, duration: number) {
    super(attackRange);
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

  constructor(attackRange: number, statusType: StatusType, duration: number) {
    super(attackRange);
    this.statusType = statusType;
    this.duration = duration;
  }
}

/**
 * A status effect that reflects part of the received damages back to the attacker.
 */
export class ReflectDamageStatusEffect extends StatusEffect {

  // TODO FBE
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
export const regen = new StatusType('Regen', true, StatusExpirationType.END_OF_ROUND, true,
  [StatusTypeTagType.HOT]);
export const combo1 = new StatusType('Combo1', false, StatusExpirationType.ORIGIN_CREATURE_TURN_END, true);
export const combo2 = new StatusType('Combo2', false, StatusExpirationType.ORIGIN_CREATURE_TURN_END, true);
export const attackBonus = new StatusType('Attack', true, StatusExpirationType.ORIGIN_CREATURE_TURN_START, false);
export const attackMalus = new StatusType('Attack', false, StatusExpirationType.ORIGIN_CREATURE_TURN_START, false);
export const defenseBonus = new StatusType('Defense', true, StatusExpirationType.ORIGIN_CREATURE_TURN_START, false);
export const defenseMalus = new StatusType('Defense', false, StatusExpirationType.ORIGIN_CREATURE_TURN_START, false);
export const fireTrapBonus = new StatusType('Fire Trap', true, StatusExpirationType.ORIGIN_CREATURE_TURN_START, false,
  [], [new ApplyDotStatusEffect(1, burn, 0.25, 3)]);
export const iceTrapBonus = new StatusType('Ice Trap', true, StatusExpirationType.ORIGIN_CREATURE_TURN_START, false,
  [], [new ApplyStatusStatusEffect(1, attackMalus, 2), new ApplyStatusStatusEffect(1, defenseMalus, 2)]);
export const bladeShieldBonus = new StatusType('Blade Shield', true, StatusExpirationType.ORIGIN_CREATURE_TURN_START, false,
  [StatusTypeTagType.REFLECT_DAMAGE]);
