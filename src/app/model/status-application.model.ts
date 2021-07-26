import {Creature} from "./creature.model";
import {bleed, poison, regen, StatusType} from "./status-type.model";

/**
 * A status applied to a creature, such as a life change over time, an attack or defense modification, etc.
 */
export class StatusApplication {

  /**
   * The status type.
   */
  status: StatusType;

  /**
   * For a damaging status, such as a life over time change, the power of the attack.
   */
  power: number;

  /**
   * The creature that inflicted the status.
   */
  originCreature: Creature | null;

  /**
   * Remaining duration in turns.
   */
  remainingDuration: number;

  constructor(
    status: StatusType,
    power: number,
    originCreature: Creature | null
  ) {
    this.status = status;
    this.power = power;
    this.originCreature = originCreature;
    this.remainingDuration = status.totalDuration;
  }

  isImprovement(): boolean {
    return this.status.improvement;
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
