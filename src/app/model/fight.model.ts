import {Opposition} from "./opposition.model";
import {TurnOrder} from "./turn-order.model";
import {Creature} from "./creature.model";
import {Character} from "./character.model";
import {Skill} from "./skill.model";
import {Enemy} from "./enemy.model";
import {Party} from "./party.model";

/**
 * All things related to a fight: party, opposition, active character, target enemy, etc.
 */
export class Fight {

  party: Party;

  opposition: Opposition;

  /**
   * The current round number.
   */
  round: number = 1;

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
   * Skill selected by the player.
   */
  selectedSkill: Skill | null;

  /**
   * The enemy under the mouse pointer during the selection of an enemy.
   */
  hoveredEnemy: Enemy | null;

  /**
   * The creatures targeted by the chosen skill of the active character or enemy.
   */
  targetCreatures: Creature[] = [];

  constructor(
    party: Party,
    opposition: Opposition,
  ) {
    this.party = party;
    this.opposition = opposition;
    this.opposition.updateDistances();
    this.turnOrder = new TurnOrder(party, this.opposition);
    this.activeCreature = null;
    this.hoveredSkill = null;
    this.focusedSkill = null;
    this.selectedSkill = null;
    this.hoveredEnemy = null;
    this.targetCreatures = [];
  }

  getAllEnemies(): Creature[] {
    const creatures: Creature[] = [];
    this.opposition.rows.forEach(row => creatures.push(...row.enemies));
    return creatures;
  }

  /**
   * Is the creature active.
   */
  isActive(creature: Creature): boolean {
    return creature === this.activeCreature;
  }

  /**
   * Is the creature in the target list.
   */
  isTargeted(creature: Creature): boolean {
    for (const tempCreature of this.targetCreatures) {
      if (creature === tempCreature) {
        return true;
      }
    }
    return false;
  }
}
