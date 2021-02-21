// Creature related classes

import {Game, OPPOSITION_ROW_SIZE} from './game.model';
import {advance, heal, leave, Skill, strike, strikeSmall, wait} from './skill.model';

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

  isAlive(): boolean {
    return this.life > 0;
  }

  isDead(): boolean {
    return !this.isAlive();
  }

  isDamaged(): boolean {
    return this.life < this.lifeMax;
  }

  /**
   * Inflict some damage to the creature.
   * The amount is rounded and returned.
   */
  damage(amount: number): number {
    amount = Math.round(amount);
    this.life -= amount;

    // Enforce min and max values
    this.life = this.checkMinAndMax(this.life, this.lifeMax);

    this.updateLifePercent();

    return amount;
  }

  /**
   * Heals the creature.
   * The amount is rounded and returned.
   */
  heal(amount: number): number {
    return -this.damage(-amount);
  }

  updateLifePercent() {
    this.lifePercent = 100 * this.life / this.lifeMax;
  }

  /**
   * Can be used with a negative amount of energy, e.g. when the skill generates some energy.
   */
  spendEnergy(amount: number) {
    amount = Math.round(amount);
    this.energy -= amount;

    // Enforce min and max values
    this.energy = this.checkMinAndMax(this.energy, this.energyMax);

    this.updateEnergyPercent();
  }

  updateEnergyPercent() {
    this.energyPercent = 100 * this.energy / this.energyMax;
  }

  /**
   * Ensure that a given amount is between 0 and a max amount.
   */
  checkMinAndMax(amount: number, maxAmount: number): number {
    if (amount < 0) {
      return 0;
    }
    if (amount > maxAmount) {
      return maxAmount;
    }
    return amount;
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

    this.restoreEnergy();
  }

  isCharacter(): boolean {
    return true;
  }

  isEnemy(): boolean {
    return false;
  }

  restoreEnergy() {
    this.energy = this.energyMax;
    this.updateEnergyPercent();
  }
}

/**
 * A row of characters.
 */
export class CharacterRow {

  constructor(public characters: Character[]) {
  }

  /**
   * Return true if there is at least one alive character in this row.
   */
  hasAliveCharacter(): boolean {
    for (let i = 0; i < this.characters.length; i++) {
      if (this.characters[i].isAlive()) {
        return true;
      }
    }
    return false;
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

  /**
   * Return the number of alive creatures
   */
  countAliveCreatures(): number {
    let count = 0;

    this.rows.forEach(row => row.characters.filter(character => character.isAlive()).forEach(_ => count++));

    return count;
  }

  /**
   * Return true is there is no alive character.
   */
  isWiped() {
    return this.countAliveCreatures() <= 0;
  }

  /**
   * Restore all tech points. Called at the beginning of a new encounter for example.
   */
  restoreTechPoints() {
    this.rows.forEach(row => {
      row.characters.filter(character => character.isAlive() && !character.useMana)
        .forEach(character => character.restoreEnergy());
    });
  }

  /**
   * Restore some mana to mana users, for example after an enemy died.
   */
  restoreManaPoints(amount: number) {
    this.rows.forEach(row => {
      row.characters.filter(character => character.useMana)
        .forEach(character => character.spendEnergy(-amount));
    });
  }

  /**
   * Target one random alive character from the first accessible row (i.e. the first row unless all characters from first row are dead).
   */
  targetOneFrontRowAliveCharacter(): Character[] {
    let rowIndex = 0;

    if (!this.rows[0].hasAliveCharacter()) {
      // No alive character on the front row, use the back row
      rowIndex = 1;
    }

    const aliveCharacters: Character[] = this.rows[rowIndex].characters.filter(character => character.isAlive());

    return [aliveCharacters[Math.floor(Math.random() * aliveCharacters.length)]];
  }

  /**
   * Target one random alive character.
   */
  targetOneAliveCharacter(): Character[] {
    const aliveCharacters: Character[] = [];
    this.rows.forEach(row => row.characters.filter(character => character.isAlive()).forEach(character => aliveCharacters.push(character)));

    return [aliveCharacters[Math.floor(Math.random() * aliveCharacters.length)]];
  }

  /**
   * Target all alive party characters.
   */
  targetAllAliveCharacters(): Character[] {
    const characters: Character[] = [];
    this.rows.forEach(row => row.characters.filter(c => c.isAlive()).forEach(c => characters.push(c)));
    return characters;
  }
}

/**
 * A special creature only used to mark the end of a round in thr turn order panel.
 */
export class EndOfRound extends Creature {

