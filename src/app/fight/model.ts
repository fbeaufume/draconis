// Core model classes of the application

/**
 * The party location in the "world".
 */
export class PartyLocation {

  constructor(
    public region: string,
    public zone: string,
    public room: string
  ) {
  }
}

/**
 * A character skill.
 */
export class Skill {

  constructor(
    public name: string,
    // Skill cost, in energy points
    public cost: number,
    // Skill range in number of rows, 0 if not applicable
    public range: number,
    public coolDown: number,
    public damage: number,
    public description: string
  ) {
  }
}

/**
 * Base class for enemies and characters.
 */
export abstract class Creature {

  life: number;

  lifePercent: number;

  // Bonuses, a.k.a. "buffs"
  // bonuses: string[] = [];

  // Maluses, a.k.a. "debuffs"
  // maluses: string[] = [];

  protected constructor(
    public name: string,
    public lifeMax: number
  ) {
    this.life = lifeMax;
    this.updateLifePercent();
  }

  isCharacter(): boolean {
    return this instanceof Character;
  }

  isEnemy(): boolean {
    return this instanceof Enemy;
  }

  isEndOfRound(): boolean {
    return this instanceof EndOfRound;
  }

  updateLifePercent() {
    this.lifePercent = 100 * this.life / this.lifeMax;
  }

  inflictDamage(amount: number) {
    this.life -= amount;

    // Enforce min and max values
    if (this.life < 0) {
      this.life = 0;
    }
    if (this.life > this.lifeMax) {
      this.life = this.lifeMax;
    }

    this.updateLifePercent();
  }
}

/**
 * An enemy.
 */
export class Enemy extends Creature {

  constructor(name: string, lifeMax: number, public damage: number) {
    super(name, lifeMax);
  }
}

/**
 * A group of enemies.
 */
export class Opposition {

  constructor(
    // First row enemies
    public row1Enemies: Enemy[],
    // Second row enemies
    public row2Enemies: Enemy[],
    // Third row enemies
    public row3Enemies: Enemy[]) {
  }
}

/**
 * A party character.
 */
export class Character extends Creature {

  // Current mana or tech points (depends on the character class)
  energy: number;

  energyPercent: number;

  constructor(
    name: string,
    // Character class, could be an enum
    public clazz: string,
    public level: number,
    lifeMax: number,
    // True for mana based character class, false for tech based
    public useMana: boolean,
    // Max mana or tech points (depends on the character class)
    public energyMax: number,
    public skills: Skill[],
  ) {
    super(name, lifeMax);

    this.energy = energyMax;
    this.updateEnergyPercent();
  }

  updateEnergyPercent() {
    this.energyPercent = 100 * this.energy / this.energyMax;
  }

  useSkill(skill: Skill) {
    this.energy -= skill.cost;

    // Enforce min and max values
    if (this.energy < 0) {
      this.energy = 0;
    }

    this.updateEnergyPercent();
  }
}

/**
 * The player party.
 */
export class Party {

  constructor(
    // Front row characters
    public row1Characters: Character[],
    // Back row characters
    public row2Characters: Character[]) {
  }
}

/**
 * A special creature only used to mark the end of a round in thr turn order panel.
 */
export class EndOfRound extends Creature {

  constructor() {
    super("- End of round -", 0);
  }
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
    this.initialOrder.push(...party.row1Characters);
    this.initialOrder.push(...party.row2Characters);
    this.initialOrder.push(...opposition.row1Enemies);
    this.initialOrder.push(...opposition.row2Enemies);
    this.initialOrder.push(...opposition.row3Enemies);
    TurnOrder.shuffle(this.initialOrder); // Shuffle the creatures

    // Initialize the current turn order
    this.currentOrder.push(opposition.row1Enemies[0]);
    this.currentOrder.push(party.row1Characters[0]);
    // this.currentOrder.push(party.row1Characters[1]);
    // this.currentOrder.push(party.row1Characters[2]);
    // this.currentOrder.push(opposition.row1Enemies[1]);
    // this.currentOrder.push(party.row2Characters[0]);
    // this.currentOrder.push(party.row2Characters[1]);
    // this.currentOrder.push(party.row2Characters[2]);

    // Add a special creature to mark the end of round
    this.currentOrder.push(new EndOfRound())
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
}

/**
 * The current step in the fight workflow.
 * Used to enable of disable the selection of a target skill, enemy or character.
 */
export enum FightStep {
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
}
