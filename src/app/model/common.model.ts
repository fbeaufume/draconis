// Common model classes such as enumerations

/**
 * The various classes of creatures.
 * When any value is changed, update class-icon.component.html.
 */
export enum CreatureClass {
  ENEMY = 'enemy',
  END_OF_ROUND = 'end-of-round',
  WARRIOR = 'Warrior',
  MONK = 'Monk',
  PALADIN = 'Paladin',
  ARCHER = 'Archer',
  MAGE = 'Mage',
  PRIEST = 'Priest'
}

export enum LifeChangeType {
  GAIN,
  LOSS
}

export enum LifeChangeEfficiency {
  NORMAL,
  CRITICAL,
  DODGE
}

/**
 * The various status names.
 */
export enum StatusName {
  DEFEND,
  BLEED,
  POISON,
  REGEN,
  COMBO1,
  COMBO2,
  ATTACK,
  DEFENSE,
}

/**
 * Types of expiration of a status.
 */
export enum StatusExpiration {
  // THe status expires at the beginning of the creature turn, used by Defend skill
  CREATURE_TURN,
  // The status expires at the end of the round, used by HOTs and DOTs
  END_OF_ROUND,
  // The status expires at the end of the origin creature turn, used by combo strike
  ORIGIN_CREATURE_TURN_END,
  // The status expires at the start of the origin creature turn, used by various buffs and debuffs
  ORIGIN_CREATURE_TURN_START, // TODO FBE make these statuses expire
}

/**
 * The type of a skill, to use the right icon.
 * When any numeric value is changed, update skill-icon.component.html.
 */
export enum SkillType {
  DEFENSE,
  ATTACK,
  HEAL,
  IMPROVEMENT,
  DETERIORATION,
}

/**
 * The type of target of a skill.
 */
export enum SkillTarget {
  NONE,
  // An alive character
  CHARACTER_ALIVE,
  // All alive characters
  CHARACTER_ALL_ALIVE,
  // An alive character different than the current character
  CHARACTER_OTHER,
  // A dead character
  CHARACTER_DEAD,
  // A single enemy
  ENEMY_SINGLE,
  // Two adjacent enemies, the hovered one + its right one
  ENEMY_DOUBLE,
  // Three adjacent enemies, the hovered one + its left and right ones
  ENEMY_TRIPLE,
}

/**
 * The current state in the game workflow.
 * Used to enable or disable action buttons, the selection of a target skill, enemy or character, etc
 * When some numeric values are changed, update accordingly the calls to 'usePointerForState' in fight.component.html.
 */
export enum GameState {
  // Waiting for the player to start the next encounter: display no opposition but a "Continue" button
  START_NEXT_ENCOUNTER,
  // Waiting for the player to start the fight
  START_FIGHT,
  // Between creature turns
  END_OF_TURN,
  // Enemy turn
  ENEMY_TURN,
  // Character turn, the player must select a skill
  SELECT_SKILL,
  // Character turn, the player must select an enemy
  SELECT_ENEMY,
  // Character turn, the player must select a character
  SELECT_CHARACTER,
  // Executing the player skill
  EXECUTING_SKILL,
  // Cleared the dungeon
  DUNGEON_END,
}

/**
 * Types of log messages.
 */
export enum LogType {
  EnterZone,
  OppositionAppear,
  StartRound,
  Advance,
  Wait,
  Leave,
  Defend,
  Damage,
  DamageAndHeal,
  DamageAndDamage,
  Heal,
  Revive,
  Dot,
  Hot,
  EnemyDefeated,
  PartyVictory,
  PartyDefeat,
  PauseDurationChanged,
  OldManTransformation,
  PositiveStatus,
  NegativeStatus,
}
