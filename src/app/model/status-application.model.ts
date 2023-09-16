import {Creature} from "./creature.model";
import {StatusType} from "./status-type.model";
import {ElementType, StatusTypeTagType} from "./common.model";

/**
 * A status applied to a creature, such as damage over time, an attack bonus, etc.
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

  /**
   * The element type of this status application. Can be used to reduce the inflicted damage done to resistant creatures.
   */
  elementType: ElementType;

  constructor(
    statusType: StatusType,
    power: number,
    originCreature: Creature | null,
    remainingDuration: number,
    elementType: ElementType
  ) {
    this.statusType = statusType;
    this.power = power;
    this.originCreature = originCreature;
    this.remainingDuration = remainingDuration;
    this.elementType = elementType;
  }

  isImprovement(): boolean {
    return this.statusType.improvement;
  }

  hasTagType(tagType: StatusTypeTagType): boolean {
    return this.statusType.hasTagType(tagType);
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
