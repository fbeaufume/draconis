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
  // The skill targets a single enemy
  ENEMY_SINGLE,
  // The skill targets two adjacent enemies, the hovered one + its right one
  ENEMY_DOUBLE,
  // The skill targets three adjacent enemies, the hovered one + its left and right ones
  ENEMY_TRIPLE,
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
    public description: string,
    // Main power of the skill, for example to damage the target creature
    public power1: number = 1,
    // Second power of the skill, for example to damage an extra creature
    public power2: number = 1,
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
      case SkillTarget.ENEMY_SINGLE:
      case SkillTarget.ENEMY_DOUBLE:
      case SkillTarget.ENEMY_TRIPLE:
        return (creature instanceof Enemy) && creature.isAlive() && (this.range >= creature.distance);
      default:
        return false;
    }
  }

  /**
   * Some skills have an area of effect. This method returns the effective target enemies for the skill based
   * on the currently aimed (i.e. hovered or selected) enemy.
   */
  getTargetEnemies(enemy: Enemy, fight: Fight): Enemy[] {
    const targets = [];

    switch (this.target) {
      case SkillTarget.ENEMY_SINGLE:
        targets.push(enemy);

        break;
      case SkillTarget.ENEMY_DOUBLE:
        targets.push(enemy);

        // Add the enemy at the right, if any
        const enemy1 = fight.opposition.getRightEnemy(enemy);
        if (enemy1 != null) {
          targets.push(enemy1);
        }

        break;
      case SkillTarget.ENEMY_TRIPLE:
        // Add the enemy at the left, if any
        const enemy2 = fight.opposition.getLeftEnemy(enemy);
        if (enemy2 != null) {
          targets.push(enemy2);
        }

        targets.push(enemy);

        // Add the enemy at the right, if any
        const enemy3 = fight.opposition.getRightEnemy(enemy);
        if (enemy3 != null) {
          targets.push(enemy3);
        }

        break;
    }

    return targets;
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
 * Leave the fight.
 */
export class Leave extends Skill {

  execute(fight: Fight, logs: Log[]): void {
    super.execute(fight, logs);

    // Remove the creature from the fight
    if (fight.activeCreature != null) {
      fight.activeCreature.life = 0;
      fight.opposition.removeDeadEnemies();
      fight.opposition.removeEmptyRows();
    }

    logs.push(new Log(LogType.Leave, fight.activeCreature));
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

    const baseDamage = this.power1 * (fight.activeCreature?.power ?? 0);

    fight.targetCreatures.forEach(creature => {
      logs.push(new Log(LogType.Damage, fight.activeCreature, creature,
        creature.damage(this.computeEffectiveDamage(baseDamage))));
    });
  }
}

/**
 * A skill that damages the target creatures and heals the origin creature.
 */
export class DamageAndHeal extends Skill {

  execute(fight: Fight, logs: Log[]): void {
    super.execute(fight, logs);

    const baseDamage = this.power1 * (fight.activeCreature?.power ?? 0);
    const baseHeal = this.power2 * (fight.activeCreature?.power ?? 0);

    fight.targetCreatures.forEach(creature => {
      logs.push(new Log(LogType.DamageAndHeal, fight.activeCreature, creature,
        creature.damage(this.computeEffectiveDamage(baseDamage)),
        fight.activeCreature?.heal(this.computeEffectiveHeal(baseHeal))));
    });
  }
}

/**
 * A skill that damages the target creatures and the origin creature.
 */
export class DamageAndDamage extends Skill {

  execute(fight: Fight, logs: Log[]): void {
    super.execute(fight, logs);

    const baseDamage1 = this.power1 * (fight.activeCreature?.power ?? 0);
    const baseDamage2 = this.power2 * (fight.activeCreature?.power ?? 0);

    fight.targetCreatures.forEach(creature => {
      logs.push(new Log(LogType.DamageAndDamage, fight.activeCreature, creature,
        creature.damage(this.computeEffectiveDamage(baseDamage1)),
        fight.activeCreature?.damage(this.computeEffectiveDamage(baseDamage2))));
    });
  }
}

/**
 * A healing skill.
 */
export class Heal extends Skill {

  execute(fight: Fight, logs: Log[]): void {
    super.execute(fight, logs);

    const baseHeal = this.power1 * (fight.activeCreature?.power ?? 0);

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
export const advance = new Advance('', SkillTarget.NONE, 0, 0, 0, '');
export const wait = new Wait('', SkillTarget.NONE, 0, 0, 0, '');
export const leave = new Leave('', SkillTarget.NONE, 0, 0, 0, '');
export const strikeSmall = new Damage('', SkillTarget.ENEMY_SINGLE, 0, 0, 0, '', 0.7);

// Common characters skills
export const techDefend = new Defend('Defend', SkillTarget.NONE, -30, 0, 0,
  'Defend against attacks. Gain 30 TP.');
export const magicDefend = new Defend('Defend', SkillTarget.NONE, -5, 0, 0,
  'Defend against attacks. Gain 5 MP.');
export const strike = new Damage('Strike', SkillTarget.ENEMY_SINGLE, 10, 1, 0,
  'Basic attack, does 100% weapon damage.');
export const heal: Skill = new Heal('Heal', SkillTarget.CHARACTER_ALIVE, 5, 0, 0,
  'Heal a party member for 100% weapon damage.');
export const revive: Skill = new Revive('Revive', SkillTarget.CHARACTER_DEAD, 20, 0, 0,
  'Revive a party member with half his life.');

// Warrior skills
export const smash = new Damage('Smash', SkillTarget.ENEMY_SINGLE, 20, 1, 0,
  'Strong attack, does 150% weapon damage.', 1.5);
export const furyStrike = new DamageAndDamage('Fury Strike', SkillTarget.ENEMY_SINGLE, 20, 1, 0,
  'Does 200% weapon damage to a target but loose 20% weapon damage as life.', 2.0, 0.2);
export const slash = new Damage('Slash', SkillTarget.ENEMY_DOUBLE, 20, 1, 0,
  'Area attack, does 80% weapon damage to two targets.', 0.8);

// Monk skills
export const recoveryStrike: Skill = new DamageAndHeal('Recovery Strike', SkillTarget.ENEMY_SINGLE, 10, 1, 0,
  'Does 70% weapon damage to the target and heal for 40% weapon damage.', 0.7, 0.4);
export const monkHeal: Skill = new Heal('Heal', SkillTarget.CHARACTER_ALIVE, 10, 0, 0,
  'Heal a party member for 100% weapon damage.');
export const monkRevive: Skill = new Revive('Revive', SkillTarget.CHARACTER_DEAD, 40, 0, 0,
  'Revive a party member with half his life.');

// Paladin skills
export const holyStrike = new Damage('Holy Strike', SkillTarget.ENEMY_SINGLE, 5, 1, 0,
  'Holy attack, does 100% weapon damage.');

// Hunter skills
export const shot = new Damage('Shot', SkillTarget.ENEMY_SINGLE, 10, 2, 0,
  'Basic ranged attack, does 100% weapon damage.');
export const preciseShot = new Damage('Precise Shot', SkillTarget.ENEMY_SINGLE, 20, 2, 0,
  'String ranged attack, does 150% weapon damage.', 1.5);

// Mage skills
export const shock = new Damage('Shock', SkillTarget.ENEMY_SINGLE, 5, 2, 0,
  'Magic attack, does 100% weapon damage.');
export const blast = new Damage('Blast', SkillTarget.ENEMY_SINGLE, 10, 2, 0,
  'Strong magic attack, does 150% weapon damage.', 1.5);
export const fireball = new Damage('Fireball', SkillTarget.ENEMY_TRIPLE, 12, 2, 0,
  'Area magic attack, does 60% weapon damage to three targets.', 0.6);

// Priest skills
export const spark = new Damage('Spark', SkillTarget.ENEMY_SINGLE, 5, 2, 0,
  'Magical attack, does 100% weapon damage.');
