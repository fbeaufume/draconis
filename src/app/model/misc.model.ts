// The rest of the model classes

import {Skill} from './skill.model';

/**
 * The party location in the "world".
 */
export class PartyLocation {

  constructor(
    public region: string,
    public fight: number
  ) {
  }
}

/**
 * Base class for enemies and characters.
 */
export abstract class Creature {

  life: number;

  lifePercent: number;

  // TODO FBE support buffs
  // Bonuses, a.k.a. "buffs"
  // bonuses: string[] = [];

  // TODO FBE support debuffs
  // Maluses, a.k.a. "debuffs"
  // maluses: string[] = [];

  protected constructor(
    public name: string,
    public lifeMax: number
  ) {
    this.life = lifeMax;
    this.updateLifePercent();
  }

  abstract isCharacter(): boolean;

  abstract isEnemy(): boolean;

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

  isCharacter(): boolean {
    return true;
  }

  isEnemy(): boolean {
    return false;
  }

  updateEnergyPercent() {
    this.energyPercent = 100 * this.energy / this.energyMax;
  }

  spendEnergy(cost: number) {
    this.energy -= cost;

    // Enforce min and max values
    if (this.energy < 0) {
      this.energy = 0;
    }

    this.updateEnergyPercent();
  }
}

/**
 * A row of characters.
 */
export class CharacterRow {

  constructor(public characters: Character[]) {
  }
}

/**
 * The player party.
 */
export class Party {

  rows: CharacterRow[] = [];

  constructor(
    // Front row characters
    row1Characters: Character[],
    // Back row characters
    row2Characters: Character[]) {
    this.rows.push(new CharacterRow(row1Characters));
    this.rows.push(new CharacterRow(row2Characters));
  }
}

/**
 * A special creature only used to mark the end of a round in thr turn order panel.
 */
export class EndOfRound extends Creature {

  constructor() {
    super('- End of round -', 0);
  }

  isCharacter(): boolean {
    return false;
  }

  isEnemy(): boolean {
    return false;
  }
}
