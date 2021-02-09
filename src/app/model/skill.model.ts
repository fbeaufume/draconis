// Skill related classes

import {Character} from './misc.model';
import {Fight} from './fight.model';
import {Log, LogType} from './log.model';
import {Enemy} from './enemy.model';

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
   * Return true if the skill can be selected by a character.
   * @param character
   */
  isSelectableBy(character: Character | null): boolean {
    if (character == null) {
      return false;
    }

    // Check the skill cost
    // noinspection RedundantIfStatementJS
    if (this.cost > character.energy) {
      return false;
    }

    return true;
  }

  /**
   * Return true if the skill can be used on an enemy.
   */
  isUsableOn(enemy: Enemy): boolean {
    // Check the skill range
    // noinspection RedundantIfStatementJS
    if (this.range > 0 && enemy.distance > this.range) {
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

    logs.push(new Log(LogType.Defend, fight.activeCharacter));
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
