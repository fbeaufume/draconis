import {Enemy} from './enemy.model';
import {Constants} from './constants.model';
import {Creature} from "./creature.model";

// TODO FBE move to opposition.model.js

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
