// Application constants

import {GameState} from './common.model';

export class Constants {

  /**
   * The maximum number of displayed messages.
   */
  static readonly MESSAGE_MAX = 20;

  /**
   * A pause duration preset, in msec.
   */
  static readonly PAUSE_SHORT = 100;

  /**
   * A pause duration preset, in msec.
   */
  static readonly PAUSE_LONG = 1000;

  /**
   * Number of character rows.
   */
  static readonly PARTY_ROWS = 2;

  /**
   * Number of characters per row.
   */
  static readonly PARTY_ROW_SIZE = 2;

  /**
   * Number of characters in the party.
   */
  static readonly PARTY_SIZE = Constants.PARTY_ROWS * Constants.PARTY_ROW_SIZE;

  /**
   * Number of enemy rows.
   */
  static readonly OPPOSITION_ROWS = 2;

  /**
   * Maximum number of enemies per row.
   */
  static readonly OPPOSITION_ROW_CAPACITY = 3;

  /**
   * The states when it is ok for the player to choose a character skill, possibly to change his mind.
   */
  static readonly CAN_SELECT_SKILL_STATES = [GameState.SELECT_SKILL, GameState.SELECT_ENEMY, GameState.SELECT_CHARACTER, GameState.SELECT_CHARACTER_OR_ENEMY];

  /**
   * Chance for a given creature to be a champion, i.e. stronger, 0.1 means a 10% chance.
   */
  static readonly CHAMPION_CHANCE = 0.1;

  /**
   * Life bonus for a champion creature, 0.4 means 40% extra life.
   */
  static readonly CHAMPION_LIFE_BONUS = 0.4;

  /**
   * Power bonus for a champion creature, 0.25 means 25% extra power.
   */
  static readonly CHAMPION_POWER_BONUS = 0.25;

  /**
   * The default number of attacks per round for enemies.
   */
  static readonly DEFAULT_ATTACK_COUNT = 1;

  /**
   * The randomization range of damages and heals, 0.3 means +/- 15%.
   */
  static readonly RANDOMIZE_RANGE = 0.3;

  static readonly RANDOMIZE_BASE = 1 - Constants.RANDOMIZE_RANGE / 2;

  /**
   * Default dodge chance.
   */
  static readonly DODGE_CHANCE = 0.1;

  /**
   * Default critical hit chance for damages and heals.
   */
  static readonly CRITICAL_CHANCE = 0.1;

  /**
   * Default critical bonus for damages and heals.
   */
  static readonly CRITICAL_BONUS = 1.5;

  /**
   * Damage modification when using the defend status. 0.2 means 20% damage reduction.
   */
  static readonly DEFEND_BONUS = 0.2;

  /**
   * Damage modification when using the attack status. 0.2 means 20% damage augmentation or reduction.
   */
  static readonly ATTACK_BONUS = 0.2;

  /**
   * Damage modification when using the defend status. 0.2 means 20% damage augmentation or reduction.
   */
  static readonly DEFENSE_BONUS = 0.2;

  /**
   * Attack modification for specialty. 0.15 means a 15% damage increase.
   */
  static readonly SPECIALTY_ATTACK_BONUS = 0.15;

  /**
   * Defense modification for specialty. 0.1 means a 10% damage reduction.
   */
  static readonly SPECIALTY_DEFENSE_BONUS = 0.1;

  /**
   * Percentage of mana gained by the characters after an enemy died. 0.2 means a 20% gain.
   */
  static readonly MANA_GAIN_PER_DEAD_ENEMY = 0.4;

  /**
   * Default duration for statuses.
   */
  static readonly DEFAULT_STATUS_DURATION = 3;

  /**
   * Duration for defend status.
   */
  static readonly DEFEND_DURATION = 1;

  /**
   * Duration for combo statuses.
   */
  static readonly COMBO_DURATION = 2;

  /**
   * Lowest vengeance damage bonus (when full life).
   */
  static readonly VENGEANCE_LOW = 0.8;

  /**
   * Highest Vengeance damage bonus (when no life).
   */
  static readonly VENGEANCE_HIGH = 1.6;

  /**
   * Lowest judgement damage bonus (when no life).
   */
  static readonly JUDGEMENT_LOW = 0.4;

  /**
   * Highest judgement damage bonus (when full life).
   */
  static readonly JUDGEMENT_HIGH = 1.2;

  /**
   * Lowest execution damage bonus (when full life).
   */
  static readonly EXECUTION_LOW = 0.6;

  /**
   * Highest execution damage bonus (when no life).
   */
  static readonly EXECUTION_HIGH = 1.4;
}
