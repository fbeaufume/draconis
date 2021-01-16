// The model classes of the application

// Base class for enemies and characters
export class Creature {

  life: number;

  lifePercent: number;

  // Bonuses, a.k.a. "buffs"
  bonuses: string[] = [];

  // Maluses, a.k.a. "debuffs"
  maluses: string[] = [];

  constructor(
    public name: string,
    public lifeMax: number
  ) {
    this.life = lifeMax;
    this.lifePercent = 100 * this.life / lifeMax;
  }
}

// An enemy
export class Enemy extends Creature {

  constructor(name: string, lifeMax: number) {
    super(name, lifeMax);
  }
}

// A group of enemies
export class Group {

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
    public energyMax: number
  ) {
    super(name, lifeMax);

    this.energy = energyMax;
    this.energyPercent = 100 * this.energy / energyMax;
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
