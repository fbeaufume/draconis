/**
 * The type of a skill, used to categorize the skills in the UI.
 */
export enum SkillType {

  /**
   * The skill is mostly a defensive one.
   */
  DEFENSE,

  /**
   * The skill is mostly a damaging one.
   */
  ATTACK,

  /**
   * The skill is mostly a healing one.
   */
  HEAL,

  /**
   * The skill is mostly an improvement for a creature of the same faction.
   */
  IMPROVEMENT,

  /**
   * The skill is mostly a deterioration for a creature of the other faction.
   */
  DETERIORATION,
}
