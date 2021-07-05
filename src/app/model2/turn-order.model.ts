import {Creature} from "./creature.model";

/**
 * The action order of all creatures (i.e. characters and enemies) during a turn.
 * After a turn was played, the current order shifts by one creature.
 */
export class TurnOrder {
  /**
   * Current turn order, the active creature if the first one.
   */
  currentOrder: Creature[] = [];
}
