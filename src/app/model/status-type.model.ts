import {StatusExpiration} from "./common.model";
import {Constants} from "./constants.model";

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
  expiration: StatusExpiration;

  /**
   * Total duration in turns.
   */
  totalDuration: number;

  /**
   * Can the status be applied multiple times (but only by different creatures).
   */
  cumulative: boolean;

  constructor(
    name: string,
    improvement: boolean,
    expiration: StatusExpiration,
    totalDuration: number,
    cumulative: boolean
  ) {
    this.name = name;
    this.improvement = improvement;
    this.expiration = expiration;
    this.totalDuration = totalDuration;
    this.cumulative = cumulative;
  }
}

// The supported statuses
export const defend = new StatusType('Defend', true, StatusExpiration.ORIGIN_CREATURE_TURN_START, Constants.DEFEND_DURATION, false);
export const bleed = new StatusType('Bleed', false, StatusExpiration.END_OF_ROUND, Constants.EFFECT_DURATION, true);
export const poison = new StatusType('Poison', false, StatusExpiration.END_OF_ROUND, Constants.EFFECT_DURATION, true);
export const regen = new StatusType('Regen', true, StatusExpiration.END_OF_ROUND, Constants.EFFECT_DURATION, true);
export const combo1 = new StatusType('Combo1', false, StatusExpiration.ORIGIN_CREATURE_TURN_END, Constants.COMBO_DURATION, true);
export const combo2 = new StatusType('Combo2', false, StatusExpiration.ORIGIN_CREATURE_TURN_END, Constants.COMBO_DURATION, true);
export const attackBonus = new StatusType('Attack', true, StatusExpiration.ORIGIN_CREATURE_TURN_START, Constants.EFFECT_DURATION, false);
export const attackMalus = new StatusType('Attack', false, StatusExpiration.ORIGIN_CREATURE_TURN_START, Constants.EFFECT_DURATION, false);
export const defenseBonus = new StatusType('Defense', true, StatusExpiration.ORIGIN_CREATURE_TURN_START, Constants.EFFECT_DURATION, false);
export const defenseMalus = new StatusType('Defense', false, StatusExpiration.ORIGIN_CREATURE_TURN_START, Constants.EFFECT_DURATION, false);
