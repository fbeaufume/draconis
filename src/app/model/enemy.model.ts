import {Game} from "./game.model";
import {advance, deepWound, heal, leave, Skill, strike, strikeSmall, wait} from "./skill.model";
import {CreatureClass, LogType} from "./common.model";
import {LifeChange} from "./life-change.model";
import {logs} from "./log.model";
import {Creature, EnemyAction} from "./creature.model";

/**
 * An enemy. Subclasses implement the enemy behavior and used skills (attacks, heals, etc).
 */
export abstract class Enemy extends Creature {

    /**
     * The enemy action step. Zero based, i.e. 0 the for the first action, 1 for the second, etc.
     */
    step: number = -1;

    /**
     * Some enemies have phases with different abilities.
     */
    phase: number = 1;

    /**
     * The distance between the enemy and the party, i.e. 1 means the opposition front row, 2 means the middle row, 3 the back row.
     */
    distance: number = 1;

    /**
     * Main damaging skill.
     */
    mainAttack: Skill = strike;

    /**
     * Main healing skill, for enemy types that can heal.
     */
    mainHeal: Skill = heal;

    constructor(
        name: string,
        lifeMax: number,
        power: number,
        // Number of actions per turn
        public actions: number = 1) {
        super(name, CreatureClass.ENEMY, lifeMax, 100, power, []);
        this.customize();
    }

    /**
     * Called after the constructor. Used to customize the behavior of the enemy, for example to use a specific skill for attacks.
     */
    customize(): void {
    }

    isCharacter(): boolean {
        return false;
    }

    isEnemy(): boolean {
        return true;
    }

    /**
     * Handle the creation turn, mostly delegates to the choose action method.
     * @param game
     */
    handleTurn(game: Game): EnemyAction {
        this.step++;
        return this.chooseAction(game);
    }

    /**
     * Called when it that creature's turn, this method decides what the creature does.
     */
    abstract chooseAction(game: Game): EnemyAction;
}

/**
 * Default melee enemy class. Hits when in front row, otherwise tries to advance.
 */
export class MeleeEnemy extends Enemy {

    chooseAction(game: Game): EnemyAction {
        if (this.distance > 1) {
            // Not in the front row, so try to advance

            const currentRow = game.opposition.rows[this.distance - 1];
            const targetRow = game.opposition.rows[this.distance - 2];
            if (targetRow.isNotFull()) {
                // The target row has some room, so advance

                // Leave the current row
                for (let i = 0; i < currentRow.enemies.length; i++) {
                    const enemy = currentRow.enemies[i];
                    if (enemy === this) {
                        currentRow.enemies.splice(i--, 1);
                    }
                }

                // Move to the new row
                targetRow.enemies.push(this);
                this.distance--;

                game.opposition.removeEmptyRows();

                return new EnemyAction(advance, []);
            } else {
                // The target row is full, so wait

                return new EnemyAction(wait, []);
            }
        } else {
            // Hit a front row character

            return new EnemyAction(this.mainAttack, game.party.targetOneFrontRowAliveCharacter());
        }
    }
}

/**
 * A melee enemy that uses a bleeding attack.
 */
export class BleederMeleeEnemy extends MeleeEnemy {

    customize() {
        this.mainAttack = deepWound;
    }
}

/**
 * A peaceful old man (in phase 1) than turns into a strong druid (in phase 2) when attacked.
 */
export class OldManEnemy extends Enemy {

    changeLife(lifeChange: LifeChange): LifeChange {
        if (this.phase == 1) {
            // Turn into a druid
            logs.addLog(LogType.OldManTransformation);
            this.phase = 2;
            this.name = 'Elder Druid';

            // Increase the max life
            this.lifeMax = this.lifeMax * 3;
            this.life = this.lifeMax;
            this.updateLifePercent();
        }

        return super.changeLife(lifeChange);
    }

    chooseAction(game: Game): EnemyAction {
        if (this.phase == 1) {
            if (this.step >= 1) {
                // Leave the fight
                return new EnemyAction(leave, []);
            } else {
                return new EnemyAction(wait, []);
            }
        } else {
            return new EnemyAction(this.mainAttack, game.party.targetOneFrontRowAliveCharacter());
        }
    }
}

/**
 * Default distance enemy class.
 */
export class DistanceEnemy extends Enemy {

    chooseAction(game: Game): EnemyAction {
        return new EnemyAction(this.mainAttack, game.party.targetOneAliveCharacter());
    }
}

/**
 * Default healer enemy class. Heal a damaged enemy, if any, otherwise hit a character.
 */
export class HealerEnemy extends Enemy {

    chooseAction(game: Game): EnemyAction {
        const enemy: Enemy | null = game.opposition.targetOneDamagedEnemy();

        if (enemy != null) {
            return new EnemyAction(this.mainHeal, [enemy]);
        } else {
            return new EnemyAction(this.mainAttack, game.party.targetOneAliveCharacter());
        }
    }
}

/**
 * Perform a claws attack on a character or a breath attack on all characters.
 */
export class DragonEnemy extends Enemy {

    chooseAction(game: Game): EnemyAction {
        switch (this.step % 3) {
            case 0:
            case 1:
                // Claw attack on a character
                return new EnemyAction(this.mainAttack, game.party.targetOneFrontRowAliveCharacter());
            default:
                // AOE on all characters
                return new EnemyAction(strikeSmall, game.party.targetAllAliveCharacters());
        }
    }
}
