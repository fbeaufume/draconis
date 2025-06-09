import {Fight} from './fight.model';
import {Creature} from './creature.model';
import {Skill, Wait} from './skill.model';
import {SkillTargetType} from './common.model';
import {Logger} from '../util/log';

/**
 * Interface for the various enemy combat strategies.
 */
export abstract class Strategy {

  logger: Logger = new Logger('Strategy');

  /**
   * Choose the action for an active enemy, i.e. the chosen skill and the target creatures if any.
   */
  chooseAction(fight: Fight): EnemyAction {
    if (fight.activeCreature?.isCharacter()) {
      this.logger.error(`Current creature '${fight.activeCreature?.name}' is not an enemy, in chooseAction`);
    }

    // TODO FBE see if chooseSkill and chooseTargets could be merged into a single method
    const skill: Skill | null = this.chooseSkill(fight);

    if (skill == null) {
      return new EnemyAction(new Wait(), []);
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
        this.logger.error(`Invalid skill target type ${skill.targetType} in chooseTargets`);
        return [];
    }
  }
}

/**
 * An enemy action.
 */
export class EnemyAction {

  /**
   * The executed skill.
   */
  skill: Skill;

  /**
   * The creatures targeted by the skill, if any.
   */
  targetCreatures: Creature[];

  constructor(
    skill: Skill,
    targetCreatures: Creature[]) {
    this.skill = skill;
    this.targetCreatures = targetCreatures;
  }
}

/**
 * A composite strategy that delegate to prioritized sub-strategies.
 * The final skill is selected from the subs-strategies, from the first to the last, until one of them is valid.
 */
export class PriorityStrategy extends Strategy {

  /**
   * The sub-strategies.
   */
  private strategies: Strategy[] = [];

  constructor(...strategies: Strategy[]) {
    super();
    this.strategies = strategies;
  }

  chooseSkill(fight: Fight): Skill | null {
    for (let i = 0; i < this.strategies.length; i++) {
      const skill = this.strategies[i].chooseSkill(fight);
      if (skill != null) {
        return skill;
      }
    }

    return null;
  }
}

/**
 * A composite strategy that delegates to several ordered sub-strategies.
 * First, the first sub-strategy is tried, then the second, then the third, etc, until the last sub-strategy
 * is reached, then it starts over.
 */
export class SequentialStrategy extends Strategy {

  /**
   * The sub-strategies.
   */
  private strategies: Strategy[];

  /**
   * The index in the skills array of the next skill to use.
   */
  private currentIndex: number = 0;

  constructor(...strategies: Strategy[]) {
    super();
    this.strategies = strategies;
  }

  chooseSkill(fight: Fight): Skill | null {
    // Find the next usable skill
    for (let i = 0; i < this.strategies.length; i++) {
      const skill = this.strategies[this.currentIndex++ % this.strategies.length].chooseSkill(fight);
      if (skill != null) {
        return skill;
      }
    }

    return null;
  }
}

/**
 * A composite strategy that delegates to several weighted sub-strategies.
 * The final skill is randomly selected from the sub-strategies using the weights.
 * The higher the weight, the more likely that subs-strategy to be selected.
 */
export class WeightedStrategy extends Strategy {

  /**
   * The weight of the sub-strategies.
   */
  private weights: number[] = [];

  /**
   * The sub-strategies.
   */
  private strategies: Strategy[] = [];

  constructor() {
    super();
  }

  /**
   * Add a sub-strategy with a weight to this strategy.
   */
  addStrategy(weight: number, strategy: Strategy): WeightedStrategy {
    if (weight > 0) {
      this.weights.push(weight);
      this.strategies.push(strategy);
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

/**
 * A composite strategy that delegates to several conditional sub-strategies.
 * Each sub-strategy has a condition (e.g. the life of the creature is lower than a certain percentage).
 * Each sub-strategy is tried in order until a skill is selected: first the condition is checked, then the result skill.
 */
export class ConditionalStrategy extends Strategy {

  /**
   * The conditions of the sub-strategies.
   */
  private conditions: StrategyCondition[] = [];

  /**
   * The sub-strategies.
   */
  private strategies: Strategy[] = [];

  constructor() {
    super();
  }

  /**
   * Add a sub-strategy with a condition to this strategy.
   */
  addStrategy(condition: StrategyCondition, strategy: Strategy): ConditionalStrategy {
    this.conditions.push(condition);
    this.strategies.push(strategy);
    return this;
  }

  /**
   * Add a sub-strategy with an always true condition to this strategy.
   */
  addDefaultStrategy(strategy: Strategy): ConditionalStrategy {
    this.conditions.push((_1, _2) => true);
    this.strategies.push(strategy);
    return this;
  }

  chooseSkill(fight: Fight): Skill | null {
    // Find the first usable skill
    for (let i = 0; i < this.strategies.length; i++) {
      if (this.conditions[i](fight.activeCreature!, fight)) {
        const skill = this.strategies[i].chooseSkill(fight);
        if (skill != null) {
          return skill;
        }
      }
    }

    return null;
  }
}

export type StrategyCondition = (currentCreature: Creature, fight: Fight) => boolean;
