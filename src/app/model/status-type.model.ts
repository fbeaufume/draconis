import {StatusExpirationType} from "./common.model";

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
   * Is this status a damage over time.
   */
  isDot: boolean;

  /**
   * Is this status a heal over time.
   */
  isHot: boolean;

  /**
   * Is this status a reflected damage.
   */
  isReflectedDamage: boolean;

  constructor(
    name: string,
    improvement: boolean,
    expirationType: StatusExpirationType,
    cumulative: boolean,
    isDot: boolean,
    isHot: boolean,
    isReflectedDamage: boolean
  ) {
    this.name = name;
    this.improvement = improvement;
    this.expirationType = expirationType;
    this.cumulative = cumulative;
    this.isDot = isDot;
    this.isHot = isHot;
    this.isReflectedDamage = isReflectedDamage;
  }
}

// The supported statuses
// When a new status is added, update status.component.html
export const defend = new StatusType('Defend', true, StatusExpirationType.ORIGIN_CREATURE_TURN_START, false, false, false, false);
export const bleed = new StatusType('Bleed', false, StatusExpirationType.END_OF_ROUND, true, true, false, false);
export const poison = new StatusType('Poison', false, StatusExpirationType.END_OF_ROUND, true, true, false, false);
export const burn = new StatusType('Burn', false, StatusExpirationType.END_OF_ROUND, true, true, false, false);
export const regen = new StatusType('Regen', true, StatusExpirationType.END_OF_ROUND, true, false, true, false);
export const combo1 = new StatusType('Combo1', false, StatusExpirationType.ORIGIN_CREATURE_TURN_END, true, false, false, false);
export const combo2 = new StatusType('Combo2', false, StatusExpirationType.ORIGIN_CREATURE_TURN_END, true, false, false, false);
export const attackBonus = new StatusType('Attack', true, StatusExpirationType.ORIGIN_CREATURE_TURN_START, false, false, false, false);
export const attackMalus = new StatusType('Attack', false, StatusExpirationType.ORIGIN_CREATURE_TURN_START, false, false, false, false);
export const defenseBonus = new StatusType('Defense', true, StatusExpirationType.ORIGIN_CREATURE_TURN_START, false, false, false, false);
export const defenseMalus = new StatusType('Defense', false, StatusExpirationType.ORIGIN_CREATURE_TURN_START, false, false, false, false);
export const fireTrapBonus = new StatusType('Fire Trap', true, StatusExpirationType.ORIGIN_CREATURE_TURN_START, false, false, false, true);
