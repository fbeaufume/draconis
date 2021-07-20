import {EnemyRow} from "./enemy-row.model";
import {Enemy} from "./enemy.model";

/**
 * A group of enemies.
 */
export class Opposition {

  description: string;

  rows: EnemyRow[] = [];

  constructor(
    description: string,
    // Front row enemies
    row1Enemies: Enemy[] = [],
    // Back row enemies
    row2Enemies: Enemy[] = []) {
    this.description = description;
    this.rows.push(new EnemyRow(row1Enemies));
    this.rows.push(new EnemyRow(row2Enemies));
  }

  /**
   * Execute a callback on each enemy that validates an optional filter.
   */
  forEachEnemy(callback: (enemy: Enemy) => void, filter: (enemy: Enemy) => boolean = _ => true) {
    this.rows.forEach(row => row.enemies.filter(e => filter(e)).forEach(enemy => callback(enemy)));
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
          row.enemies.splice(i--, 1);
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
        this.rows.splice(i--, 1);
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

    this.forEachEnemy(_ => count++, e => e.isAlive());

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

    this.forEachEnemy(e => damagedEnemies.push(e), e => e.isDamaged());

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
