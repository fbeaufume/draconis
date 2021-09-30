import {Fight} from "./fight.model";
import {Creature, EnemyAction} from "./creature.model";
import {Skill, Strike} from "./skill.model";
import {SkillTargetType} from "./common.model";

/**
 * Interface for the various enemy combat strategies.
 */
export abstract class EnemyStrategy {

  /**
   * Last resort skill used when something went wrong in the strategy.
   */
  defaultSkill: Skill = new Strike('Attack'); // TODO FBE use "wait" instead ?

  /**
   * Choose the action for an active enemy, i.e. the chosen skill and the target creatures if any.
   */
  abstract chooseAction(fight: Fight): EnemyAction;

  /**
   * Choose the targets for a given skill based on its target type.
   * The choice is currently random, but enemies could be smarter for example by focusing on the weaker party member.
   */
  chooseTargets(skill: Skill, fight: Fight): Creature[] {
    switch (skill.targetType) {
      case SkillTargetType.SELF:
        return fight.activeCreature != null ? [fight.activeCreature] : [];
      case SkillTargetType.OTHER_ALIVE:
        return fight.party.targetOneFrontRowAliveCharacter();
      case SkillTargetType.OTHER_ALL:
        return fight.party.targetAllAliveCharacters();
      default:
        console.log('Error, skill target type ' + skill.targetType + ' is not supported');
        return [];
    }
  }
}

/**
 * Simple strategy using a single skill.
 */
export class SingleSkillStrategy extends EnemyStrategy {

  /**
   * The unique skill used by this strategy.
   */
  skill: Skill;

  constructor(skill: Skill) {
    super();
    this.skill = skill;
  }

  chooseAction(fight: Fight): EnemyAction {
    return new EnemyAction(this.skill, this.chooseTargets(this.skill, fight));
  }
}

/**
 * Strategy using several skills. Each skill has a weight.
 * To return an action, a skill is randomly selected using the weight.
 * The higher the weight, the more likely the skill to be selected.
 */
export class WeightedSkillStrategy extends EnemyStrategy {

  /**
   * The skills.
   */
  skills: Skill[] = [];

  /**
   * The weight of the skills.
   */
  weights: number[] = []

  /**
   * The total weight of the skills.
   */
  totalWeight: number = 0;

  constructor() {
    super();
  }

  /**
   * Add a skill with a weight to this strategy.
   */
  addSkill(skill: Skill, weight: number): WeightedSkillStrategy {
    if (weight > 0) {
      this.skills.push(skill);
      this.weights.push(weight);
      this.totalWeight += weight;
    }
    return this;
  }

  chooseAction(fight: Fight): EnemyAction {
    // If this strategy is empty (i.e. no skill), use the default skill
    if (this.skills.length <= 0) {
      return new EnemyAction(this.defaultSkill, this.chooseTargets(this.defaultSkill, fight));
    }

    // If there is only one skill, use it
    if (this.skills.length <= 1) {
      return new EnemyAction(this.skills[0], this.chooseTargets(this.skills[0], fight));
    }

    // Randomly select a skill
    const random = Math.random();
    let cumulativeWeight = 0;
    for (let i = 0; i < this.weights.length - 1; i++) {
      cumulativeWeight += this.weights[i];
      if (random < cumulativeWeight / this.totalWeight) {
        return new EnemyAction(this.skills[i], this.chooseTargets(this.skills[i], fight));
      }
    }
    const lastSkill = this.skills[this.weights.length - 1];
    return new EnemyAction(lastSkill, this.chooseTargets(lastSkill, fight));
  }
}

/**
 * Strategy using several skills that are executed sequentially.
 */
export class SequentialSkillStrategy extends EnemyStrategy {

  /**
   * The skills.
   */
  skills: Skill[];

  /**
   * The index in the skills array of the next skill to use.
   */
  currentSkillIndex: number = 0;

  constructor(skills: Skill[]) {
    super();
    this.skills = skills;
  }

  chooseAction(fight: Fight): EnemyAction {
    // If this strategy is empty (i.e. no skill), use the default skill
    if (this.skills.length <= 0) {
      return new EnemyAction(this.defaultSkill, this.chooseTargets(this.defaultSkill, fight));
    }

    const skill = this.skills[this.currentSkillIndex];

    // Increment the skill index
    this.currentSkillIndex++;
    if (this.currentSkillIndex >= this.skills.length) {
      this.currentSkillIndex = 0;
    }

    return new EnemyAction(skill, this.chooseTargets(skill, fight));
  }
}
