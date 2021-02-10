// The rest of the model classes

import {Skill} from './skill.model';

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

  // Current mana or tech points (depends on the character class) (currently only used by characters)
  energy: number;

  // Max mana or tech points (depends on the character class) (currently only used by characters)
  energyPercent: number;

  // Bonuses, a.k.a. "buffs"
  // bonuses: string[] = [];

  // Maluses, a.k.a. "debuffs"
  // maluses: string[] = [];

  protected constructor(
    public name: string,
    public lifeMax: number,
    public energyMax: number,
    // Generic power of the creature, used to compute damage or heal amounts
    public power: number,
    // Creature skills (currently only used by characters)
    public skills: Skill[]
  ) {
    this.life = lifeMax;
    this.energy = energyMax;
    this.updateLifePercent();
  }

  abstract isCharacter(): boolean;

  abstract isEnemy(): boolean;

  isEndOfRound(): boolean {
    return this instanceof EndOfRound;
  }

  damage(amount: number) {
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

  heal(amount: number) {
    this.damage(-amount);
  }

  updateLifePercent() {
    this.lifePercent = 100 * this.life / this.lifeMax;
  }

  /**
   * Can be used with a negative amount of energy, e.g. when the skill generates some energy.
   */
  spendEnergy(cost: number) {
    this.energy -= cost;

    // Enforce min and max values
    if (this.energy < 0) {
      this.energy = 0;
    }
    if (this.energy > this.energyMax) {
      this.energy = this.energyMax;
    }

    this.updateEnergyPercent();
  }

  updateEnergyPercent() {
    this.energyPercent = 100 * this.energy / this.energyMax;
  }
}

/**
 * A party character.
 */
export class Character extends Creature {

  constructor(
    name: string,
    // Character class, could be an enum
    public clazz: string,
    public level: number,
    lifeMax: number,
    // True for mana based character class, false for tech based
    public useMana: boolean,
    energyMax: number,
    power: number,
    skills: Skill[],
  ) {
    super(name, lifeMax, energyMax, power, skills);

    this.energy = energyMax;
    this.updateEnergyPercent();
  }

  isCharacter(): boolean {
    return true;
  }

  isEnemy(): boolean {
    return false;
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
    super('- End of round -', 1, 1, 0,[]);
  }

  isCharacter(): boolean {
    return false;
  }

  isEnemy(): boolean {
    return false;
  }
}
