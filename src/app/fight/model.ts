// The model classes of the application

// The player party
export class Party {

  characters: Character[];

  constructor(characters: Character[]) {
    this.characters = characters;
  }
}

// A party character
export class Character {

  name: string;

  // Character class, could be an enum
  clazz: string;

  level: number;

  life: number;

  lifeMax: number;

  // Current mana or tech points (depends on the character class)
  energy: number;

  // Max mana or tech points (depends on the character class)
  energyMax: number;

  // Character bonuses, a.k.a. "buffs"
  bonuses: string[] = [];

  // Character bonuses, a.k.a. "debuffs"
  maluses: string[] = [];

  constructor(name: string, clazz: string, level: number, life: number, lifeMax: number, energy: number, energyMax: number) {
    this.name = name;
    this.clazz = clazz;
    this.level = level;
    this.life = life;
    this.lifeMax = lifeMax;
    this.energy = energy;
    this.energyMax = energyMax;
  }
}
