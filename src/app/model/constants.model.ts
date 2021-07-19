// Application constants

export class Constants {

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
  static readonly OPPOSITION_ROW_SIZE = 3;

  /**
   * A pause duration preset, in msec.
   */
  static readonly PAUSE_SHORT = 100;

  /**
   * A pause duration preset, in msec.
   */
  static readonly PAUSE_LONG = 1000;

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
   * Percentage of mana gained by the characters after an enemy died.
   */
  static readonly MANA_GAIN_PER_DEAD_ENEMY = 0.15;

  /**
   * Duration for most statuses.
   */
  static readonly EFFECT_DURATION = 3;

  /**
   * Duration for defend status.
   */
  static readonly DEFEND_DURATION = 1;

  /**
   * Duration for combo statuses.
   */
  static readonly COMBO_DURATION = 2;
}
