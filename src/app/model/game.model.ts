// Classes for the whole game and fights

import {
  BleederMeleeEnemy,
  Creature,
  DistanceEnemy,
  DragonEnemy,
  EndOfRound,
  Enemy,
  HealerEnemy,
  MeleeEnemy,
  OldManEnemy,
  Opposition,
  Party
} from './creature.model';
import {
  comboShot,
  cripplingShot,
  deepWound,
  dualHeal,
  explosiveShot,
  fireball,
  furyStrike,
  heal,
  healAll,
  holyStrike,
  intimidate,
  lightning,
  magicDefend,
  recoveryStrike,
  regenerate,
  revive,
  shot,
  Skill,
  slash,
  slow,
  strike,
  techDefend,
  viperShot,
  weakness,
} from './skill.model';
import {CreatureClass, GameState, settings} from "./common.model";
import {Character} from "./character.model";

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
   * Build a good order of characters and enemies.
   */
  initialize(party: Party, opposition: Opposition) {
    // Shuffle tha party
    const characters: Character[] = [];
    party.forEachCharacter(character => characters.push(character));
    TurnOrder.shuffle(characters);

    // Shuffle the enemies
    const enemies: Enemy[] = [];
    opposition.forEachEnemy(enemy => {
      // An enemy with N actions is present N times in the turn order
      for (let i = 0; i < enemy.actions; i++) {
        enemies.push(enemy)
      }
    });
    TurnOrder.shuffle(enemies);

    // Interleave all creatures
    const bigFaction = enemies.length > characters.length ? enemies : characters;
    const smallFaction = enemies.length > characters.length ? characters : enemies;
    let smallFactionPos = 0;
    for (let i = 0; i < bigFaction.length; i++) {
      this.currentOrder.push(bigFaction[i]);

      // From time to time we add a member of the small faction to the turn order
      if (((smallFactionPos + 1) / smallFaction.length - 1 / (2 * smallFaction.length)) <= ((i + 1) / bigFaction.length)) {
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
        this.currentOrder.splice(i--, 1);
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

    this.opposition.updateDistances();
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
 * Test dungeon used during application development.
 */
class TestDungeon extends Dungeon {

  constructor() {
    super('Test Dungeon', [
      new Opposition('some monsters', [
        // new OldManEnemy('Old Man', 24, 14),
        // new DragonEnemy('Green Dragon', 120, 10, 2),
        new MeleeEnemy('Monster 1', 1, 8),
        new MeleeEnemy('Monster 2', 1, 8),
        // new MeleeEnemy('Monster 3', 20, 8),
        // new MeleeEnemy('Monster 4', 2, 5),
      ], [
        new MeleeEnemy('Monster 5', 50, 8),
        new MeleeEnemy('Monster 6', 50, 8),
        // new MeleeEnemy('Monster 7', 50, 8),
        // new MeleeEnemy('Monster 8', 50, 8),
      ]),
      new Opposition('some monsters', [
        new MeleeEnemy('Monster 1', 5, 8),
        new MeleeEnemy('Monster 2', 5, 8),
        new MeleeEnemy('Monster 3', 5, 8),
      ], []),
    ])
    ;
  }
}

/**
 * A forest themed dungeon.
 */
class FangForestDungeon extends Dungeon {

  constructor() {
    super('Fang Forest', [
      new Opposition('wild bears', [
        new BleederMeleeEnemy('Bear A', 38, 7),
        new BleederMeleeEnemy('Bear B', 38, 7),
      ]),
      new Opposition('a pack of wolves', [
        new MeleeEnemy('Wolf A', 26, 5),
      ], [
        new MeleeEnemy('Wolf B', 26, 5),
        new MeleeEnemy('Wolf C', 26, 5),
        new MeleeEnemy('Wolf D', 26, 5),
      ]),
      new Opposition('a mysterious old man', [
        new OldManEnemy('Old Man', 28, 12, 2)
      ]),
      new Opposition('a band of goblins', [
        new MeleeEnemy('Goblin Solder A', 32, 7),
        new MeleeEnemy('Goblin Solder B', 32, 7),
        new MeleeEnemy('Goblin Solder C', 32, 7),
      ], [
        new DistanceEnemy('Goblin Hunter', 28, 8),
        new HealerEnemy('Goblin Shaman', 24, 8),
      ]),
      new Opposition('a young but fierce green dragon', [
        new DragonEnemy('Green Dragon', 120, 10, 3),
      ]),
    ]);
  }
}

/**
 * An undead themed dungeon.
 */
class ForgottenGraveyardDungeon extends Dungeon {

  constructor() {
    super('Forgotten Graveyard', [
      new Opposition('skeletons', [
        new MeleeEnemy('Skeleton A', 18, 6),
        new MeleeEnemy('Skeleton B', 18, 6),
      ],[
        new MeleeEnemy('Skeleton C', 18, 6),
        new MeleeEnemy('Skeleton D', 18, 6),
      ]),
    ]);
  }
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
  oppositionId: number = settings.fight - 1;

  party: Party = new Party([
      new Character('Melkan', CreatureClass.WARRIOR, 4, 20, false, 50, 10, [
        techDefend, strike, furyStrike, deepWound, slash, intimidate
      ]),
      new Character('Arwin', CreatureClass.PALADIN, 4, 20, true, 50, 10, [
        magicDefend, holyStrike, recoveryStrike, heal, dualHeal, regenerate, healAll, revive
      ])
    ],
    [
      new Character('Faren', CreatureClass.ARCHER, 4, 20, false, 50, 10, [
        techDefend, shot, comboShot, viperShot, explosiveShot, cripplingShot
      ]),
      new Character('Harika', CreatureClass.MAGE, 4, 20, true, 50, 10, [
        magicDefend, lightning, fireball, weakness, slow
      ])
    ]);

  dungeons: Dungeon[] = [new TestDungeon(), new FangForestDungeon(), new ForgottenGraveyardDungeon()];
  dungeon: Dungeon = this.dungeons[settings.devMode ? 0 : 1];

  fight: Fight = new Fight(this.party, new Opposition(''));

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

    this.party.forEachCharacter(c => c.clearStatusApplications());
    this.party.restoreTechPoints();

    this.fight = new Fight(this.party, this.dungeon.oppositions[this.oppositionId - 1]);
  }
}
