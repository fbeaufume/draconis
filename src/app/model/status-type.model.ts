import {StatusExpirationType, StatusTypeTagType} from "./common.model";

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
   * TODO FBE implement
   */
  //statusesForAttackers: TODO[];

  constructor(
    name: string,
    improvement: boolean,
    expirationType: StatusExpirationType,
    cumulative: boolean,
    tagTypes: StatusTypeTagType[] = []
  ) {
    this.name = name;
    this.improvement = improvement;
    this.expirationType = expirationType;
    this.cumulative = cumulative;
    this.tagTypes = tagTypes;
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
export const bleed = new StatusType('Bleed', false, StatusExpirationType.END_OF_ROUND, true, [StatusTypeTagType.DOT]);
export const poison = new StatusType('Poison', false, StatusExpirationType.END_OF_ROUND, true, [StatusTypeTagType.DOT]);
export const burn = new StatusType('Burn', false, StatusExpirationType.END_OF_ROUND, true, [StatusTypeTagType.DOT]);
export const regen = new StatusType('Regen', true, StatusExpirationType.END_OF_ROUND, true, [StatusTypeTagType.HOT]);
export const combo1 = new StatusType('Combo1', false, StatusExpirationType.ORIGIN_CREATURE_TURN_END, true);
export const combo2 = new StatusType('Combo2', false, StatusExpirationType.ORIGIN_CREATURE_TURN_END, true);
export const attackBonus = new StatusType('Attack', true, StatusExpirationType.ORIGIN_CREATURE_TURN_START, false);
export const attackMalus = new StatusType('Attack', false, StatusExpirationType.ORIGIN_CREATURE_TURN_START, false);
export const defenseBonus = new StatusType('Defense', true, StatusExpirationType.ORIGIN_CREATURE_TURN_START, false);
export const defenseMalus = new StatusType('Defense', false, StatusExpirationType.ORIGIN_CREATURE_TURN_START, false);
export const fireTrapBonus = new StatusType('Fire Trap', true, StatusExpirationType.ORIGIN_CREATURE_TURN_START, false, [StatusTypeTagType.APPLY_DOT]);
export const iceTrapBonus = new StatusType('Ice Trap', true, StatusExpirationType.ORIGIN_CREATURE_TURN_START, false, [StatusTypeTagType.APPLY_DETERIORATION]);
export const bladeShieldBonus = new StatusType('Blade Shield', true, StatusExpirationType.ORIGIN_CREATURE_TURN_START, false, [StatusTypeTagType.REFLECT_DAMAGE]);
