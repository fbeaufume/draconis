import {Game} from './game.model';
import {Advance, Leave, Skill, Strike, Wait} from './skill.model';
import {BasicLogType, CreatureClass, CreatureType, ElementType, FactionType} from './common.model';
import {LifeChange} from './life-change.model';
import {logs} from './log.model';
import {Creature, defaultEnemyAction, EnemyAction} from './creature.model';
import {EnemyStrategy, PrioritySkillStrategy} from './enemy-strategy.model';
import {Constants} from './constants.model';
import {settings} from './settings.model';
import {StatusApplication} from './status-application.model';
import {StatusType} from './status-type.model';

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
   * The elemental resistances.
   */
  elementalResistances: Map<ElementType, number> = new Map<ElementType, number>();

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

  constructor(
    type: CreatureType,
    name: string,
    lifeMax: number,
    power: number,
    actions: number = Constants.DEFAULT_ATTACK_COUNT) {
    super(FactionType.OPPOSITION, type, name, CreatureClass.ENEMY, lifeMax * settings.enemyHealthAndPowerCoefficient,
      100, power * settings.enemyHealthAndPowerCoefficient, []);
    this.baseName = name;
    this.actions = actions;
  }

  /**
   * Add an elemental resistance to the enemy.
   */
  withElementalResistance(type: ElementType, value: number) {
    this.elementalResistances.set(type, value);
  }

  /**
   * Add a passive status to the enemy.
   */
  withPassiveStatus(statusType: StatusType, power: number) {
    const statusApplication = new StatusApplication(statusType, power, this, 0);
    this.addPassiveStatusApplication(statusApplication);
    return this;
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

  override getElementalResistance(type: ElementType): number {
    return this.elementalResistances.get(type) ?? 0;
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
    return this.strategy.chooseAction(game.fight) || defaultEnemyAction;
  }
}

/**
 * An melee enemy class, i.e. an enemy class with skills only usable when in the first row.
 * When not yet in the first row, this enemy will advance if possible.
 * When in the first row, this enemy will use its strategy.
 */
export class StrategicMeleeEnemy extends StrategicEnemy {

  constructor(
    type: CreatureType,
    name: string,
    lifeMax: number,
    power: number,
    strategy: EnemyStrategy,
    actions: number = Constants.DEFAULT_ATTACK_COUNT) {
    super(type, name, lifeMax, power, new PrioritySkillStrategy(new Advance(), strategy), actions);
  }
}

/**
 * A peaceful old man (in phase 1) than turns into a strong druid (in phase 2) when attacked.
 */
export class OldManEnemy extends Enemy {

  mainAttack: Skill = new Strike('Strike');

  override addLifeChange(lifeChange: LifeChange): LifeChange {
    if (this.phase == 1) {
      // Turn into a druid
      logs.addBasicLog(BasicLogType.OLD_MAN_TRANSFORMATION);
      this.phase = 2;
      this.name = 'Elder Druid';

      // Increase the max life
      this.lifeMax = this.lifeMax * 3;
      this.life = this.lifeMax;
      this.updateLifePercent();
    }

    return super.addLifeChange(lifeChange);
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
