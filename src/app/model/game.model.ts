// Classes for the whole game and fights

import {
  Character,
  Creature,
  DistanceEnemy,
  DragonEnemy,
  EndOfRound,
  Enemy,
  HealerEnemy,
  MeleeEnemy,
  Opposition,
  Party
} from './creature.model';
import {
  blast,
  burn,
  heal,
  holyStrike,
  magicDefend,
  monkHeal,
  monkRevive,
  preciseShot,
  revive,
  shot,
  Skill,
  smash,
  spark,
  strike,
  techDefend,
} from './skill.model';

/**
 * Number of character rows.
 */
export const PARTY_ROWS = 2;

/**
 * Number of characters per row.
 */
export const PARTY_ROW_SIZE = 3;

/**
 * Number of characters in the party.
 */
export const PARTY_SIZE = PARTY_ROWS * PARTY_ROW_SIZE;

/**
 * Number of enemy rows.
 */
export const OPPOSITION_ROWS = 3;

/**
 * Maximum number of enemies per row.
 */
export const OPPOSITION_ROW_SIZE = 4;

/**
 * A pause duration preset, in msec.
 */
export const PAUSE_SHORT = 100;

/**
 * A pause duration preset, in msec.
 */
export const PAUSE_LONG = 800;

/**
 * The action order of characters and enemies during a turn.
 */
export class TurnOrder {
  // Turn order with active (e.g. living) living creatures
  currentOrder: Creature[] = [];

  constructor(
    party: Party,
    opposition: Opposition) {
    if (opposition.countAliveCreatures() <= 0) {
      // At the beginning of a dungeon, there is no opposition,
      // so we do not display any turn order
      return;
    }

    this.initialize(party, opposition);

    // Add a special creature to mark the end of round
    this.currentOrder.push(new EndOfRound());
  }

