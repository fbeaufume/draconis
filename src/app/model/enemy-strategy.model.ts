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
  abstract chooseAction(fight: Fight): EnemyAction;

  /**
   * Choose the targets for a given skill based on its target type.
   * The choice is currently random, but enemies could be smarter for exampel by focusing on the weaker party member.
   */
  chooseTargets(skill: Skill, fight: Fight): Creature[] {
    switch (skill.targetType) {
      case SkillTargetType.OTHER_ALIVE:
        return fight.party.targetOneFrontRowAliveCharacter();
        break;
      case SkillTargetType.OTHER_ALL:
        return fight.party.targetAllAliveCharacters();
        break;
      default:
        // Programming error
        return [];
    }

    return [];
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

// TODO FBE add a WeightedSkillStrategy
