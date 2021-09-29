import {Game} from "./game.model";
import {Advance, Heal, Leave, Skill, Strike, Wait} from "./skill.model";
import {CreatureClass, CreatureType, FactionType, LogType, SkillIconType, SkillTargetType} from "./common.model";
import {LifeChange} from "./life-change.model";
import {logs} from "./log.model";
import {Creature, EnemyAction} from "./creature.model";
import {EnemyStrategy} from "./enemy-strategy.model";
import {Constants} from "./constants.model";

/**
 * Base class for enemy classes.
 * Before subclassing this class consider using the subclasses with strategies, such as StrategicEnemy.
 */
export abstract class Enemy extends Creature {

  /**
   * The base name of the creature, such as 'Goblin'.
   */
  baseName: string;

  /**
   * Number of actions per turn.
   */
  actions: number;

  /**
   * The enemy action step. Zero based, i.e. 0 the for the first action, 1 for the second, etc.
   */
  step: number = -1;

  /**
   * Some enemies have phases with different abilities.
   */
  phase: number = 1;

  /**
   * Main damaging skill.
   */
    // TODO FBE remove this attribute when done migrating to strategy based enemies
  mainAttack: Skill = new Strike('Strike');

  constructor(
    type: CreatureType,
    name: string,
    lifeMax: number,
    power: number,
    actions: number = Constants.DEFAULT_ATTACK_COUNT) {
    super(FactionType.OPPOSITION, type, name, CreatureClass.ENEMY, lifeMax, 100, power, []);
    this.baseName = name;
    this.actions = actions;
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

  isEndOfRound(): boolean {
    return false;
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
 * An enemy class using a strategy to select its actions.
 */
export class StrategicEnemy extends Enemy {

  strategy: EnemyStrategy;

  constructor(
    type: CreatureType,
    name: string,
    lifeMax: number,
    power: number,
    strategy: EnemyStrategy,
    actions: number = Constants.DEFAULT_ATTACK_COUNT) {
    super(type, name, lifeMax, power, actions);
    this.strategy = strategy;
  }

  chooseAction(game: Game): EnemyAction {
    return this.strategy.chooseAction(game.fight);
  }
}

/**
 * An melee enemy class using a strategy to select its actions.
 * Uses a skill only when in the first row. If not it will try to advance.
 */
export class StrategicMeleeEnemy extends StrategicEnemy {

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

        return new EnemyAction(new Advance(), []);
      } else {
        // The target row is full, so wait

        return new EnemyAction(new Wait(), []);
      }
    } else {
      // Already in the front row, so we can use the skill

      return super.chooseAction(game);
    }
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
        return new EnemyAction(new Leave(), []);
      } else {
        return new EnemyAction(new Wait(), []);
      }
    } else {
      return new EnemyAction(this.mainAttack, game.party.targetOneFrontRowAliveCharacter());
    }
  }
}

/**
 * Default healer enemy class. Heal a damaged enemy, if any, otherwise hit a character.
 */
export class HealerEnemy extends Enemy {

  heal: Heal = new Heal(SkillIconType.HEAL, 'Heal', SkillTargetType.OTHER_ALIVE, 5, 0, 0, '');

  chooseAction(game: Game): EnemyAction {
    const enemy: Enemy | null = game.opposition.targetOneDamagedEnemy();

    if (enemy != null) {
      return new EnemyAction(this.heal, [enemy]);
    } else {
      return new EnemyAction(this.mainAttack, game.party.targetOneAliveCharacter());
    }
  }
}
