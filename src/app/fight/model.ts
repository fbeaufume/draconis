// The model classes of the application

// The player party
export class Party {

  constructor(
    // Front row characters
    public row1Characters: Character[],
    // Back row characters
    public row2Characters: Character[]) {
  }
}

// A party character
export class Character {

  life: number;

  lifePercent: number;

  // Current mana or tech points (depends on the character class)
  energy: number;

  energyPercent: number;

  // Character bonuses, a.k.a. "buffs"
  bonuses: string[] = [];

  // Character bonuses, a.k.a. "debuffs"
  maluses: string[] = [];

  constructor(
    public name: string,
    // Character class, could be an enum
    public clazz: string,
    public level: number,
    public lifeMax: number,
    public useMana: boolean,
    // Max mana or tech points (depends on the character class)
    public energyMax: number) {
    this.life = lifeMax;
    this.lifePercent = 100 * this.life / lifeMax;

    this.energy = energyMax;
    this.energyPercent = 100 * this.energy / energyMax;
  }
}
