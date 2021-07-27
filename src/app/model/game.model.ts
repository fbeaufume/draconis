// Classes for the whole game and fights

import {Creature, EndOfRound} from './creature.model';
import {CreatureClass, CreatureType, GameState, SkillIconType, SkillTarget} from "./common.model";
import {Character} from "./character.model";
import {Party} from "./party.model";
import {settings} from "./settings.model";
import {
  BleedMeleeEnemy,
  DistanceEnemy,
  DragonEnemy,
  Enemy,
  HealerEnemy,
  LeechMeleeEnemy,
  MeleeEnemy,
  OldManEnemy,
  PoisonMeleeEnemy
} from "./enemy.model";
import {Opposition} from "./opposition.model";
import {Constants} from "./constants.model";
import {attackMalus, defenseMalus} from "./status-type.model";
import {
  ApplyStatus,
  ComboDamage,
  Damage,
  DamageAndBleed,
  DamageAndDamage,
  DamageAndHeal,
  DamageAndPoison,
  DefendMagic,
  DefendTech,
  DualHeal, FullLifeDamage,
  Heal,
  Regenerate,
  Revive,
  Skill,
  Strike
} from './skill.model';

/**
 * The action order of characters and enemies during a turn.
 */
export class TurnOrder {

  /**
   * Turn order of playable creatures, i.e. characters and living enemies.
   */
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

      if (creature.life <= 0 && creature.isEnemy()) {
        this.currentOrder.splice(i--, 1);
      }
    }
  }
}

/**
 * All things related to a fight: party, opposition, active character, target enemy, etc.
 */
export class Fight {

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

/**
 * Dungeon base class. A dungeon is where the fights happen. It is a succession of encounters.
 */
export class Dungeon {

  name: string;

  oppositions: Opposition[];

  constructor(
    name: string,
    oppositions: Opposition[]
  ) {
    this.name = name;
    this.oppositions = oppositions;
  }
}

/**
 * Test dungeon used during application development.
 */
class TestDungeon extends Dungeon {

  constructor() {
    super('Test Dungeon', [
      new Opposition('some monsters', [
        // new OldManEnemy(CreatureType.HUMANOID, 'Old Man', 24, 14),
        // new DragonEnemy(CreatureType.BEAST, 'Green Dragon', 120, 10, 2),
        new MeleeEnemy(CreatureType.OTHER, 'Monster 1', 1, 8),
        new MeleeEnemy(CreatureType.OTHER, 'Monster 2', 1, 8),
        // new MeleeEnemy(CreatureType.OTHER, Monster 3', 20, 8),
        // new MeleeEnemy(CreatureType.OTHER, 'Monster 4', 2, 5),
      ], [
        new MeleeEnemy(CreatureType.OTHER, 'Monster 5', 50, 8),
        new MeleeEnemy(CreatureType.OTHER, 'Monster 6', 50, 8),
        // new MeleeEnemy(CreatureType.OTHER, Monster 7', 50, 8),
        // new MeleeEnemy(CreatureType.OTHER, 'Monster 8', 50, 8),
      ]),
      new Opposition('some monsters', [
        new MeleeEnemy(CreatureType.OTHER, 'Monster 1', 5, 8),
        new MeleeEnemy(CreatureType.OTHER, 'Monster 2', 5, 8),
        new MeleeEnemy(CreatureType.OTHER, 'Monster 3', 5, 8),
      ], []),
    ]);
  }
}

/**
 * A forest themed dungeon.
 */
class FangForestDungeon extends Dungeon {

