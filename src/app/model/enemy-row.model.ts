import {Enemy} from "./enemy.model";
import {Constants} from "./constants.model";

/**
 * A row of enemies.
 */
export class EnemyRow {

  /**
   * The enemies of the row.
   */
  enemies: Enemy[];

  constructor(enemies: Enemy[]) {
    this.enemies = enemies;
  }

  isNotFull(): boolean {
    return this.enemies.length < Constants.OPPOSITION_ROW_SIZE;
  }
}
