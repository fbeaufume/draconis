import {Creature} from "./creature.model";
import {Party} from "./party.model";
import {Opposition} from "./opposition.model";

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
