import {Fight} from "./fight.model";
import {Creature, EnemyAction} from "./creature.model";
import {Skill} from "./skill.model";
import {SkillTargetType} from "./common.model";

/**
 * Interface for the various enemy combat strategies.
 */
export abstract class EnemyStrategy {

  /**
   * Choose the action for an active enemy, i.e. the chosen skill and the target creatures if any.
   */
  chooseAction(fight: Fight): EnemyAction | null {
    const skill: Skill | null = this.chooseSkill(fight);
    if (skill == null) {
      return null;
    } else {
      return new EnemyAction(skill, this.chooseTargets(skill, fight));
    }
  }

  /**
   * Choose the skill used by the active enemy.
   */
  abstract chooseSkill(fight: Fight): Skill | null;

  /**
   * Choose the targets for a given skill based on its target type.
   * The choice is currently random, but enemies could be smarter for example by focusing on the weaker party member.
   */
  chooseTargets(skill: Skill, fight: Fight): Creature[] {
    switch (skill.targetType) {
      case SkillTargetType.NONE:
        return [];
      case SkillTargetType.SELF:
        return fight.activeCreature != null ? [fight.activeCreature] : [];
      case SkillTargetType.SAME_WOUNDED:
         return fight.opposition.targetOneDamagedEnemy();
      case SkillTargetType.OTHER_ALIVE:
        return skill.range == 1 ? fight.party.targetOneFrontRowAliveCharacter() : fight.party.targetOneAliveCharacter();
      case SkillTargetType.OTHER_ALL:
        return fight.party.targetAllAliveCharacters();
      default:
        console.log('Error in chooseTargets, skill target type ' + skill.targetType + ' is not supported');
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

  chooseSkill(fight: Fight): Skill | null {
    if (this.skill.isUsableByActiveCreature(fight)) {
      return this.skill;
    } else {
      return null;
    }
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

  chooseSkill(fight: Fight): Skill | null {
    const usableSkills: Skill[] = [];
    const usableWeights: number[] = [];
    let usableTotalWeight: number = 0;

    // Keep only usable skills
    this.skills.filter(skill => skill.isUsableByActiveCreature(fight)).forEach((skill, index) => {
      usableSkills.push(skill);
      usableWeights.push(this.weights[index]);
      usableTotalWeight += this.weights[index];
    })

    // If there is no usable skill, return null
    if (usableSkills.length <= 0) {
      return null;
    }

    // If there is only one skill, use it
    if (usableSkills.length == 1) {
      return usableSkills[0];
    }

    // Randomly select a skill
    const random = Math.random();
    let cumulativeWeight = 0;
    for (let i = 0; i < usableWeights.length - 1; i++) {
      cumulativeWeight += usableWeights[i];
      if (random < cumulativeWeight / usableTotalWeight) {
        return usableSkills[i];
      }
    }
    return usableSkills[usableWeights.length - 1];
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

  chooseSkill(fight: Fight): Skill | null {
    // If this strategy is empty, return null
    if (this.skills.length <= 0) {
      return null;
    }

    // Find the next usable skill
    for (let i = 0; i < this.skills.length; i++) {
      const skill = this.skills[this.currentSkillIndex];

      this.incrementSkillIndex();

      if (skill.isUsableByActiveCreature(fight)) {
        return skill;
      }
    }

    return null;
  }

  private incrementSkillIndex() {
    this.currentSkillIndex++;
    if (this.currentSkillIndex >= this.skills.length) {
      this.currentSkillIndex = 0;
    }
  }
}

/**
 * Strategy using a skill or (if the skill cannot be used) a strategy.
 */
export class PrioritySkillStrategy extends EnemyStrategy {

  skill: Skill;

  strategy: EnemyStrategy;

  constructor(skill: Skill, strategy: EnemyStrategy) {
    super();
    this.skill = skill;
    this.strategy = strategy;
  }

  chooseSkill(fight: Fight): Skill | null {
    if (this.skill.isUsableByActiveCreature(fight)) {
      return this.skill;
    } else {
      return this.strategy.chooseSkill(fight);
    }
  }
}
