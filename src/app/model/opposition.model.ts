import {Enemy} from './enemy.model';
import {Constants} from './constants.model';
import {Creature} from './creature.model';

/**
 * A group of enemies.
 */
export class Opposition {

  /**
   * The description of the opposition.
   */
  description: string;

  /**
   * Can this opposition have champions.
   */
  canHaveChampion: boolean;

  /**
   * The enemy rows. The first row in the array is the front row.
   */
  rows: OppositionRow[] = [];

  /**
   * For each enemy base name, the number of such enemies.
   * Used to generate the letter in the effective name of the enemies.
   */
  enemyCountPerBaseName: Map<string, number> = new Map<string, number>();

  constructor(
    description: string,
    canHaveChampion: boolean,
    // Front row enemies
    row1Enemies: Enemy[] = [],
    // Back row enemies
    row2Enemies: Enemy[] = []) {
    this.description = description;
    this.canHaveChampion = canHaveChampion;
    this.rows.push(new OppositionRow(row1Enemies));
    this.rows.push(new OppositionRow(row2Enemies));

    this.updateDistances();

    this.computeEffectiveNames();

    this.makeChampions();
  }

  /**
   * Compute the effective name of all enemies.
   */
  computeEffectiveNames() {
    // First count the enemies for each base name
    this.forEachEnemy(enemy => {
      let count: number = this.enemyCountPerBaseName.get(enemy.baseName) || 0;
      this.enemyCountPerBaseName.set(enemy.baseName, count + 1);
    })

    // Then for enemies that are present multiple times, update the effective name
    this.enemyCountPerBaseName.forEach((count, baseName) => {
      if (count > 1) {
        let position = 0;
        this.forEachEnemy(enemy => {
          const letter = String.fromCharCode('A'.charCodeAt(0) + position);
          enemy.name = enemy.baseName + ' ' + letter;
          position++;
        }, enemy => enemy.baseName === baseName);
      }
    })
  }

  /**
   * If this opposition supports champions, then randomly upgrade some creatures to champion.
   */
  makeChampions() {
    if (this.canHaveChampion) {
      this.forEachEnemy(enemy => {
        if (Math.random() < Constants.CHAMPION_CHANCE) {
          enemy.promoteToChampion();
        }
      });
    }
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
      const row: OppositionRow = this.rows[i];
      if (row.enemies.length <= 0) {
        this.rows.splice(i--, 1);
        removeRows++;
      }
    }

    this.updateDistances();

    // Add empty rows in the back
    for (let i = 0; i < removeRows; i++) {
      this.rows.push(new OppositionRow([]));
    }
  }

  /**
   * Give each enemy his distance to the party.
   */
  private updateDistances() {
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
  targetOneDamagedEnemy(): Enemy[] {
    const damagedEnemies: Enemy[] = [];

    this.forEachEnemy(e => damagedEnemies.push(e), e => e.isDamaged());

    if (damagedEnemies.length > 0) {
      return [damagedEnemies[Math.floor(Math.random() * damagedEnemies.length)]];
    } else {
      return [];
    }
  }

  /**
   * Target all enemies.
   */
  targetAllEnemies(): Enemy[] {
    const enemies: Enemy[] = [];

    this.forEachEnemy(e => enemies.push(e));

    return enemies;
  }

  /**
   * Target first row enemies.
   */
  targetFirstRowEnemies(): Enemy[] {
    const enemies: Enemy[] = [];

    this.rows[0].enemies.forEach(e => enemies.push(e));

    return enemies;
  }

  /**
   * Get the enemy at the left of a given enemy.
   */
  getLeftEnemy(enemy: Enemy): Enemy | null {
    const row = this.getRowOfEnemy(enemy);

    // Position of the creature in its row
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
    const row = this.getRowOfEnemy(enemy);

    // Position of the creature in its row
    const position: number = row.enemies.indexOf(enemy);

    if (position >= 0 && row.enemies.length > position + 1) {
      return row.enemies[position + 1];
    } else {
      return null;
    }
  }

  getRowOfEnemy(enemy: Enemy): OppositionRow {
    return this.rows[enemy.distance - 1];
  }
}

/**
 * A row of enemies in the opposition.
 */
export class OppositionRow {

  /**
   * The enemies of the row.
   */
  enemies: Enemy[];

  constructor(enemies: Enemy[]) {
    this.enemies = enemies;
  }

  /**
   * Can a given creature be added to the row.
   */
  canAccept(creature: Creature): boolean {
    // The row occupation is the sum of the size of all creatures in the row.
    const rowOccupation: number = this.enemies.reduce((currentSum, e) => currentSum + e.size, 0);

    return rowOccupation + creature.size <= Constants.OPPOSITION_ROW_CAPACITY;
  }
}
