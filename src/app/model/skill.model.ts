// Skill related classes

import {Creature} from './misc.model';
import {Fight} from './fight.model';
import {Log, LogType} from './log.model';

/**
 * The type of target of a skill
 */
export enum SkillTarget {
  NONE,
  CHARACTER,
  ENEMY
}

/**
 * A character skill.
 */
export abstract class Skill {

  constructor(
    public name: string,
    public target: SkillTarget,
    // Skill cost, in energy points
    public cost: number,
    // Skill range in number of rows, 0 if not applicable
    public range: number,
    public coolDown: number,
    // Generic power of the skill, i.e. damage amount for offensive skills, heal amount for heal skills, etc
    public power: number,
    public description: string
  ) {
  }

  /**
   * Return true if the skill can be used on the target creature.
   */
  isUsableOn(creature: Creature): boolean {
    // Check the range
    if (this.range > 0 && creature.row > this.range) {
      return false;
    }

    return true;
  }

  execute(fight: Fight, logs: Log[]): void {
    fight.activeCharacter?.spendEnergy(this.cost);
  }
}

/**
 * A defend skill.
 */
export class Defend extends Skill {

  execute(fight: Fight, logs: Log[]): void {
    super.execute(fight, logs);

    // Currently does noting
    // TODO FBE boot the creature defense for a round

    logs.push(new Log(LogType.Defend, fight.activeCharacter?.name));
  }
}

/**
 * A damaging skill.
 */
export class Damage extends Skill {

  execute(fight: Fight, logs: Log[]): void {
    super.execute(fight, logs);

    const damage = this.power;
    fight.targetEnemy?.inflictDamage(damage);

    logs.push(new Log(LogType.Damage, fight.activeCharacter, fight.targetEnemy, damage));
  }
}

/**
 * A healing skill.
 */
export class Heal extends Skill {

  execute(fight: Fight, logs: Log[]): void {
    super.execute(fight, logs);

    const heal = this.power;
    fight.targetCharacter?.inflictDamage(-heal);

    logs.push(new Log(LogType.Heal, fight.activeCharacter, fight.targetCharacter, heal));
  }
}
