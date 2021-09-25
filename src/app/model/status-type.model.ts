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
   * Is this status a damage over time.
   */
  isDot: boolean;

  /**
   * Is this status a heal over time.
   */
  isHot: boolean;

  /**
   * Can the status be applied multiple times (but only by different creatures).
   */
  cumulative: boolean;

  constructor(
    name: string,
    improvement: boolean,
    expirationType: StatusExpirationType,
    isDot: boolean,
    isHot: boolean,
    cumulative: boolean
  ) {
    this.name = name;
    this.improvement = improvement;
    this.expirationType = expirationType;
    this.isDot = isDot;
    this.isHot = isHot;
    this.cumulative = cumulative;
  }
}

// The supported statuses
export const defend = new StatusType('Defend', true, StatusExpirationType.ORIGIN_CREATURE_TURN_START, false, false, false);
export const bleed = new StatusType('Bleed', false, StatusExpirationType.END_OF_ROUND, true, false, true);
export const poison = new StatusType('Poison', false, StatusExpirationType.END_OF_ROUND, true, false, true);
export const burn = new StatusType('Burn', false, StatusExpirationType.END_OF_ROUND, true, false, true);
export const regen = new StatusType('Regen', true, StatusExpirationType.END_OF_ROUND, false, true, true);
export const combo1 = new StatusType('Combo1', false, StatusExpirationType.ORIGIN_CREATURE_TURN_END, false, false, true);
export const combo2 = new StatusType('Combo2', false, StatusExpirationType.ORIGIN_CREATURE_TURN_END, false, false, true);
export const attackBonus = new StatusType('Attack', true, StatusExpirationType.ORIGIN_CREATURE_TURN_START, false, false, false);
export const attackMalus = new StatusType('Attack', false, StatusExpirationType.ORIGIN_CREATURE_TURN_START, false, false, false);
export const defenseBonus = new StatusType('Defense', true, StatusExpirationType.ORIGIN_CREATURE_TURN_START, false, false, false);
export const defenseMalus = new StatusType('Defense', false, StatusExpirationType.ORIGIN_CREATURE_TURN_START, false, false, false);
