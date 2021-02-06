// Fight related classes

import {attack, bigAttack, defend, heal, Skill} from './skill.model';
import {Character, Creature, EndOfRound, Enemy, Opposition, Party} from './misc.model';

/**
 * The current step in the fight workflow.
 * Used to enable of disable the selection of a target skill, enemy or character.
 * When some numeric values are changed, update accordingly the call to 'usePointerForStep' in fight.component.html.
 */
export enum FightStep {
  // Before the fight starts (displays the "Start fight" button)
  BEFORE_START,
  // Between creature turns
  END_OF_TURN,
  // Enemy turn
  ENEMY_TURN,
  // Character turn, the player must select a skill
  SELECT_SKILL,
  // Character turn, the player must select an enemy (for example as the target of an attack or debuff)
  SELECT_ENEMY,
  // Character turn, the player must select a character (for example as the target of a heal or buff)
  SELECT_CHARACTER,
  // Executing the player skill
  EXECUTING_SKILL,
  PARTY_VICTORY,
}

/**
 * The action order of characters and enemies during a turn.
 */
export class TurnOrder {

  // Turn order with all creatures
  initialOrder: Creature[] = [];

  // Turn order with active (e.g. living) living creatures
  currentOrder: Creature[] = [];

  constructor(
    party: Party,
    opposition: Opposition) {
    // Initialize the initial turn order with all characters and enemies
    this.initialOrder.push(...party.rows[0].characters);
    this.initialOrder.push(...party.rows[1].characters);
    this.initialOrder.push(...opposition.rows[0].enemies);
    this.initialOrder.push(...opposition.rows[1].enemies);
    this.initialOrder.push(...opposition.rows[2].enemies);
    TurnOrder.shuffle(this.initialOrder); // Shuffle the creatures

    // Initialize the current turn order
    this.currentOrder.push(opposition.rows[0].enemies[0]);
    this.currentOrder.push(party.rows[0].characters[0]);
    this.currentOrder.push(party.rows[0].characters[1]);
    this.currentOrder.push(party.rows[0].characters[2]);
    this.currentOrder.push(opposition.rows[0].enemies[1]);
    this.currentOrder.push(party.rows[1].characters[0]);
    this.currentOrder.push(party.rows[1].characters[1]);
    this.currentOrder.push(party.rows[1].characters[2]);

    // Add a special creature to mark the end of round
    this.currentOrder.push(new EndOfRound());
  }

  private static shuffle(array: Creature[]) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  nextCreature() {
    const creature = this.currentOrder[0];
    this.currentOrder.copyWithin(0, 1);
    this.currentOrder[this.currentOrder.length - 1] = creature;
  }

  removeDeadEnemies() {
    for (let i = 0; i < this.currentOrder.length; i++) {
      const creature = this.currentOrder[i];

      if (creature.life <= 0 && creature instanceof Enemy) {
        this.currentOrder.splice(i, 1);
      }
    }
  }
}

/**
 * All things related to a fight: party, opposition, active character, target enemy, etc.
 */
export class Fight {

  step: FightStep = FightStep.BEFORE_START;

  round: number = 0;

  // Currently using the same skills for all characters
  skills: Skill[] = [
    attack,
    defend,
    bigAttack,
    heal,
  ];

  party: Party = new Party([], []);

  opposition: Opposition = new Opposition([], [], []);

  turnOrder: TurnOrder;

  activeCharacter: Character | null;

  // The character under the mouse pointer during the selection of a character
  hoveredCharacter: Character | null;

  // The character targeted by a skill (from a character or an enemy)
  targetCharacter: Character | null;

  // The skill currently under the mouse pointer during the selection of a skill
  hoveredSkill: Skill | null;

  // The skill currently displayed in the focus skill panel
  focusedSkill: Skill | null;

  // Skill selected by the player
  selectedSkill: Skill | null;

  activeEnemy: Enemy | null;

  // The enemy under the mouse pointer during the selection of an enemy
  hoveredEnemy: Enemy | null;

  // The enemy targeted by a skill (from a character or an enemy)
  targetEnemy: Enemy | null;

  initialize() {
    this.step = FightStep.BEFORE_START;
    this.round = 1;

    this.party = new Party([
        new Character('Cyl', 'Rogue', 1, 20, false, 50, this.skills),
        new Character('Melkan', 'Warrior', 1, 20, false, 50, this.skills),
        new Character('Arwin', 'Paladin', 1, 20, true, 50, this.skills)],
      [
        new Character('Faren', 'Archer', 1, 20, false, 50, this.skills),
        new Character('Harika', 'Mage', 1, 20, true, 50, this.skills),
        new Character('Nairo', 'Priest', 1, 20, true, 50, this.skills)
      ]);

    this.opposition = new Opposition([
      new Enemy('Wolf A', 15, 4),
      new Enemy('Wolf B', 15, 4)
    ], [], []);

    this.activeCharacter = null;
    this.targetCharacter = null;
    this.hoveredSkill = null;
    this.focusedSkill = null;
    this.selectedSkill = null;
    this.activeEnemy = null;
    this.hoveredEnemy = null;
    this.targetEnemy = null;

    this.turnOrder = new TurnOrder(this.party, this.opposition);
  }
}
