import {Enemy} from "./enemy.model";
import {Constants} from "./constants.model";

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

  isFull(): boolean {
    return this.enemies.length >= Constants.OPPOSITION_ROW_SIZE;
  }
}