  constructor() {
    super('- End of round -', 1, 1, 0, []);
  }

  isCharacter(): boolean {
    return false;
  }

  isEnemy(): boolean {
    return false;
  }
}

/**
 * An enemy actions.
 */
export class EnemyAction {

  constructor(
    // The executed skill
    public skill: Skill,
    // The target characters, if any
    public targetCreatures: Creature[]) {
  }
}

/**
 * An enemy. Subclasses implement the enemy behavior and used skills (attacks, heals, etc).
 */
export abstract class Enemy extends Creature {

  /**
   * The enemy action (zero-based) step, 0 the for the first action, 1 for the second, etc.
   */
  step: number = -1;

  /**
   * Some enemies have phases with different abilities.
   */
  phase: number = 1;

  /**
   * The distance between the enemy and the party, i.e. 1 means the opposition front row, 2 means the middle row, 3 the back row.
   */
  distance: number = 1;

  constructor(
    name: string,
    lifeMax: number,
    power: number,
    // Number of actions per turn
    public actions: number = 1) {
    super(name, lifeMax, 100, power, []);
  }

  isCharacter(): boolean {
    return false;
  }

  isEnemy(): boolean {
    return true;
  }

  /**
   * Handle the creation turn, mostly delegates to the choose action method.
   * @param game
   */
  handleTurn(game: Game): EnemyAction {
    this.step++;
    return this.chooseAction(game);
  }

  /**
   * Called when it that creature's turn, this method decides what the creature does.
   */
  abstract chooseAction(game: Game): EnemyAction;
}

/**
 * Default melee enemy class. Hits when in front row, otherwise tries to advance.
 */
export class MeleeEnemy extends Enemy {

  chooseAction(game: Game): EnemyAction {
    if (this.distance > 1) {
      // Not in the front row, so try to advance

      const currentRow = game.opposition.rows[this.distance - 1];
      const targetRow = game.opposition.rows[this.distance - 2];
      if (targetRow.isNotFull()) {
        // The target row has some room, so advance

        // Leave the current row
        for (let i = 0; i < currentRow.enemies.length; i++) {
          const enemy = currentRow.enemies[i];
          if (enemy === this) {
            currentRow.enemies.splice(i, 1);
          }
        }

        // Move to the new row
        targetRow.enemies.push(this);
        this.distance--;

        game.opposition.removeEmptyRows();

        return new EnemyAction(advance, []);
      } else {
        // The target row is full, so wait

        return new EnemyAction(wait, []);
      }
    } else {
      // Hit a front row character

      return new EnemyAction(strike, game.party.targetOneFrontRowAliveCharacter());
    }
  }
}

/**
 * A peaceful old man (in phase 1) than turns into a strong druid (in phase 2) when attacked.
 */
export class OldManEnemy extends Enemy {

  damage(amount: number): number {
    if (this.phase == 1) {
      // Turn into a druid
      this.phase = 2;
      this.name = 'Elder Druid';
      this.lifeMax = this.lifeMax * 3;
      this.heal(this.lifeMax);
    }

    return super.damage(amount);
  }

  chooseAction(game: Game): EnemyAction {
    if (this.phase == 1) {
      if (this.step >= 1) {
        // Leave the fight
        return new EnemyAction(leave, []);
      } else {
        return new EnemyAction(wait, []);
      }
    } else {
      return new EnemyAction(strike, game.party.targetOneFrontRowAliveCharacter());
    }
  }
}

/**
 * Default distance enemy class.
 */
export class DistanceEnemy extends Enemy {

  chooseAction(game: Game): EnemyAction {
    return new EnemyAction(strike, game.party.targetOneAliveCharacter());
  }
}

/**
 * Default healer enemy class. Heal a damaged enemy, if any, otherwise hit a character.
 */
export class HealerEnemy extends Enemy {

