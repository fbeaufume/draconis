// Core model classes of the application

/**
 * The party location in the "world".
 */
export class PartyLocation {

  constructor(
    public region: string,
    public fight: number
  ) {
  }
}

/**
 * A character skill.
 */
export class Skill {

  constructor(
    public name: string,
    // Skill cost, in energy points
    public cost: number,
    // Skill range in number of rows, 0 if not applicable
    public range: number,
    public coolDown: number,
    public damage: number,
    public description: string
  ) {
  }
}

/**
 * Base class for enemies and characters.
 */
export abstract class Creature {

  life: number;

  lifePercent: number;

  // Bonuses, a.k.a. "buffs"
  // bonuses: string[] = [];

  // Maluses, a.k.a. "debuffs"
  // maluses: string[] = [];

  protected constructor(
    public name: string,
    public lifeMax: number
  ) {
    this.life = lifeMax;
    this.updateLifePercent();
  }

  isCharacter(): boolean {
    return this instanceof Character;
  }

  isEnemy(): boolean {
    return this instanceof Enemy;
  }

  isEndOfRound(): boolean {
    return this instanceof EndOfRound;
  }

  updateLifePercent() {
    this.lifePercent = 100 * this.life / this.lifeMax;
  }

  inflictDamage(amount: number) {
    this.life -= amount;

    // Enforce min and max values
    if (this.life < 0) {
      this.life = 0;
    }
    if (this.life > this.lifeMax) {
      this.life = this.lifeMax;
    }

    this.updateLifePercent();
  }
}

/**
 * An enemy.
 */
export class Enemy extends Creature {

  constructor(name: string, lifeMax: number, public damage: number) {
    super(name, lifeMax);
  }
}

/**
 * A row of enemies.
 */
export class EnemyRow {

  constructor(public enemies: Enemy[]) {
  }
}

/**
 * A group of enemies.
 */
export class Opposition {

  rows: EnemyRow[] = [];

  constructor(
    // Front row enemies
    row1Enemies: Enemy[],
    // Middle row enemies
    row2Enemies: Enemy[],
    // Back row enemies
    row3Enemies: Enemy[]) {
    this.rows.push(new EnemyRow(row1Enemies));
    this.rows.push(new EnemyRow(row2Enemies));
    this.rows.push(new EnemyRow(row3Enemies));
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
   * Remove dead enemies and return the names of the removed enemies.
   */
  removeDeadEnemies(): string[] {
    let removedNames = [];

    for (const row of this.rows) {
      for (let i = 0; i < row.enemies.length; i++) {
        if (row.enemies[i].life <= 0) {
          removedNames.push(row.enemies[i].name);
          row.enemies.splice(i, 1);
        }
      }
    }

    return removedNames;
  }

  /**
   * Return the number of alive creatures
   */
  countAliveCreatures(): number {
    let count = 0;

    for (const row of this.rows) {
      for (let i = 0; i < row.enemies.length; i++) {
        if (row.enemies[i].life > 0) {
          count++;
        }
      }
    }

    return count;
  }

  /**
   * Return true is there is no alive creature.
   */
  isWiped(): boolean {
    return this.countAliveCreatures() <= 0;
  }
}

/**
 * A party character.
 */
export class Character extends Creature {

  // Current mana or tech points (depends on the character class)
  energy: number;

  energyPercent: number;

  constructor(
    name: string,
    // Character class, could be an enum
    public clazz: string,
    public level: number,
    lifeMax: number,
    // True for mana based character class, false for tech based
    public useMana: boolean,
    // Max mana or tech points (depends on the character class)
    public energyMax: number,
    public skills: Skill[],
  ) {
    super(name, lifeMax);

    this.energy = energyMax;
    this.updateEnergyPercent();
  }

  updateEnergyPercent() {
    this.energyPercent = 100 * this.energy / this.energyMax;
  }

  useSkill(skill: Skill) {
    this.energy -= skill.cost;

    // Enforce min and max values
    if (this.energy < 0) {
      this.energy = 0;
    }

    this.updateEnergyPercent();
  }
}

/**
 * A row of characters.
 */
export class CharacterRow {

  constructor(public characters: Character[]) {
  }
}

/**
 * The player party.
 */
export class Party {

  rows: CharacterRow[] = [];

  constructor(
    // Front row characters
    row1Characters: Character[],
    // Back row characters
    row2Characters: Character[]) {
    this.rows.push(new CharacterRow(row1Characters));
    this.rows.push(new CharacterRow(row2Characters));
  }
}

/**
 * A special creature only used to mark the end of a round in thr turn order panel.
 */
export class EndOfRound extends Creature {

  constructor() {
    super('- End of round -', 0);
  }
}

/**
 * The action order of characters and enemies during a turn.
 */
export class TurnOrder {

  // Turn order with all creatures
  initialOrder: Creature[] = [];

  // Turn order with active (e.g. living) living creatures
  currentOrder: Creature[] = [];

  constructor(
    party: Party,
    opposition: Opposition) {
    // Initialize the initial turn order with all characters and enemies
    this.initialOrder.push(...party.rows[0].characters);
    this.initialOrder.push(...party.rows[1].characters);
    this.initialOrder.push(...opposition.rows[0].enemies);
    this.initialOrder.push(...opposition.rows[1].enemies);
    this.initialOrder.push(...opposition.rows[2].enemies);
    TurnOrder.shuffle(this.initialOrder); // Shuffle the creatures

    // Initialize the current turn order
    this.currentOrder.push(opposition.rows[0].enemies[0]);
    this.currentOrder.push(party.rows[0].characters[0]);
    this.currentOrder.push(party.rows[0].characters[1]);
    this.currentOrder.push(party.rows[0].characters[2]);
    this.currentOrder.push(opposition.rows[0].enemies[1]);
    this.currentOrder.push(party.rows[1].characters[0]);
    this.currentOrder.push(party.rows[1].characters[1]);
    this.currentOrder.push(party.rows[1].characters[2]);

    // Add a special creature to mark the end of round
    this.currentOrder.push(new EndOfRound());
  }

  private static shuffle(array: Creature[]) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  nextCreature() {
    const creature = this.currentOrder[0];
    this.currentOrder.copyWithin(0, 1);
    this.currentOrder[this.currentOrder.length - 1] = creature;
  }

  removeDeadEnemies() {
    for (let i = 0; i < this.currentOrder.length; i++) {
      const creature = this.currentOrder[i];

      if (creature.life <= 0 && creature instanceof Enemy) {
        this.currentOrder.splice(i, 1);
      }
    }
  }
}

/**
 * The current step in the fight workflow.
 * Used to enable of disable the selection of a target skill, enemy or character.
 * When some numeric values are changed, update accordingly the call to 'usePointerForStep' in fight.component.html.
 */
export enum FightStep {
  // Before the fight starts (displays the "Start fight" button)
  BEFORE_START,
  // Between creature turns
  END_OF_TURN,
  // Enemy turn
  ENEMY_TURN,
  // Character turn, the player must select a skill
  SELECT_SKILL,
  // Character turn, the player must select an enemy (for example as the target of an attack or debuff)
  SELECT_ENEMY,
  // Character turn, the player must select a character (for example as the target of a heal or buff)
  SELECT_CHARACTER,
  // Executing the player skill
  EXECUTING_SKILL,
  PARTY_VICTORY,
}
