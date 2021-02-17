// Skill related classes

import {Fight} from './game.model';
import {Character, Creature, Enemy} from './creature.model';
import {Log, LogType} from './log.model';

/**
 * The type of target of a skill
 */
export enum SkillTarget {
  NONE,
  CHARACTER_ALIVE,
  CHARACTER_DEAD,
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
   * Return true if the player can select this skill for a given character.
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
   * Return true if the player to use this skill on the target creature.
   */
  isUsableOn(creature: Character | Enemy): boolean {
    switch (this.target) {
      case SkillTarget.CHARACTER_ALIVE:
        return (creature instanceof Character) && creature.isAlive();
      case SkillTarget.CHARACTER_DEAD:
        return (creature instanceof Character) && creature.isDead();
      case SkillTarget.ENEMY:
        return (creature instanceof Enemy) && creature.isAlive() && (this.range >= creature.distance);
    }

    return false;
  }

  /**
   * Compute an effective damage from a base damage by applying a small random modification.
   */
  computeEffectiveDamage(base: number): number {
    return (0.85 + Math.random() * 0.3) * base;
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
      logs.push(new Log(LogType.Damage, fight.activeCreature, creature,
        creature.damage(this.computeEffectiveDamage(baseDamage))));
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
      logs.push(new Log(LogType.Heal, fight.activeCreature, creature,
        creature.heal(this.computeEffectiveHeal(baseHeal))));
    });
  }
}

/**
 * A revive skill.
 */
export class Revive extends Skill {

  execute(fight: Fight, logs: Log[]): void {
    super.execute(fight, logs);

    fight.targetCreatures.forEach(creature => {
      creature.heal(creature.lifeMax / 2);
      logs.push(new Log(LogType.Revive, fight.activeCreature, creature));
    });
  }
}

// Enemies skills
export const advance = new Advance('', SkillTarget.NONE, 0, 0, 0, 0, '');
export const wait = new Wait('', SkillTarget.NONE, 0, 0, 0, 0, '');
export const inhale = new Inhale('', SkillTarget.NONE, 0, 0, 0, 0, '');
export const strikeSmall = new Damage('', SkillTarget.ENEMY, 0, 0, 0, 0.7, '');

// Common characters skills
export const techDefend = new Defend('Defend', SkillTarget.NONE, -30, 0, 0, 0,
  'Defend against attacks. Gain 30 TP.');
export const magicDefend = new Defend('Defend', SkillTarget.NONE, -5, 0, 0, 0,
  'Defend against attacks. Gain 5 MP.');
export const strike = new Damage('Strike', SkillTarget.ENEMY, 10, 1, 0, 1,
  'Basic attack, does 100% weapon damage.');
export const heal: Skill = new Heal('Heal', SkillTarget.CHARACTER_ALIVE, 5, 0, 0, 1,
  'Heal a party member for 100% weapon damage.');
export const revive: Skill = new Revive('Revive', SkillTarget.CHARACTER_DEAD, 20, 0, 0, 1,
  'Revive a party member with half his life.');

// Warrior skills
export const smash = new Damage('Smash', SkillTarget.ENEMY, 20, 1, 0, 1.5,
  'Strong attack, does 150% weapon damage.');

// Monk skills
export const monkHeal: Skill = new Heal('Heal', SkillTarget.CHARACTER_ALIVE, 10, 0, 0, 1,
  'Heal a party member for 100% weapon damage.');
export const monkRevive: Skill = new Heal('Revive', SkillTarget.CHARACTER_DEAD, 40, 0, 0, 1,
  'Revive a party member with half his life.');

// Paladin skills
export const holyStrike = new Damage('Holy Strike', SkillTarget.ENEMY, 5, 1, 0, 1,
  'Holy attack, does 100% weapon damage.');

// Hunter skills
export const shot = new Damage('Shot', SkillTarget.ENEMY, 10, 2, 0, 1,
  'Basic ranged attack, does 100% weapon damage.');
export const preciseShot = new Damage('Precise Shot', SkillTarget.ENEMY, 20, 2, 0, 1.5,
  'String ranged attack, does 150% weapon damage.');

// Mage skills
export const burn = new Damage('Burn', SkillTarget.ENEMY, 5, 2, 0, 1,
  'Magic attack, does 100% weapon damage.');
export const blast = new Damage('Blast', SkillTarget.ENEMY, 10, 2, 0, 1.5,
  'Strong magic attack, does 150% weapon damage.');

// Priest skills
export const spark = new Damage('Spark', SkillTarget.ENEMY, 5, 2, 0, 0.8,
  'Magical attack, does 80% weapon damage.');
