// Constants

/**
 * Number of character rows.
 */
export const PARTY_ROWS = 2;

/**
 * Number of characters per row.
 */
export const PARTY_ROW_SIZE = 3;

/**
 * Number of characters in the party.
 */
export const PARTY_SIZE = PARTY_ROWS * PARTY_ROW_SIZE;

/**
 * Number of enemy rows.
 */
export const OPPOSITION_ROWS = 2;

/**
 * Maximum number of enemies per row.
 */
export const OPPOSITION_ROW_SIZE = 3;

/**
 * A pause duration preset, in msec.
 */
export const PAUSE_SHORT = 100;

/**
 * A pause duration preset, in msec.
 */
export const PAUSE_LONG = 1000;

/**
 * The randomization range of damages and heals, 0.3 means +/- 15%.
 */
export const RANDOMIZE_RANGE = 0.3;

export const RANDOMIZE_BASE = 1 - RANDOMIZE_RANGE / 2;

/**
 * Default dodge chance.
 */
export const DODGE_CHANCE = 0.1;

/**
 * Default critical hit chance for damages and heals.
 */
export const CRITICAL_CHANCE = 0.1;

/**
 * Default critical bonus for damages and heals.
 */
export const CRITICAL_BONUS = 1.5;

/**
 * Damage modification when using the defend status. 0.2 means 20% damage reduction.
 */
export const DEFEND_BONUS = 0.2;

/**
 * Damage modification when using the attack status. 0.2 means 20% damage augmentation or reduction.
 */
export const ATTACK_BONUS = 0.2;

/**
 * Damage modification when using the defend status. 0.2 means 20% damage augmentation or reduction.
 */
export const DEFENSE_BONUS = 0.2;

/**
 * Percentage of mana gained by the characters after an enemy died.
 */
export const MANA_GAIN_PER_DEAD_ENEMY = 0.15;

/**
 * Duration for most statuses.
 */
export const EFFECT_DURATION = 3;

/**
 * Duration for defend status.
 */
export const DEFEND_DURATION = 1;

/**
 * Duration for combo statuses.
 */
export const COMBO_DURATION = 2;