  /**
   * Build a good order of characters and enemies:
   * - Good interleave of characters and monsters
   * - Party healers must not evenly distributed
   */
  initialize(party: Party, opposition: Opposition) {
    // Shuffle the party damage dealers
    const partyDealers: Character[] = [party.rows[0].characters[0], party.rows[1].characters[0], party.rows[1].characters[1]];
    TurnOrder.shuffle(partyDealers);

    // Shuffle the party healers
    const partyHealers: Character[] = [party.rows[0].characters[1], party.rows[0].characters[2], party.rows[1].characters[2]];
    TurnOrder.shuffle(partyHealers);

    // Aggregate all party characters
    const characters: Character[] = [partyDealers[0], partyHealers[0], partyDealers[1], partyHealers[1], partyDealers[2], partyHealers[2]];

    // Shuffle the enemies
    const enemies: Enemy[] = [];
    //
    for (let i = 0; i < OPPOSITION_ROWS; i++) { // Iterate over rows
      for (let j = 0; j < opposition.rows[i].enemies.length; j++) { // Iterate over creatures
        for (let k = 0; k < opposition.rows[i].enemies[j].actions; k++) { // Iterate over actions
          enemies.push(opposition.rows[i].enemies[j]);
        }
      }
    }
    TurnOrder.shuffle(enemies);

    // Interleave all creatures
    const bigFaction = enemies.length > PARTY_SIZE ? enemies : characters;
    const smallFaction = enemies.length > PARTY_SIZE ? characters : enemies;
    let smallFactionPos = 0;
    for (let i = 0; i < bigFaction.length; i++) {
      this.currentOrder.push(bigFaction[i]);

      // From time to time we add a member of the small faction to the turn order
      if (((smallFactionPos + 1) / smallFaction.length) <= ((i + 1) / bigFaction.length)) {
        this.currentOrder.push(smallFaction[smallFactionPos++]);
      }
    }
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

  round: number = 1;

  turnOrder: TurnOrder;

  // The currently active character or enemy
  activeCreature: Creature | null;

  // The character under the mouse pointer during the selection of a character
  hoveredCharacter: Character | null;

  // The skill currently under the mouse pointer during the selection of a skill
  hoveredSkill: Skill | null;

  // The skill currently displayed in the focus skill panel
  focusedSkill: Skill | null;

  // Skill selected by the player
  selectedSkill: Skill | null;

  // The enemy under the mouse pointer during the selection of an enemy
  hoveredEnemy: Enemy | null;

  // The creatures targeted by the chosen skill of the active character or enemy
  targetCreatures: Creature[] = [];

  constructor(
    party: Party,
    public opposition: Opposition,
  ) {
    this.activeCreature = null;
    this.hoveredSkill = null;
    this.focusedSkill = null;
    this.selectedSkill = null;
    this.hoveredEnemy = null;
    this.targetCreatures = [];

    this.turnOrder = new TurnOrder(party, this.opposition);

    this.updateEnemies();
  }

  /**
   * Give each enemy some information about the fight.
   * Used for example to: check skills range, advance toward characters, etc.
   */
  private updateEnemies() {
    for (let i = 0; i < this.opposition.rows.length; i++) {
      const row = this.opposition.rows[i];
      row.enemies.forEach(enemy => {
        enemy.distance = i + 1;
      });
    }
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

/**
 * Dungeon base class. A dungeon is where the fights happen. It is a succession of encounters.
 */
export class Dungeon {

  constructor(
    public name: string,
    public oppositions: Opposition[]
  ) {
  }
}

/**
 * Basic dungeon used during application development.
 */
class DevDungeon extends Dungeon {

  constructor() {
    super('Dev Dungeon', [
      new Opposition([
        new MeleeEnemy('Enemy 1', 5, 8),
        new MeleeEnemy('Enemy 2', 5, 8),
        new MeleeEnemy('Enemy 3', 5, 8),
      ], [], []),
      new Opposition([
        new MeleeEnemy('Enemy 4', 5, 8),
        new MeleeEnemy('Enemy 5', 5, 8),
        new MeleeEnemy('Enemy 6', 5, 8),
      ], [], []),
    ]);
  }
}

/**
 * A simple forest themed dungeon.
 */
class FangForestDungeon extends Dungeon {

  constructor() {
    super('Fang Forest', [
      new Opposition([
        new MeleeEnemy('Bear A', 38, 7),
        new MeleeEnemy('Bear B', 38, 7),
      ], [], []),
      new Opposition([
        new MeleeEnemy('Wolf A', 24, 5),
        new MeleeEnemy('Wolf B', 24, 5),
      ], [
        new MeleeEnemy('Wolf C', 24, 5),
        new MeleeEnemy('Wolf D', 24, 5),
        new MeleeEnemy('Wolf E', 24, 5),
      ], [
        new MeleeEnemy('Wolf F', 24, 5),
      ]),
      new Opposition([
        new MeleeEnemy('Goblin Solder A', 32, 7),
        new MeleeEnemy('Goblin Solder B', 32, 7),
      ], [
        new DistanceEnemy('Goblin Hunter', 28, 8),
        new HealerEnemy('Goblin Shaman', 24, 8),
      ], []),
      new Opposition([
        new DragonEnemy('Green Dragon', 120, 8, 2),
      ], [], []),
    ]);
  }
}

/**
 * The current state in the game workflow.
 * Used to enable or disable action buttons, the selection of a target skill, enemy or character, etc
 * When some numeric values are changed, update accordingly the calls to 'usePointerForState' in fight.component.html.
 */
export enum GameState {
  // Waiting for the player to start the next encounter: display no opposition but a "Continue" button
  START_NEXT_ENCOUNTER,
  // Waiting for the player to start the fight
  START_FIGHT,
  // Between creature turns
  END_OF_TURN,
  // Enemy turn
  ENEMY_TURN,
  // Character turn, the player must select a skill
  SELECT_SKILL,
  // Character turn, the player must select an enemy
  SELECT_ENEMY,
  // Character turn, the player must select a character
  SELECT_CHARACTER,
  // Executing the player skill
  EXECUTING_SKILL,
  // Cleared the dungeon
  DUNGEON_END,
}

/**
 * All states when it is ok for the player to choose a character skill, possibly to change his mind.
 */
export const canSelectSkillStates = [GameState.SELECT_SKILL, GameState.SELECT_ENEMY, GameState.SELECT_CHARACTER];

/**
 * The party location in the "world".
 */
export class Game {

  state: GameState = GameState.START_NEXT_ENCOUNTER;

  region: string = '';

  // Zero when not fighting, otherwise one-based identifier of the opposition in the dungeon
  oppositionId: number = 0;

  party: Party = new Party([
      new Character('Melkan', 'Warrior', 4, 20, false, 50, 10, [
        techDefend, strike, smash
      ]),
      new Character('Cyl', 'Monk', 4, 20, false, 50, 10, [
        techDefend, strike, monkHeal, monkRevive
      ]),
      new Character('Arwin', 'Paladin', 4, 20, true, 50, 10, [
        magicDefend, holyStrike, heal, revive
      ])],
    [
      new Character('Faren', 'Archer', 4, 20, false, 50, 10, [
        techDefend, shot, preciseShot
      ]),
      new Character('Harika', 'Mage', 4, 20, true, 50, 10, [
        magicDefend, burn, blast
      ]),
      new Character('Nairo', 'Priest', 4, 20, true, 50, 10, [
        magicDefend, spark, heal, revive
      ])
    ]);

  dungeons: Dungeon[] = [new DevDungeon(), new FangForestDungeon()];
  dungeon: Dungeon = this.dungeons[1];

  fight: Fight = new Fight(this.party, new Opposition([], [], []));

  constructor() {
    this.region = this.dungeon.name;
  }

  get opposition(): Opposition {
    return this.fight.opposition;
  }

  hasNextEncounter(): boolean {
    return this.oppositionId < this.dungeon.oppositions.length;
  }

  startNextEncounter() {
    this.state = GameState.START_FIGHT;

    this.oppositionId++;

    this.party.restoreTechPoints();

    this.fight = new Fight(this.party, this.dungeon.oppositions[this.oppositionId - 1]);
  }
}
