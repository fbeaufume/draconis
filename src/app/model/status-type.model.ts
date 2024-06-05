import {ElementType, StatusExpirationType, StatusTypeTagType} from './common.model';

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

  elementType: ElementType;

  constructor(melee: boolean, dotType: StatusType, power: number, duration: number, elementType: ElementType) {
    super(melee);
    this.dotType = dotType;
    this.power = power;
    this.duration = duration;
    this.elementType = elementType;
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

  elementType: ElementType;

  constructor(melee: boolean, statusType: StatusType, duration: number, elementType: ElementType) {
    super(melee);
    this.statusType = statusType;
    this.duration = duration;
    this.elementType = elementType;
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

export enum StatusTypeName {
  DEFEND,
  BLEED,
  POISON,
  BURN,
  REGENERATION,
  COMBO_1,
  COMBO_2,
  ATTACK,
  DEFENSE,
  FIRE_TRAP,
  ICE_TRAP,
  BLADE_SHIELD
}

/**
 * An immutable status descriptor.
 * Should be an enumeration if they were properly implemented in TypeScript.
 */
export class StatusType {

  /**
   * Name of the status.
   */
  name: StatusTypeName;

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
    name: StatusTypeName,
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
export const defend = new StatusType(StatusTypeName.DEFEND, true, StatusExpirationType.ORIGIN_CREATURE_TURN_START, false);
export const bleed = new StatusType(StatusTypeName.BLEED, false, StatusExpirationType.END_OF_ROUND, true,
  [StatusTypeTagType.DOT]);
export const poison = new StatusType(StatusTypeName.POISON, false, StatusExpirationType.END_OF_ROUND, true,
  [StatusTypeTagType.DOT]);
export const burn = new StatusType(StatusTypeName.BURN, false, StatusExpirationType.END_OF_ROUND, true,
  [StatusTypeTagType.DOT]);
export const regeneration = new StatusType(StatusTypeName.REGENERATION, true, StatusExpirationType.END_OF_ROUND, true,
  [StatusTypeTagType.HOT]);
export const combo1 = new StatusType(StatusTypeName.COMBO_1, false, StatusExpirationType.ORIGIN_CREATURE_TURN_END, true);
export const combo2 = new StatusType(StatusTypeName.COMBO_2, false, StatusExpirationType.ORIGIN_CREATURE_TURN_END, true);
export const attackBonus = new StatusType(StatusTypeName.ATTACK, true, StatusExpirationType.ORIGIN_CREATURE_TURN_START, false);
export const attackMalus = new StatusType(StatusTypeName.ATTACK, false, StatusExpirationType.ORIGIN_CREATURE_TURN_START, false);
export const defenseBonus = new StatusType(StatusTypeName.DEFENSE, true, StatusExpirationType.ORIGIN_CREATURE_TURN_START, false);
export const defenseMalus = new StatusType(StatusTypeName.DEFENSE, false, StatusExpirationType.ORIGIN_CREATURE_TURN_START, false);
export const fireTrap = new StatusType(StatusTypeName.FIRE_TRAP, true, StatusExpirationType.ORIGIN_CREATURE_TURN_START, false,
  [], [new ApplyDotStatusEffect(true, burn, 0.25, 3, ElementType.FIRE)]);
export const iceTrap = new StatusType(StatusTypeName.ICE_TRAP, true, StatusExpirationType.ORIGIN_CREATURE_TURN_START, false,
  [], [new ApplyStatusStatusEffect(true, attackMalus, 2, ElementType.ICE), new ApplyStatusStatusEffect(true, defenseMalus, 2, ElementType.ICE)]);
export const reflectMeleeDamage = new StatusType(StatusTypeName.BLADE_SHIELD, true, StatusExpirationType.ORIGIN_CREATURE_TURN_START, false,
  [], [new ReflectDamageStatusEffect(true, 0.5)]);
