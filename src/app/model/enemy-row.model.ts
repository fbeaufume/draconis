import {Enemy} from "./enemy.model";
import {Constants} from "./constants.model";

/**
 * A row of enemies.
 */
export class EnemyRow {

    constructor(public enemies: Enemy[]) {
    }

    isNotFull(): boolean {
        return this.enemies.length < Constants.OPPOSITION_ROW_SIZE;
    }
}
