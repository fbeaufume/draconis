// Core model classes of the application

// The party location in the "world"
export class PartyLocation {

  constructor(
    public region: string,
    public zone: string,
    public room: string
  ) {
  }
}

// A character skill
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

// Base class for enemies and characters
export abstract class Creature {

  life: number;

  lifePercent: number;

  // Bonuses, a.k.a. "buffs"
  // bonuses: string[] = [];

  // Maluses, a.k.a. "debuffs"
  // maluses: string[] = [];

  protected constructor(
    public  isCharacter: boolean,
    public name: string,
    public lifeMax: number
  ) {
    this.life = lifeMax;
    this.updateLifePercent();
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

// An enemy
export class Enemy extends Creature {

  constructor(name: string, lifeMax: number, public damage: number) {
    super(false, name, lifeMax);
  }
}

// A group of enemies
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

// A party character
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
    super(true, name, lifeMax);

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

// The player party
export class Party {

  constructor(
    // Front row characters
    public row1Characters: Character[],
    // Back row characters
    public row2Characters: Character[]) {
  }
}

// The action order of characters and enemies during a turn
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
