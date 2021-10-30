import {Creature} from "./creature.model";
import {StatusType} from "./status-type.model";

/**
 * A status applied to a creature, such as a life change over time, an attack or defense modification, etc.
 */
export class StatusApplication {

  /**
   * The status type.
   */
  statusType: StatusType;

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
    statusType: StatusType,
    power: number,
    originCreature: Creature | null,
    remainingDuration: number
  ) {
    this.statusType = statusType;
    this.power = power;
    this.originCreature = originCreature;
    this.remainingDuration = remainingDuration;
  }

  isImprovement(): boolean {
    return this.statusType.improvement;
  }

  isDot(): boolean {
    return this.statusType.isDot;
  }

  isHot(): boolean {
    return this.statusType.isHot;
  }

  isReflectedDamage(): boolean {
    return this.statusType.isReflectedDamage;
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
