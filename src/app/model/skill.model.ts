// Skill related classes

import {Fight} from './game.model';
import {Creature, Enemy} from './creature.model';
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
    // Generic power of the skill, currently multiplied by the power of the creature to get the effective amount of damage or heal
    public power: number,
    public description: string
  ) {
  }

  /**
   * Return true if the skill can be selected by a character.
   */
  isSelectableBy(creature: Creature | null): boolean {
    if (creature == null) {
      return false;
    }

    // Check the skill cost
    // noinspection RedundantIfStatementJS
    if (this.cost > creature.energy) {
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

  /**
   * Compute an effective damage from a base damage by applying a small random modification.
   */
  computeEffectiveDamage(base: number): number {
    return Math.round((0.85 + Math.random() * 0.3) * base);
  }

  /**
   * Compute an effective heal from a base damage by applying a small random modification.
   */
  computeEffectiveHeal(base: number): number {
    return this.computeEffectiveDamage(base);
  }

  execute(fight: Fight, logs: Log[]): void {
    fight.activeCreature?.spendEnergy(this.cost);
  }
}

/**
 * Move on row forward. Only used by enemies.
 */
export class Advance extends Skill {

  execute(fight: Fight, logs: Log[]): void {
    super.execute(fight, logs);

    logs.push(new Log(LogType.Advance, fight.activeCreature));
  }
}

/**
 * No action.
 */
export class Wait extends Skill {

  execute(fight: Fight, logs: Log[]): void {
    super.execute(fight, logs);

    logs.push(new Log(LogType.Wait, fight.activeCreature));
  }
}

/**
 * Inhale before a breath attack.
 */
export class Inhale extends Skill {

  execute(fight: Fight, logs: Log[]): void {
    super.execute(fight, logs);

    logs.push(new Log(LogType.Inhale, fight.activeCreature));
  }
}

/**
 * A defend skill.
 */
export class Defend extends Skill {

  execute(fight: Fight, logs: Log[]): void {
    super.execute(fight, logs);

    logs.push(new Log(LogType.Defend, fight.activeCreature));
  }
}

/**
 * A damaging skill.
 */
export class Damage extends Skill {

  execute(fight: Fight, logs: Log[]): void {
    super.execute(fight, logs);

    const baseDamage = this.power * (fight.activeCreature?.power ?? 0);

    fight.targetCreatures.forEach(creature => {
      const effectiveDamage = this.computeEffectiveDamage(baseDamage);

      creature.damage(effectiveDamage);
      logs.push(new Log(LogType.Damage, fight.activeCreature, creature, effectiveDamage));
    });
  }
}

/**
 * A healing skill.
 */
export class Heal extends Skill {

  execute(fight: Fight, logs: Log[]): void {
    super.execute(fight, logs);

    const baseHeal = this.power * (fight.activeCreature?.power ?? 0);

    fight.targetCreatures.forEach(creature => {
      const effectiveHeal = this.computeEffectiveHeal(baseHeal);
      creature.heal(effectiveHeal);
      logs.push(new Log(LogType.Heal, fight.activeCreature, creature, effectiveHeal));
    });
  }
}

// Enemies skills
export const advance = new Advance('', SkillTarget.NONE, 0, 0, 0, 0, '');
export const wait = new Wait('', SkillTarget.NONE, 0, 0, 0, 0, '');
export const inhale = new Inhale('', SkillTarget.NONE, 0, 0, 0, 0, '');

// Common characters skills
export const techDefend = new Defend('Defend', SkillTarget.NONE, -40, 0, 0, 0,
  'Defend against attacks. Generates 40 TP.');
export const magicDefend = new Defend('Defend', SkillTarget.NONE, 0, 0, 0, 0,
  'Defend against attacks.');
export const strike = new Damage('Strike', SkillTarget.ENEMY, 10, 1, 0, 1,
  'Basic attack, does 100% weapon damage.');
export const heal: Skill = new Heal('Heal', SkillTarget.CHARACTER, 5, 0, 0, 1,
  'Heal a party member for 100% weapon damage.');

// Rogue skills

// Warrior skills

// Paladin skills
export const paladinStrike = new Damage('Strike', SkillTarget.ENEMY, 0, 1, 0, 0.7,
  'Basic attack, does 70% weapon damage.');
export const holyStrike = new Damage('Holy Strike', SkillTarget.ENEMY, 5, 1, 0, 1,
  'Holy attack, does 100% weapon damage.');

// Hunter skills
export const shot = new Damage('Shot', SkillTarget.ENEMY, 10, 2, 0, 1,
  'Basic ranged attack, does 100% weapon damage.');

// Mage skills
export const blast = new Damage('Blast', SkillTarget.ENEMY, 5, 2, 0, 1,
  'Magical attack, does 100% weapon damage.');

// Priest skills
export const spark = new Damage('Spark', SkillTarget.ENEMY, 5, 2, 0, 0.8,
  'Magical attack, does 80% weapon damage.');
