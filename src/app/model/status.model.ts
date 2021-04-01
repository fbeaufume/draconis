// Status related classes

import {StatusExpiration} from "./common.model";
import {Creature} from "./creature.model";
import {COMBO_DURATION, DEFEND_DURATION, EFFECT_DURATION} from "./constants.model";

/**
 * An immutable status descriptor.
 */
export class Status {

  constructor(
    public name: string,
    // The expiration type of the status
    public expiration: StatusExpiration,
    // Total duration in turns
    public totalDuration: number,
    // Can the status be applied multiple times (but only by different creatures)
    public cumulative: boolean
  ) {
  }
}

// The supported statuses
export const defend = new Status('Defend', StatusExpiration.CREATURE_TURN, DEFEND_DURATION, false);
export const bleed = new Status('Bleed', StatusExpiration.END_OF_ROUND, EFFECT_DURATION, true);
export const poison = new Status('Poison', StatusExpiration.END_OF_ROUND, EFFECT_DURATION, true);
export const regen = new Status('Regen', StatusExpiration.END_OF_ROUND, EFFECT_DURATION, true);
export const combo1 = new Status('Combo1', StatusExpiration.ORIGIN_CREATURE_TURN_END, COMBO_DURATION, true);
export const combo2 = new Status('Combo2', StatusExpiration.ORIGIN_CREATURE_TURN_END, COMBO_DURATION, true);
export const attack = new Status('Attack', StatusExpiration.ORIGIN_CREATURE_TURN_START, EFFECT_DURATION, false);
export const defense = new Status('Defense', StatusExpiration.ORIGIN_CREATURE_TURN_START, EFFECT_DURATION, false);

/**
 * A status applied to a creature, such as a life change over time, an attack or defense modification, etc.
 */
export class StatusApplication {

  // Remaining duration in turns
  remainingDuration: number;

  constructor(
    public status: Status,
    // True for a positive status, false otherwise
    public improvement: boolean,
    // For a life over time change, the power of the attack
    public power: number,
    // The creature that inflicted the status
    public originCreature: Creature | null
  ) {
    this.remainingDuration = status.totalDuration;
  }

  isDot(): boolean {
    return this.status == bleed || this.status == poison;
  }

  isHot(): boolean {
    return this.status == regen;
  }

  decreaseDuration() {
    this.remainingDuration--;
  }

  isOver(): boolean {
    return this.remainingDuration <= 0;
  }

  getOriginCreatureName(): string {
    return (this.originCreature && this.originCreature.name) || '';
  }
}
