import {Fight} from "./fight.model";
import {Creature, EnemyAction} from "./creature.model";
import {Skill} from "./skill.model";
import {SkillTargetType} from "./common.model";

// TODO FBE in all strategy constructors, receive strategies instead of skills

/**
 * Interface for the various enemy combat strategies.
 */
export abstract class Strategy {

  /**
   * Choose the action for an active enemy, i.e. the chosen skill and the target creatures if any.
   */
  chooseAction(fight: Fight): EnemyAction | null {
    if (fight.activeCreature?.isCharacter()) {
      console.log(`Error in chooseAction, current creature '${fight.activeCreature?.name}' is not an enemy`);
    }

    const skill: Skill | null = this.chooseSkill(fight);

    if (skill == null) {
      return null; // TODO FBE return defaultEnemyAction instead of in StrategyEnemy.chooseAction, then change the return type to "EnemyAction"
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
      case SkillTargetType.OTHER_ALIVE_TRIPLE:
        // First target one creature
        const characters = skill.range == 1 ? fight.party.targetOneFrontRowAliveCharacter() : fight.party.targetOneAliveCharacter()

        // Then add the left one and the right one
        if (characters.length > 0) {
          const character = characters[0];

          const character1 = fight.party.getLeftCharacter(character);
          if (character1 != null) {
            characters.unshift(character1);
          }

          const character2 = fight.party.getRightCharacter(character);
          if (character2 != null) {
            characters.push(character2);
          }
        }

        return characters;
      case SkillTargetType.OTHER_ALIVE_ALL:
      case SkillTargetType.OTHER_ALL:
        return fight.party.targetAllAliveCharacters();
      default:
        console.log(`Error in chooseTargets, skill target type ${skill.targetType} is not supported`);
        return [];
    }
  }
}

/**
 * Strategy using a skill or (if the skill cannot be used) a strategy.
 */
export class PriorityStrategy extends Strategy {

  skill: Skill;

  strategy: Strategy;

  // TODO FBE receive strategies instead of one skill and one strategy
  constructor(skill: Skill, strategy: Strategy) {
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

/**
 * Strategy using several skills that are executed sequentially.
 */
export class SequentialStrategy extends Strategy {

  /**
   * The skills.
   */
  skills: Skill[];

  /**
   * The index in the skills array of the next skill to use.
   */
  currentIndex: number = 0;

  // TODO FBE receive a vararg instead of an array
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
      const skill = this.skills[this.currentIndex];

      this.incrementSkillIndex();

      if (skill.isUsableByActiveCreature(fight)) {
        return skill;
      }
    }

    return null;
  }

  private incrementSkillIndex() {
    this.currentIndex++;
    if (this.currentIndex >= this.skills.length) {
      this.currentIndex = 0;
    }
  }
}

// TODO FBE add a random strategy that extends WeightedStrategy

/**
 * A composite strategy that delegates to several weighted sub-strategies.
 * The final skill is randomly selected from the sub-strategies using the weights.
 * The higher the weight, the more likely that subs-strategy to be selected.
 */
export class WeightedStrategy extends Strategy {

  /**
   * The sub-strategies.
   */
  strategies: Strategy[] = [];

  /**
   * The weight of the sub-strategies.
   */
  weights: number[] = []

  constructor() {
    super();
  }

  // TODO FBE move the weight to first parameter
  /**
   * Add a sub-strategy with a weight to this strategy.
   */
  addSkill(strategy: Strategy, weight: number): WeightedStrategy {
    if (weight > 0) {
      this.strategies.push(strategy);
      this.weights.push(weight);
    }
    return this;
  }

  chooseSkill(fight: Fight): Skill | null {
    const usableSkills: Skill[] = [];
    const usableWeights: number[] = [];
    let usableTotalWeight: number = 0;

    // Keep only non null skills
    this.strategies.forEach((strategy, index) => {
      const skill = strategy.chooseSkill(fight);
      const i=1;
      if (skill != null) {
        usableSkills.push(skill);
        usableWeights.push(this.weights[index]);
        usableTotalWeight += this.weights[index];
      }
    });

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

// TODO FBE add a conditional strategy
