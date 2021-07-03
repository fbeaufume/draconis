/**
 * The type of target of a skill.
 */
export enum SkillTargetType {

  /**
   * The skill has no target.
   */
  NONE,

  /**
   * An alive creature from the same faction.
   */
  SAME_ALIVE,

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
   * Two adjacent creatures (e.g. the hovered one + its right one) from the other faction.
   */
  OTHER_ALIVE_DOUBLE,

  /**
   * Three adjacent creatures (e.g., the hovered one + its left and right ones) from the other faction.
   */
  OTHER_ALIVE_TRIPLE,

  /**
   * An entire row of the other faction.
   */
  OTHER_ROW,

  /**
   * All creatures of the other faction.
   */
  OTHER_ALL,
}
