// Creature related classes

import {Game} from './game.model';
import {
  advance,
  computeEffectiveDamage,
  computeEffectiveHeal,
  deepWound,
  heal,
  leave,
  Skill,
  strike,
  strikeSmall,
  wait
} from './skill.model';
import {logs} from './log.model';
import {CRITICAL_BONUS, CRITICAL_CHANCE, DODGE_CHANCE, OPPOSITION_ROW_SIZE} from './constants.model';
import {CreatureClass, LifeChangeEfficiency, LifeChangeType, LogType, StatusExpiration} from "./common.model";
import {Status, StatusApplication} from "./status.model";

/**
 * A life change due to a damage or heal.
 */
export class LifeChange {

  constructor(
    // The amount of life change, always positive
    public amount: number,
    public efficiency: LifeChangeEfficiency = LifeChangeEfficiency.NORMAL,
    public type: LifeChangeType
  ) {
  }

  isGain(): boolean {
    return this.type == LifeChangeType.GAIN;
  }

  isCritical(): boolean {
    return this.efficiency == LifeChangeEfficiency.CRITICAL;
  }

  isSuccess(): boolean {
    return !this.isDodge();
  }

  isDodge(): boolean {
    return this.efficiency == LifeChangeEfficiency.DODGE;
  }

  /**
   * Return a signed amount, i.e. positive for a heal or negative for a damage
   */
  getSignedAmount(): number {
    if (this.isGain()) {
      return this.amount;
    } else {
      return -this.amount;
    }
  }
}

/**
 * A life gain due to a heal.
 */
export class LifeGain extends LifeChange {
  constructor(
    amount: number,
    efficiency: LifeChangeEfficiency = LifeChangeEfficiency.NORMAL
  ) {
    super(amount, efficiency, LifeChangeType.GAIN);
  }
}

/**
 * A life loss due to a damage.
 */
export class LifeLoss extends LifeChange {
  constructor(
    amount: number,
    efficiency: LifeChangeEfficiency = LifeChangeEfficiency.NORMAL
  ) {
    super(amount, efficiency, LifeChangeType.LOSS);
  }
}

/**
 * Base class for enemies and characters.
 */
export abstract class Creature {

  life: number;

  lifePercent: number;

  // Damages or heals received this turn and displayed in a popup
  lifeChange: LifeChange | null = null;

  // Current mana or tech points (depends on the character class) (currently only used by characters)
  energy: number;

  // Max mana or tech points (depends on the character class) (currently only used by characters)
  energyPercent: number;

  // Dodge chance, 0.1 means 10% dodge chance
  dodgeChance: number = DODGE_CHANCE;

  // Critical hit chance, 0.1 means 10% critical hit chance
  criticalChance: number = CRITICAL_CHANCE;

  // Critical hit bonus, 1.5 means 50% extra hit or heal
  criticalBonus: number = CRITICAL_BONUS;

  // Applied statuses
  statusApplications: StatusApplication[] = [];

  protected constructor(
    public name: string,
    // Character class or 'enemy' for enemies or 'end-round' for the end of round special creature
    public clazz: CreatureClass,
    public lifeMax: number,
    public energyMax: number,
    // Generic power of the creature, used to compute damage or heal amounts
    public power: number,
    // Creature skills (currently only used by characters)
    public skills: Skill[]
  ) {
    this.life = lifeMax;
    this.energy = energyMax;
    this.updateLifePercent();
  }

  abstract isCharacter(): boolean;

  abstract isEnemy(): boolean;

  isEndOfRound(): boolean {
    return this instanceof EndOfRound;
  }

  isAlive(): boolean {
    return this.life > 0;
  }

  isDead(): boolean {
    return !this.isAlive();
  }

  isDamaged(): boolean {
    return this.life < this.lifeMax;
  }

  /**
   * Inflict some damage to the creature.
   */
  changeLife(lifeChange: LifeChange): LifeChange {
    this.life += lifeChange.getSignedAmount();

    this.lifeChange = lifeChange;

    // Enforce min and max values
    this.life = this.checkMinAndMax(this.life, this.lifeMax);

    this.updateLifePercent();

    // Remove all statuses when dead
    if (this.life <= 0) {
      this.clearStatusApplications();
    }

    return lifeChange;
  }

