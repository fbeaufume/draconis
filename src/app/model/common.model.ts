// Common model classes such as enumerations and utility classes

/**
 * A generic class type.
 */
export type Class<T> = new (...args: any[]) => T;

/**
 * The faction types.
 */
export enum FactionType {
  PARTY,
  OPPOSITION,
  OTHER,
}

/**
 * The types of creature.
 * Some characters, creatures or skills can be more or less efficient toward specific creature types.
 */
export enum CreatureType {
  HUMANOID,
  BEAST,
  UNDEAD,
  ELEMENTAL,
  OTHER,
}

/**
 * The various creature sizes, used to determine the number of creatures that can fit in a row.
 */
export enum CreatureSize {
  TINY = 0.6, // 4 max per rom
  SMALL = 0.75, // 4 max per rom
  REGULAR = 1, // 3 max per row
  LARGE = 1.5, // 2 max per row
  HUGE = 3, // 1 max per row
}

/**
 * The various classes of creatures.
 * When any value is changed, update class-icon.component.html.
 */
// TODO FBE remove MONK, PALADIN and ARCHER
export enum CreatureClass {
  ENEMY,
  END_OF_ROUND,
  WARRIOR,
  MONK,
  KNIGHT,
  PALADIN,
  ARCHER,
  MAGE,
  PRIEST,
}

/**
 * The various element types. A positive resistance to a given element reduces received damages from that element.
 */
export enum ElementType {
  NONE,
  PHYSICAL,
  BLEED,
  POISON,
  FIRE,
  ICE,
  LIGHTNING,
  LIGHT,
  DARK,
  ARCANE,
  // TODO FBE this is a fake element type, only used to make the code compile while implementing the elemental resistance feature, replace its usages by a real element types and remove it
  REMOVE_THIS,
}

export enum LifeChangeType {
  GAIN,
  LOSS,
}

export enum LifeChangeEfficiency {
  NORMAL,
  CRITICAL,
  DODGE,
}

/**
 * Types of expiration of a status.
 */
export enum StatusExpirationType {

  /**
   * The status expires at the end of the round, used by life over time changes.
   */
  END_OF_ROUND,

  /**
   * The status expires at the end of the origin creature turn, used by combo strike.
   */
  ORIGIN_CREATURE_TURN_END,

  /**
   * The status expires at the start of the origin creature turn, used by defend, attack or defense changes.
   */
  ORIGIN_CREATURE_TURN_START,
}

/**
 * Types of tags for the status types.
 */
export enum StatusTypeTagType {

  /**
   * The status type has a damage over time part.
   */
  DOT,

  /**
   * The status type has a heal over time part.
   */
  HOT,
}

/**
 * The type of target of a skill.
 */
export enum SkillTargetType {

  /**
   * The skill has no target.
   */
  NONE,

  /**
   * The same creature.
   */
  SELF,

  /**
   * An alive creature from the same faction.
   */
  SAME_ALIVE,

  /**
   * A wounded (i.e. alive but not full life) creature from the same faction.
   */
  SAME_WOUNDED,

  /**
   * An alive creature from the same faction and different than the current creature.
   */
  SAME_ALIVE_OTHER,

  /**
   * All alive creatures of the same faction.
   */
  SAME_ALIVE_ALL,

  /**
   * A dead creature from the same faction.
   */
  SAME_DEAD,

  /**
   * An alive creature from the other faction.
   */
  OTHER_ALIVE,

  /**
   * Two adjacent alive creatures (e.g. the hovered one + its right one) from the other faction.
   */
  OTHER_ALIVE_DOUBLE,

  /**
   * Three adjacent alive creatures (e.g., the hovered one + its left and right ones) from the other faction.
   */
  OTHER_ALIVE_TRIPLE,

  /**
   * All alive creatures of the other faction.
   */
  OTHER_ALIVE_ALL,

  /**
   * The first row of the other faction.
   */
  OTHER_FIRST_ROW,

  /**
   * An entire row of the other faction.
   */
  OTHER_ROW,

  /**
   * All creatures of the other faction.
   */
  OTHER_ALL,

  /**
   * An alive creature of any faction.
   */
  ALIVE,
}

/**
 * The types of skill modifiers.
 */
export enum SkillModifierType {

  /**
   * The attack cannot be dodged.
   */
  CANNOT_BE_DODGED,
}

/**
 * The current state in the game workflow.
 * Used to enable or disable action buttons, the selection of a target skill, enemy or character, etc
 */
export enum GameState {

  /**
   * Waiting for the player to start the next encounter: display no opposition but a "Continue" button.
   */
  START_NEXT_ENCOUNTER,

  /**
   * Waiting for the player to start the fight.
   */
  START_FIGHT,

  /**
   * Between creature turns.
   */
  END_OF_TURN,

  /**
   * Enemy turn.
   */
  ENEMY_TURN,

  /**
   * Character turn, the player must select a skill.
   */
  SELECT_SKILL,

  /**
   * Character turn, the player must select an enemy.
   */
  SELECT_ENEMY,

  /**
   * Character turn, the player must select a character.
   */
  SELECT_CHARACTER,

  /**
   * Character turn, the player must select a character or an enemy.
   */
  SELECT_CHARACTER_OR_ENEMY,

  /**
   * Executing the player skill.
   */
  EXECUTING_SKILL,

  /**
   * Cleared the dungeon.
   */
  DUNGEON_END,
}

/**
 * The various types of message items.
 */
export enum MessageItemType {
  CREATURE,
  SKILL,
  LIFE_CHANGE,
  STATUS_APPLICATION,
  OTHER,
}

/**
 * The various types of messages.
 */
export enum MessageType {
  BASIC_MESSAGE,
  ENTER_ZONE,
  OPPOSITION_APPEAR,
  START_ROUND,
  ADVANCE,
  WAIT,
  LEAVE,
  SKILL,
  SKILL_WITH_TARGET,
  SKILL_WITH_TARGET_AND_LIFE_CHANGE,
  DOT,
  HOT,
  ENEMY_DEFEAT,
  PAUSE_DURATION_CHANGED,
}

export enum BasicMessageType {
  PARTY_VICTORY = 'The party wins!',
  PARTY_DEFEAT = 'The party was defeated.',
  DUNGEON_CLEAR = 'The dungeon is cleared!',
  OLD_MAN_TRANSFORMATION = 'The old man is actually an elder druid and quite furious now.',
  DRAGON_BREATH = 'The dragon takes a deep breath.',
}

/**
 * Interface for data types that can inflict damages.
 */
export interface DamageSource {
  elementType: ElementType;
}
