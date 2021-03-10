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
export const OPPOSITION_ROWS = 3;

/**
 * Maximum number of enemies per row.
 */
export const OPPOSITION_ROW_SIZE = 4;

/**
 * A pause duration preset, in msec.
 */
export const PAUSE_SHORT = 100;

/**
 * A pause duration preset, in msec.
 */
export const PAUSE_LONG = 800;

/**
 * The randomization range of damages and heals, 0.3 means +/- 15%.
 */
export const RANDOMIZE_RANGE = 0.3;

export const RANDOMIZE_BASE = 1 - RANDOMIZE_RANGE / 2;

/**
 * Default dodge chance.
 */
export const DODGE_CHANCE = 0.5;

/**
 * Default critical hit chance for damages and heals.
 */
export const CRITICAL_CHANCE = 0.5;

/**
 * Default critical bonus for damages and heals.
 */
export const CRITICAL_BONUS = 1.5;

/**
 * Damage modification when using the defend status.
 */
export const DEFEND_BONUS = 0.8;