  chooseAction(game: Game): EnemyAction {
    const enemy: Enemy | null = game.opposition.targetOneDamagedEnemy();

    if (enemy != null) {
      return new EnemyAction(heal, [enemy]);
    } else {
      return new EnemyAction(strike, game.party.targetOneAliveCharacter());
    }
  }
}

/**
 * Perform a claws attack on a character or a breath attack on all characters.
 */
export class DragonEnemy extends Enemy {

  chooseAction(game: Game): EnemyAction {
    switch (this.step % 2) {
      case 0:
        // Claw attack on a character
        return new EnemyAction(strike, game.party.targetOneFrontRowAliveCharacter());
      default:
        // AOE on all characters
        return new EnemyAction(strikeSmall, game.party.targetAllAliveCharacters());
    }
  }
}

/**
 * A row of enemies.
 */
export class EnemyRow {

  constructor(public enemies: Enemy[]) {
  }

  isNotFull(): boolean {
    return this.enemies.length < OPPOSITION_ROW_SIZE;
  }
}

/**
 * A group of enemies.
 */
export class Opposition {

  rows: EnemyRow[] = [];

  constructor(
    public description: string,
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
   * Remove dead enemies and return them.
   */
  removeDeadEnemies(): Enemy[] {
    let removedEnemies: Enemy[] = [];

    for (const row of this.rows) {
      for (let i = 0; i < row.enemies.length; i++) {
        const enemy: Enemy = row.enemies[i];
        if (enemy.life <= 0) {
          removedEnemies.push(enemy);
          row.enemies.splice(i, 1);
        }
      }
    }

    return removedEnemies;
  }

  /**
   * Remove empty rows, and shift the other ones.
   */
  removeEmptyRows() {
    let removeRows = 0;

    // Remove empty rows
    for (let i = 0; i < this.rows.length - 1; i++) {
      const row: EnemyRow = this.rows[i];
      if (row.enemies.length <= 0) {
        this.rows.splice(i, 1);
        removeRows++;
      }
    }

    this.updateDistances();

    // Add empty rows in the back
    for (let i = 0; i < removeRows; i++) {
      this.rows.push(new EnemyRow([]));
    }
  }

  /**
   * Give each enemy his distance to the party.
   * Used to check skills range, advance toward characters, etc.
   */
  updateDistances() {
    for (let i = 0; i < this.rows.length; i++) {
      const row = this.rows[i];
      row.enemies.forEach(enemy => {
        enemy.distance = i + 1;
      });
    }
  }

  /**
   * Return the number of alive creatures
   */
  countAliveCreatures(): number {
    let count = 0;

    this.rows.forEach(row => row.enemies.filter(enemy => enemy.isAlive()).forEach(_ => count++));

    return count;
  }

  /**
   * Return true is there is no alive creature.
   */
  isWiped(): boolean {
    return this.countAliveCreatures() <= 0;
  }

  /**
   * Target one damaged enemy, used for example by healer enemies.
   */
  targetOneDamagedEnemy(): Enemy | null {
    const damagedEnemies: Enemy[] = [];

    this.rows.forEach(row => row.enemies.filter(enemy => enemy.isDamaged()).forEach(enemy => damagedEnemies.push(enemy)));

    if (damagedEnemies.length > 0) {
      return damagedEnemies[Math.floor(Math.random() * damagedEnemies.length)];
    } else {
      return null;
    }
  }

  /**
   * Get the enemy at the left of a given enemy.
   */
  getLeftEnemy(enemy: Enemy): Enemy | null {
    // Row of the enemy
    const row = this.rows[enemy.distance - 1];

    // Position of the enemy in its row
    const position: number = row.enemies.indexOf(enemy);

    if (position > 0) {
      return row.enemies[position - 1];
    } else {
      return null;
    }
  }

  /**
   * Get the enemy at the right of a given enemy.
   */
  getRightEnemy(enemy: Enemy): Enemy | null {
    // Row of the enemy
    const row = this.rows[enemy.distance - 1];

    // Position of the enemy in its row
    const position: number = row.enemies.indexOf(enemy);

    if (position >= 0 && row.enemies.length > position + 1) {
      return row.enemies[position + 1];
    } else {
      return null;
    }
  }
}
