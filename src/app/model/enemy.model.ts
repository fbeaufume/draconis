// Enemy related classes

import {Character, Creature} from './misc.model';
import {Fight} from './fight.model';

/**
 * Describes the action executed by an enemy.
 */
export class EnemyAction {

  constructor(
    public targetCharacter: Character,
    public power: number) {
  }
}

/**
 * An enemy. Subclasses implement the enemy behavior and used skills (attacks, heals, etc).
 */
export abstract class Enemy extends Creature {

  constructor(
    name: string,
    lifeMax: number,
    // Generic power of the creature, i.e. damage amount for offensive skills, heal amount for heal skills, etc
    public power: number,
    // Number of actions per turn
    public actions: number = 1) {
    super(name, lifeMax);
  }

  isCharacter(): boolean {
    return false;
  }

  isEnemy(): boolean {
    return true;
  }

  /**
   * Called when it that creature's turn, this method decides what the creature does.
   */
  abstract chooseAction(fight: Fight): EnemyAction;
}

/**
 * Enemy class with a basic fight strategy.
 */
export class SimpleEnemy extends Enemy {

  chooseAction(fight: Fight): EnemyAction {
    // Select a from row character
    const targetCharacter : Character= fight.party.rows[0].characters[Math.floor(Math.random() * 3)];

    return new EnemyAction(targetCharacter, this.power);
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
