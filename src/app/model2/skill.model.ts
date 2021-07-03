import {SkillType} from "./skill-type.model";
import {SkillTargetType} from "./skill-target-type.model";

/**
 * A creature skill. Can be used during a creature turn.
 */
export class Skill {

  type: SkillType;

  name: string;

  targetType: SkillTargetType;

  /**
   * The energy cost of the skill when used.
   */
  cost: number;

  /**
   * The range of the skill:
   * - 0 means it can target only creatures of the same faction
   * - 1+ is the number of rows of the other faction it can reach
   */
  range: number;

  /**
   * The cooldown of the skill, i.e. the number of turns to wait before being able to use it again:
   * - 2 means that if the skill was used in the first turn, the creature will have to wait for
   * turn 3 before using it again
   * - 1 means that the skill can be used at most once per turn
   * - 0 means it can be used without restriction (relevant for multi attack creatures only)
   */
  cooldownMax: number;

  /**
   * The current cooldown of the skill.
   * This is decreased before a creature turn.
   * When it reaches 0 the skill can be used.
   */
  cooldown: number;

  description: string;

  constructor(type: SkillType, name: string, targetType: SkillTargetType, cost: number, range: number, cooldownMax: number, description: string) {
    this.type = type;
    this.name = name;
    this.targetType = targetType;
    this.cost = cost;
    this.range = range;
    this.cooldownMax = cooldownMax;
    this.cooldown = cooldownMax;
    this.description = description;
  }
}
