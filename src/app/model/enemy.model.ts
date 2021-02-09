// Enemy related classes

import {Character, Creature, OPPOSITION_ROW_SIZE} from './misc.model';
import {Fight} from './fight.model';

/**
 * Base class for enemy actions.
 */
export abstract class EnemyAction {
}

/**
 * The enemy advances toward the party.
 */
export class AdvanceAction extends EnemyAction {
}

/**
 * The enemy defends.
 */
export class DefendAction extends EnemyAction {
}

/**
 * The enemy damages a character.
 */
export class DamageAction extends EnemyAction {

  constructor(
    public targetCharacter: Character,
    public power: number) {
    super();
  }
}

/**
 * An enemy. Subclasses implement the enemy behavior and used skills (attacks, heals, etc).
 */
export abstract class Enemy extends Creature {

  /**
   * The distance between the enemy and the party, i.e. 1 means the opposition front row, 2 means the middle row, 3 the back row.
   */
  distance: number = 1;

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
 * Default melee enemy class. Hits when in front row, otherwise tries to advance.
 */
export class MeleeEnemy extends Enemy {

  chooseAction(fight: Fight): EnemyAction {
    if (this.distance > 1) {
      // Not in the front row, so try to advance

      const currentRow = fight.opposition.rows[this.distance - 1];
      const targetRow = fight.opposition.rows[this.distance - 2];
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

        return new AdvanceAction();
      } else {
        // The target row is full, so defend

        return new DefendAction();
      }
    } else {
      // Hit a front row character

      // Select a from row character
      const targetCharacter: Character = fight.party.rows[0].characters[Math.floor(Math.random() * 3)];

      return new DamageAction(targetCharacter, this.power);
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
