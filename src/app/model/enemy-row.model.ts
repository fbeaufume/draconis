import {Enemy} from "./enemy.model";
import {OPPOSITION_ROW_SIZE} from "./constants.model";

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
