import {StatusExpiration} from "./common.model";
import {COMBO_DURATION, DEFEND_DURATION, EFFECT_DURATION} from "./constants.model";

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
    expiration: StatusExpiration,
    totalDuration: number,
    cumulative: boolean
  ) {
    this.name = name;
    this.expiration = expiration;
    this.totalDuration = totalDuration;
    this.cumulative = cumulative;
  }
}

// The supported statuses
export const defend = new StatusType('Defend', StatusExpiration.ORIGIN_CREATURE_TURN_START, DEFEND_DURATION, false);
export const bleed = new StatusType('Bleed', StatusExpiration.END_OF_ROUND, EFFECT_DURATION, true);
export const poison = new StatusType('Poison', StatusExpiration.END_OF_ROUND, EFFECT_DURATION, true);
export const regen = new StatusType('Regen', StatusExpiration.END_OF_ROUND, EFFECT_DURATION, true);
export const combo1 = new StatusType('Combo1', StatusExpiration.ORIGIN_CREATURE_TURN_END, COMBO_DURATION, true);
export const combo2 = new StatusType('Combo2', StatusExpiration.ORIGIN_CREATURE_TURN_END, COMBO_DURATION, true);
export const attack = new StatusType('Attack', StatusExpiration.ORIGIN_CREATURE_TURN_START, EFFECT_DURATION, false);
export const defense = new StatusType('Defense', StatusExpiration.ORIGIN_CREATURE_TURN_START, EFFECT_DURATION, false);
