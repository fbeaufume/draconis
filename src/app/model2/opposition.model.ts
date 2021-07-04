import {EnemyRow} from "./enemy-row.model";
import {Enemy} from "./enemy.model";

/**
 * All the enemies in a fight. They are organized in rows.
 */
export class Opposition {

  /**
   * The description of the opposition.
   */
  description: string;

  /**
   * The enemies rows. The first row is the front row.
   */
  rows: EnemyRow[] = [];

  constructor(
    description: string,
    frontRow: Enemy[],
    backRow: Enemy[] = []) {
    this.description = description;
    this.rows.push(new EnemyRow(frontRow));
    this.rows.push(new EnemyRow(backRow));
  }
}
