import {Creature} from "./creature.model";
import {StatusType} from "./status-type.model";

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
    // TODO FBE remove the status.totalDuration attribute and initialize this.remainingDuration from a constructor parameter
    this.remainingDuration = status.totalDuration;
  }

  isImprovement(): boolean {
    return this.status.improvement;
  }

  isDot(): boolean {
    return this.status.isDot;
  }

  isHot(): boolean {
    return this.status.isHot;
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
