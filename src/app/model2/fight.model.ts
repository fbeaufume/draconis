import {Opposition} from "./opposition.model";
import {Party} from "./party.model";
import {TurnOrder} from "./turn-order.model";
import {Creature} from "./creature.model";
import {Character} from "./character.model";
import {Skill} from "./skill.model";
import {Enemy} from "./enemy.model";

/**
 * A fight between the party and and an opposition.
 */
export class Fight {

  /**
   * The current round ID.
   */
  round: number = 1;

  party: Party;

  opposition: Opposition;

  turnOrder: TurnOrder;

  /**
   * The currently active character or enemy.
   */
  activeCreature: Creature | null;

  /**
   * The character under the mouse pointer during the selection of a character.
   */
  hoveredCharacter: Character | null;

  /**
   * The skill currently under the mouse pointer during the selection of a skill.
   */
  hoveredSkill: Skill | null;

  /**
   * The skill currently displayed in the focus skill panel.
   */
  focusedSkill: Skill | null;

  /**
   * Skill selected by the player for the currently active character.
   */
  selectedSkill: Skill | null;

  /**
   * The enemy under the mouse pointer during the selection of an enemy.
   */
  hoveredEnemy: Enemy | null;

  /**
   * The creatures targeted by the chosen skill of the active creature.
   */
  targetCreatures: Creature[] = [];

  constructor(
    party: Party,
    opposition: Opposition,
  ) {
    this.turnOrder = new TurnOrder(party, this.opposition);
  }
}