  updateLifePercent() {
    this.lifePercent = 100 * this.life / this.lifeMax;
  }

  clearLifeChange() {
    this.lifeChange = null;
  }

  /**
   * Can be used with a negative amount of energy, e.g. when the skill generates some energy.
   */
  spendEnergy(amount: number) {
    amount = Math.round(amount);
    this.energy -= amount;

    // Enforce min and max values
    this.energy = this.checkMinAndMax(this.energy, this.energyMax);

    this.updateEnergyPercent();
  }

  updateEnergyPercent() {
    this.energyPercent = 100 * this.energy / this.energyMax;
  }

  /**
   * Ensure that a given amount is between 0 and a max amount.
   */
  checkMinAndMax(amount: number, maxAmount: number): number {
    if (amount < 0) {
      return 0;
    }
    if (amount > maxAmount) {
      return maxAmount;
    }
    return amount;
  }

  getPositiveStatuses(): StatusApplication[] {
    return this.statusApplications.filter(sa => sa.improvement);
  }

  getNegativeStatuses(): StatusApplication[] {
    return this.statusApplications.filter(sa => !sa.improvement);
  }

  hasStatus(status: Status): boolean {
    return this.statusApplications.map(s => s.status.name).includes(status.name);
  }

  hasPositiveStatus(status: Status): boolean {
    return this.getPositiveStatuses().map(s => s.status.name).includes(status.name);
  }

  hasNegativeStatus(status: Status): boolean {
    return this.getNegativeStatuses().map(s => s.status.name).includes(status.name);
  }

  /**
   * Add a status to the creature. If already present, it is refreshed, i.e. replaced by a new one.
   */
  applyStatus(statusApplication: StatusApplication) {
    // Remove the status if necessary
    this.statusApplications = this.statusApplications.filter(s => s.status.name != statusApplication.status.name
      || (statusApplication.status.cumulative && s.getOriginCreatureName() != statusApplication.getOriginCreatureName()));

    this.statusApplications.unshift(statusApplication);
  }

  /**
   * Reduce the remaining duration of all statuses that use a given expiration type and remove the expired ones.
   */
  decreaseStatusesDuration(expiration: StatusExpiration, originCreature: Creature | null = null) {
    for (let i = 0; i < this.statusApplications.length; i++) {
      const statusApplication = this.statusApplications[i];

      if (statusApplication.status.expiration != expiration) {
        continue;
      }

      if (originCreature != null && statusApplication.getOriginCreatureName() != originCreature.name) {
        continue;
      }

      statusApplication.decreaseDuration();

      if (statusApplication.isOver()) {
        // Remove the status
        this.statusApplications.splice(i--, 1);
      }
    }
  }

  /**
   * Apply all DOT and HOT to the creature and log a single message.
   */
  applyDotsAndHots() {
    let hasAtLeastOneDotOrHot: boolean = false;

    // Compute the total amount of damage and heal
    let amount: number = 0;
    this.statusApplications.forEach(statusApplication => {
      if (statusApplication.originCreature != null) {
        if (statusApplication.isDot()) {
          hasAtLeastOneDotOrHot = true;
          amount -= computeEffectiveDamage(statusApplication.originCreature, this, statusApplication.power, false).amount;
        } else if (statusApplication.isHot()) {
          hasAtLeastOneDotOrHot = true;
          amount += computeEffectiveHeal(statusApplication.originCreature, this, statusApplication.power).amount;
        }
      }
    });

    if (hasAtLeastOneDotOrHot) {
      const lifeChange = this.changeLife(new LifeChange(Math.abs(amount), LifeChangeEfficiency.NORMAL, amount >= 0 ? LifeChangeType.GAIN : LifeChangeType.LOSS));

      // Log the total amount of life lost of gained, but do not display the critical type
      if (amount >= 0) {
        logs.addCreatureLog(LogType.Hot, this, null, lifeChange, null);
      } else if (amount < 0) {
        logs.addCreatureLog(LogType.Dot, this, null, lifeChange, null);
      }
    }
  }

  clearStatusApplications() {
    this.statusApplications = [];
  }
}

/**
 * A special creature only used to mark the end of a round in thr turn order panel.
 */
export class EndOfRound extends Creature {

  constructor() {
    super('End of round', CreatureClass.END_OF_ROUND, 1, 1, 0, []);
  }

