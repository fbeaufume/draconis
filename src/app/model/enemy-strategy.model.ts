// TODO FBE keep Enemy and MeleeEnemy but remove other Enemy classes and replace them with strategies

import {Fight} from "./fight.model";
import {Creature, EnemyAction} from "./creature.model";
import {Skill} from "./skill.model";

/**
 * Interface for the various enemy combat strategies.
 */
export abstract class EnemyStrategy {

  /**
   * Choose the action for an active enemy, i.e. the chosen skill and the target creatures if any.
   */
  abstract chooseAction(fight: Fight): EnemyAction;

  chooseTargets(skill: Skill, fight: Fight): Creature[] {
    // TODO FBE implement this
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