  constructor() {
    super('Fang Forest', [
      new Opposition('wild bears', [
        new BleedMeleeEnemy(CreatureType.BEAST, 'Bear A', 34, 8),
        new BleedMeleeEnemy(CreatureType.BEAST, 'Bear B', 34, 8),
      ]),
      new Opposition('a pack of wolves', [
        new MeleeEnemy(CreatureType.BEAST, 'Wolf A', 22, 7),
      ], [
        new MeleeEnemy(CreatureType.BEAST, 'Wolf B', 22, 7),
        new MeleeEnemy(CreatureType.BEAST, 'Wolf C', 22, 7),
        new MeleeEnemy(CreatureType.BEAST, 'Wolf D', 22, 7),
      ]),
      new Opposition('a mysterious old man', [
        new OldManEnemy(CreatureType.HUMANOID, 'Old Man', 28, 12, 2)
      ]),
      new Opposition('a band of goblins', [
        new MeleeEnemy(CreatureType.HUMANOID, 'Goblin Solder A', 22, 6),
        new MeleeEnemy(CreatureType.HUMANOID, 'Goblin Solder B', 22, 6),
        new MeleeEnemy(CreatureType.HUMANOID, 'Goblin Solder C', 22, 6),
      ], [
        new DistanceEnemy(CreatureType.HUMANOID, 'Goblin Hunter', 24, 7),
        new HealerEnemy(CreatureType.HUMANOID, 'Goblin Shaman', 26, 7),
      ]),
      new Opposition('a young but fierce green dragon', [
        new DragonEnemy(CreatureType.BEAST, 'Green Dragon', 120, 10, 2),
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
        new MeleeEnemy(CreatureType.UNDEAD, 'Skeleton A', 18, 7),
        new MeleeEnemy(CreatureType.UNDEAD, 'Skeleton B', 18, 7),
      ], [
        new MeleeEnemy(CreatureType.UNDEAD, 'Skeleton C', 18, 7),
        new MeleeEnemy(CreatureType.UNDEAD, 'Skeleton D', 18, 7),
      ]),
      new Opposition('zombies', [
        new PoisonMeleeEnemy(CreatureType.UNDEAD, 'Zombie A', 28, 8),
        new PoisonMeleeEnemy(CreatureType.UNDEAD, 'Zombie B', 28, 8),
        new PoisonMeleeEnemy(CreatureType.UNDEAD, 'Zombie C', 28, 8),
      ]),
      new Opposition('vampires', [
        new LeechMeleeEnemy(CreatureType.UNDEAD, 'Vampire A', 34, 8),
        new LeechMeleeEnemy(CreatureType.UNDEAD, 'Vampire B', 34, 8),
      ]),
      new Opposition('undeads', [
        new MeleeEnemy(CreatureType.UNDEAD, 'Skeleton A', 18, 7),
        new LeechMeleeEnemy(CreatureType.UNDEAD, 'Vampire', 34, 8),
        new PoisonMeleeEnemy(CreatureType.UNDEAD, 'Zombie', 28, 8),
      ], [
        new MeleeEnemy(CreatureType.UNDEAD, 'Skeleton B', 18, 7),
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
      new Character('Melkan', CreatureClass.WARRIOR, 4, 30, false, 50, 8, [
          new DefendTech(),
          new Strike('Strike'),
          new DamageAndDamage(SkillIconType.ATTACK, 'Fury Strike', SkillTarget.ENEMY_SINGLE, 15, 1, 0,
            'Inflict 140% damage to the target and 30% damage to self.', [1.4, 0.3]),
          new DamageAndBleed(SkillIconType.ATTACK, 'Deep Wound', SkillTarget.ENEMY_SINGLE, 20, 1, 0,
            'Inflict 50% damage to the target and 120% damage over ' + Constants.EFFECT_DURATION + ' rounds.', [0.5, 0.4]),
          new Damage(SkillIconType.ATTACK, 'Slash', SkillTarget.ENEMY_DOUBLE, 20, 1, 0,
            'Inflict 80% damage to two adjacent targets.', [0.8]),
          new ApplyStatus(SkillIconType.DETERIORATION, 'Intimidate', SkillTarget.ENEMY_SINGLE, 20, 1, 0,
            'Reduce the enemy attack by 20% during ' + Constants.EFFECT_DURATION + ' rounds.', [], attackMalus, false),
        ],
        [CreatureType.HUMANOID]),
      new Character('Arwin', CreatureClass.PALADIN, 4, 30, true, 50, 8, [
          new DefendMagic(),
          new Damage(SkillIconType.ATTACK, 'Holy Strike', SkillTarget.ENEMY_SINGLE, 5, 1, 0,
            'Inflict 100% damage.'),
          new DamageAndHeal(SkillIconType.ATTACK, 'Recovery Strike', SkillTarget.ENEMY_SINGLE, 10, 1, 0,
            'Inflict 100% damage to the target and heal self for 50% damage.', [1.0, 0.5]),
          new Heal(SkillIconType.HEAL, 'Heal', SkillTarget.CHARACTER_ALIVE, 5, 0, 0,
            'Heal a character for 100% damage.'),
          new DualHeal(SkillIconType.HEAL, 'Dual Heal', SkillTarget.CHARACTER_OTHER, 10, 0, 0,
            'Heal a character for 100% damage and self for 80% damage.', [1, 0.8]),
          new Regenerate(SkillIconType.HEAL, 'Regenerate', SkillTarget.CHARACTER_ALIVE, 5, 0, 0,
            'Heal a character for 50% damage and 120% damage over ' + Constants.EFFECT_DURATION + ' rounds.', [0.5, 0.4]),
          new Heal(SkillIconType.HEAL, 'Heal All', SkillTarget.CHARACTER_ALL_ALIVE, 20, 0, 0,
            'Heal all characters for 50% damage.', [0.5]),
          new Revive(SkillIconType.HEAL, 'Revive', SkillTarget.CHARACTER_DEAD, 20, 0, 0,
            'Revive a character with 50% life.'),
        ],
        [CreatureType.UNDEAD])
    ],
    [
      new Character('Faren', CreatureClass.ARCHER, 4, 30, false, 50, 8, [
          new DefendTech(),
          new FullLifeDamage(SkillIconType.ATTACK, 'First Shot', SkillTarget.ENEMY_SINGLE, 10, 2, 0,
            'Inflict 100% damage. Add 50% damage if the target is full life.', [1.0, 1.5]),
          new DamageAndPoison(SkillIconType.ATTACK, 'Viper Shot', SkillTarget.ENEMY_SINGLE, 15, 2, 0,
            'Inflict 50% damage to the target and 120% damage over ' + Constants.EFFECT_DURATION + ' rounds.', [0.5, 0.4]),
          new ComboDamage(SkillIconType.ATTACK, 'Combo Shot', SkillTarget.ENEMY_SINGLE, 10, 1, 0,
            'Inflict 80% damage then 120% then 160% when used on the same target during consecutive turns.', [0.8, 1.2, 1.6]),
          new Damage(SkillIconType.ATTACK, 'Explosive Shot', SkillTarget.ENEMY_TRIPLE, 20, 2, 0,
            'Inflict 60% damage to three adjacent targets.', [0.6]),
          new ApplyStatus(SkillIconType.DETERIORATION, 'Crippling Shot', SkillTarget.ENEMY_SINGLE, 10, 2, 0,
            'Reduce the enemy defense by 20% during ' + Constants.EFFECT_DURATION + ' rounds.', [], defenseMalus, false),
        ],
        [CreatureType.BEAST]),
      new Character('Harika', CreatureClass.MAGE, 4, 30, true, 50, 8, [
          new DefendMagic(),
          new Damage(SkillIconType.ATTACK, 'Lightning', SkillTarget.ENEMY_SINGLE, 5, 2, 0,
            'Inflict 100% damage.'),
          new Damage(SkillIconType.ATTACK, 'Fireball', SkillTarget.ENEMY_TRIPLE, 10, 2, 0,
            'Inflict 60% damage to three adjacent targets.', [0.6]),
          new ApplyStatus(SkillIconType.DETERIORATION, 'Weakness', SkillTarget.ENEMY_SINGLE, 10, 2, 0,
            'Reduce the enemy attack by 20% during ' + Constants.EFFECT_DURATION + ' rounds.', [], attackMalus, false),
          new ApplyStatus(SkillIconType.DETERIORATION, 'Slow', SkillTarget.ENEMY_SINGLE, 10, 2, 0,
            'Reduce the enemy defense by 20% during ' + Constants.EFFECT_DURATION + ' rounds.', [], defenseMalus, false),
        ],
        [CreatureType.ELEMENTAL])
    ]);

  dungeons: Dungeon[] = [new TestDungeon(), new FangForestDungeon(), new ForgottenGraveyardDungeon()];
  dungeon: Dungeon = this.dungeons[settings.dungeon] || this.dungeons[1] || this.dungeons[0];

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
