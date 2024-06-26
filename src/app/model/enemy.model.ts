import {Game} from './game.model';
import {Advance, Leave, Skill, Strike, Wait} from './skill.model';
import {BasicMessageType, CreatureClass, CreatureSize, CreatureType, ElementType, FactionType} from './common.model';
import {LifeChange} from './life-change.model';
import {messages} from './message.model';
import {Creature} from './creature.model';
import {EnemyAction, PriorityStrategy, Strategy} from './strategy.model';
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
   * Is this creature a champion.
   */
  champion: boolean = false;

  /**
   * Number of actions per turn.
   */
  actions: number;

  /**
   * The enemy action step. Zero based, i.e. 0 the for the first action, 1 for the second, etc.
   * Incremented whenever the enemy executes an action.
   * Can be used to identify the first enemy action during a turn, for example to apply DOT or HOT.
   */
  step: number = -1;

  /**
   * Some enemies have phases with different abilities. One based, i.e. 1 for the first phase, 2 for the second, etc.
   */
  phase: number = 1;

  constructor(
    type: CreatureType,
    name: string,
    lifeMax: number,
    power: number,
    size: CreatureSize = CreatureSize.REGULAR,
    actions: number = Constants.DEFAULT_ATTACK_COUNT) {
    super(FactionType.OPPOSITION, type, name, CreatureClass.ENEMY, lifeMax * settings.enemyHealthAndPowerCoefficient,
      100, power * settings.enemyHealthAndPowerCoefficient, []);
    this.baseName = name;
    this.size = size;
    this.actions = actions;
  }

  /**
   * Add an elemental resistance to the enemy.
   */
  withElementalResistance(type: ElementType, value: number): Enemy {
    this.elementalResistances.set(type, value);
    return this;
  }

  /**
   * Add a passive status to the enemy.
   */
  withPassiveStatus(statusType: StatusType, power: number): Enemy {
    const statusApplication = new StatusApplication(statusType, power, this, 0, ElementType.REMOVE_THIS);
    this.addPassiveStatusApplication(statusApplication);
    return this;
  }

  isCharacter(): boolean {
    return false;
  }

  isEnemy(): boolean {
    return true;
  }

  override isChampion(): boolean {
    return this.champion;
  }

  isEndOfRound(): boolean {
    return false;
  }

  override getElementalResistance(type: ElementType): number {
    return this.elementalResistances.get(type) ?? 0;
  }

  promoteToChampion() {
    if (!this.champion) {
      this.champion = true;
      this.lifeMax = Math.round(this.lifeMax * (1 + Constants.CHAMPION_LIFE_BONUS));
      this.life = this.lifeMax;
      this.power *= (1 + Constants.CHAMPION_POWER_BONUS);
    }
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

  strategy: Strategy;

  constructor(
    type: CreatureType,
    name: string,
    lifeMax: number,
    power: number,
    strategy: Strategy,
    size: CreatureSize = CreatureSize.REGULAR,
    actions: number = Constants.DEFAULT_ATTACK_COUNT) {
    super(type, name, lifeMax, power, size, actions);
    this.strategy = strategy;
  }

  chooseAction(game: Game): EnemyAction {
    return this.strategy.chooseAction(game.fight);
  }
}

/**
 * A melee enemy class, i.e. an enemy class with skills only usable when in the first row.
 * When not yet in the first row, this enemy will advance if possible.
 * When in the first row, this enemy will use its strategy.
 */
export class StrategicMeleeEnemy extends StrategicEnemy {

  constructor(
    type: CreatureType,
    name: string,
    lifeMax: number,
    power: number,
    strategy: Strategy,
    size: CreatureSize = CreatureSize.REGULAR,
    actions: number = Constants.DEFAULT_ATTACK_COUNT) {
    super(type, name, lifeMax, power, new PriorityStrategy(new Advance(), strategy), size, actions);
  }
}

// TODO FBE add a StrategicFleeingMeleeEnemy for the rats

/**
 * A peaceful old man (in phase 1) than turns into a strong druid (in phase 2) when attacked.
 */
export class OldManEnemy extends Enemy {

  mainAttack: Skill = new Strike('Strike', ElementType.PHYSICAL);

  override addLifeChange(lifeChange: LifeChange): LifeChange {
    if (this.phase == 1) {
      // Turn into a druid
      messages.addBasicMessage(BasicMessageType.OLD_MAN_TRANSFORMATION);
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
