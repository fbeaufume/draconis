// Base model classes of the application

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
 * A row of enemies.
 */
export class EnemyRow {

  constructor(public enemies: Enemy[]) {
  }
}

/**
 * A group of enemies.
 */
export class Opposition {

  rows: EnemyRow[] = [];

  constructor(
    // Front row enemies
    row1Enemies: Enemy[],
    // Middle row enemies
    row2Enemies: Enemy[],
    // Back row enemies
    row3Enemies: Enemy[]) {
    this.rows.push(new EnemyRow(row1Enemies));
    this.rows.push(new EnemyRow(row2Enemies));
    this.rows.push(new EnemyRow(row3Enemies));
  }

  /**
   * Return true if there is at least one dead enemy.
   */
  hasDeadEnemies(): boolean {
    for (const row of this.rows) {
      for (const enemy of row.enemies) {
        if (enemy.life <= 0) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Remove dead enemies and return the names of the removed enemies.
   */
  removeDeadEnemies(): string[] {
    let removedNames = [];

    for (const row of this.rows) {
      for (let i = 0; i < row.enemies.length; i++) {
        if (row.enemies[i].life <= 0) {
          removedNames.push(row.enemies[i].name);
          row.enemies.splice(i, 1);
        }
      }
    }

    return removedNames;
  }

  /**
   * Return the number of alive creatures
   */
  countAliveCreatures(): number {
    let count = 0;

    for (const row of this.rows) {
      for (let i = 0; i < row.enemies.length; i++) {
        if (row.enemies[i].life > 0) {
          count++;
        }
      }
    }

    return count;
  }

  /**
   * Return true is there is no alive creature.
   */
  isWiped(): boolean {
    return this.countAliveCreatures() <= 0;
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
}