  isCharacter(): boolean {
    return false;
  }

  isEnemy(): boolean {
    return false;
  }
}

/**
 * An enemy actions.
 */
export class EnemyAction {

  constructor(
    // The executed skill
    public skill: Skill,
    // The target characters, if any
    public targetCreatures: Creature[]) {
  }
}

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

/**
 * A group of enemies.
 */
export class Opposition {

  rows: EnemyRow[] = [];

  constructor(
    public description: string,
    // Front row enemies
    row1Enemies: Enemy[] = [],
    // Back row enemies
    row2Enemies: Enemy[] = []) {
    this.rows.push(new EnemyRow(row1Enemies));
    this.rows.push(new EnemyRow(row2Enemies));
  }

  /**
   * Execute a callback on each enemy that validates an optional filter.
   */
  forEachEnemy(callback: (enemy: Enemy) => void, filter: (enemy: Enemy) => boolean = _ => true) {
    this.rows.forEach(row => row.enemies.filter(e => filter(e)).forEach(enemy => callback(enemy)));
  }

  /**
   * Return true if there is at least one dead enemy.
   */
  hasDeadEnemies(): boolean {
    for (const row of this.rows) {
      for (const enemy of row.enemies) {
        if (enemy.life <= 0) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Remove dead enemies and return them.
   */
  removeDeadEnemies(): Enemy[] {
    let removedEnemies: Enemy[] = [];

    for (const row of this.rows) {
      for (let i = 0; i < row.enemies.length; i++) {
        const enemy: Enemy = row.enemies[i];
        if (enemy.life <= 0) {
          removedEnemies.push(enemy);
          row.enemies.splice(i--, 1);
        }
      }
    }

    return removedEnemies;
  }

  /**
   * Remove empty rows, and shift the other ones.
   */
  removeEmptyRows() {
    let removeRows = 0;

    // Remove empty rows
    for (let i = 0; i < this.rows.length - 1; i++) {
      const row: EnemyRow = this.rows[i];
      if (row.enemies.length <= 0) {
        this.rows.splice(i--, 1);
        removeRows++;
      }
    }

    this.updateDistances();

    // Add empty rows in the back
    for (let i = 0; i < removeRows; i++) {
      this.rows.push(new EnemyRow([]));
    }
  }

  /**
   * Give each enemy his distance to the party.
   * Used to check skills range, advance toward characters, etc.
   */
  updateDistances() {
    for (let i = 0; i < this.rows.length; i++) {
      const row = this.rows[i];
      row.enemies.forEach(enemy => {
        enemy.distance = i + 1;
      });
    }
  }

  /**
   * Return the number of alive creatures
   */
  countAliveCreatures(): number {
    let count = 0;

    this.forEachEnemy(_ => count++, e => e.isAlive());

    return count;
  }

  /**
   * Return true is there is no alive creature.
   */
  isWiped(): boolean {
    return this.countAliveCreatures() <= 0;
  }

  /**
   * Target one damaged enemy, used for example by healer enemies.
   */
  targetOneDamagedEnemy(): Enemy | null {
    const damagedEnemies: Enemy[] = [];

    this.forEachEnemy(e => damagedEnemies.push(e), e => e.isDamaged());

    if (damagedEnemies.length > 0) {
      return damagedEnemies[Math.floor(Math.random() * damagedEnemies.length)];
    } else {
      return null;
    }
  }

  /**
   * Get the enemy at the left of a given enemy.
   */
  getLeftEnemy(enemy: Enemy): Enemy | null {
    // Row of the enemy
    const row = this.rows[enemy.distance - 1];

    // Position of the enemy in its row
    const position: number = row.enemies.indexOf(enemy);

    if (position > 0) {
      return row.enemies[position - 1];
    } else {
      return null;
    }
  }

  /**
   * Get the enemy at the right of a given enemy.
   */
  getRightEnemy(enemy: Enemy): Enemy | null {
    // Row of the enemy
    const row = this.rows[enemy.distance - 1];

    // Position of the enemy in its row
    const position: number = row.enemies.indexOf(enemy);

    if (position >= 0 && row.enemies.length > position + 1) {
      return row.enemies[position + 1];
    } else {
      return null;
    }
  }
}
