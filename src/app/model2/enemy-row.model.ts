import {Enemy} from "./enemy.model";

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
}
