// Skill related classes

import {Fight} from './game.model';
import {Character, Creature, Enemy, Status, StatusName} from './creature.model';
import {Log, LogType} from './log.model';

/**
 * The type of a skill, to use the right icon.
 * When any numeric value is changed, update skill-icon.component.html.
 */
export enum SkillType {
  DEFENSE,
  ATTACK,
  HEAL,
  IMPROVEMENT,
  DETERIORATION,
}

/**
 * The type of target of a skill
 */
export enum SkillTarget {
  NONE,
  CHARACTER_ALIVE,
  CHARACTER_ALL_ALIVE,
  // An alive character different than the current character
  CHARACTER_OTHER,
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
    public type: SkillType,
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
   * Return true if the player is able to use this skill on the target creature.
   */
  isUsableOn(creature: Character | Enemy, fight: Fight): boolean {
    switch (this.target) {
      case SkillTarget.CHARACTER_ALIVE:
        return (creature instanceof Character) && creature.isAlive();
      case SkillTarget.CHARACTER_OTHER:
        return (creature instanceof Character) && creature != fight.activeCreature;
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
   * Some skills have an area of effect. This method returns the effective target characters for the skill based
   * on the currently aimed (i.e. hovered or selected) character.
   */
  getTargetCharacters(character: Character, fight: Fight): Character[] {
    const targets = [];

    switch (this.target) {
      case SkillTarget.CHARACTER_ALIVE:
        targets.push(character);

        break;
      case SkillTarget.CHARACTER_OTHER:
        targets.push(character);
        if (fight.activeCreature instanceof Character) {
          targets.push(fight.activeCreature);
        }

        break;
    }

    return targets;
  }

  /**
   * Compute the effective amount for a damaging attack using the attacker power, the creatures statuses, the skill power,
   * and using a small random modification. Also return the computed amount.
   */
  computeEffectiveDamage(attacker: Creature, defender: Creature, skillPower: number): number {
    // Use the attacker power and skill power
    const baseAmount = attacker.power * skillPower;

    // Use the defend buff
    const correctedAmount = defender.hasBuff(StatusName.DEFEND) ? baseAmount * 0.75 : baseAmount;

    // Use a small random modification
    return this.randomize(correctedAmount);
  }

  /**
   * Compute the effective amount for a heal using the attacker power, the creatures statuses, the skill power,
   * and using a small random modification. Also return the computed amount.
   */
  computeEffectiveHeal(attacker: Creature, defender: Creature, skillPower: number): number {
    // Use the attacker power and skill power
    const baseAmount = attacker.power * skillPower;

    // Use a small random modification
    return this.randomize(baseAmount);
  }

  randomize(amount: number): number {
    return (0.85 + Math.random() * 0.3) * amount;
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

    if (fight.activeCreature != null) {
      fight.activeCreature.addStatus(new Status(StatusName.DEFEND, true, 1));

      logs.push(new Log(LogType.Defend, fight.activeCreature));
    }
  }
}

/**
 * A damaging skill.
 */
export class Damage extends Skill {

  execute(fight: Fight, logs: Log[]): void {
    if (fight.activeCreature == null) {
      return;
    }

    const activeCreature: Creature = fight.activeCreature;

    super.execute(fight, logs);

    fight.targetCreatures.forEach(targetCreature => {
      logs.push(new Log(LogType.Damage, activeCreature, targetCreature,
        targetCreature.damage(this.computeEffectiveDamage(activeCreature, targetCreature, this.power1))));
    });
  }
}

/**
 * A skill that damages the target creatures and heals the origin creature.
 */
export class DamageAndHeal extends Skill {

  execute(fight: Fight, logs: Log[]): void {
    if (fight.activeCreature == null) {
      return;
    }

    const activeCreature: Creature = fight.activeCreature;

    super.execute(fight, logs);

    fight.targetCreatures.forEach(targetCreature => {
      logs.push(new Log(LogType.DamageAndHeal, activeCreature, targetCreature,
        targetCreature.damage(this.computeEffectiveDamage(activeCreature, targetCreature, this.power1)),
        activeCreature.heal(this.computeEffectiveHeal(activeCreature, activeCreature, this.power2))));
    });
  }
}

/**
 * A skill that damages the target creatures and the origin creature.
 */
export class DamageAndDamage extends Skill {

  execute(fight: Fight, logs: Log[]): void {
    if (fight.activeCreature == null) {
      return;
    }

    const activeCreature: Creature = fight.activeCreature;

    super.execute(fight, logs);

    fight.targetCreatures.forEach(targetCreature => {
      logs.push(new Log(LogType.DamageAndDamage, activeCreature, targetCreature,
        targetCreature.damage(this.computeEffectiveDamage(activeCreature, targetCreature, this.power1)),
        activeCreature.damage(this.computeEffectiveDamage(activeCreature, activeCreature, this.power2))));
    });
  }
}

/**
 * A healing skill.
 */
export class Heal extends Skill {

  execute(fight: Fight, logs: Log[]): void {
    if (fight.activeCreature == null) {
      return;
    }

    const activeCreature: Creature = fight.activeCreature;

    super.execute(fight, logs);

    fight.targetCreatures.forEach(targetCreature => {
      logs.push(new Log(LogType.Heal, activeCreature, targetCreature,
        targetCreature.heal(this.computeEffectiveHeal(activeCreature, targetCreature, this.power1))));
    });
  }
}

/**
 * A healing skill that heals two targets.
 */
export class DualHeal extends Skill {

  execute(fight: Fight, logs: Log[]): void {
    if (fight.activeCreature == null) {
      return;
    }

    super.execute(fight, logs);

    const targetCreature1: Creature = fight.targetCreatures[0];
    logs.push(new Log(LogType.Heal, fight.activeCreature, targetCreature1, targetCreature1.heal(this.computeEffectiveHeal(
      fight.activeCreature, targetCreature1, this.power1))));
    const targetCreature2: Creature = fight.targetCreatures[1];
    logs.push(new Log(LogType.Heal, fight.activeCreature, targetCreature2, targetCreature2.heal(this.computeEffectiveHeal(
      fight.activeCreature, targetCreature2, this.power2))));
  }
}

/**
 * A revive skill.
 */
export class Revive extends Skill {

  execute(fight: Fight, logs: Log[]): void {
    super.execute(fight, logs);

    fight.targetCreatures.forEach(targetCreature => {
      targetCreature.heal(targetCreature.lifeMax / 2);
      logs.push(new Log(LogType.Revive, fight.activeCreature, targetCreature));
    });
  }
}

// Enemies skills
export const advance = new Advance(SkillType.DEFENSE, '', SkillTarget.NONE, 0, 0, 0, '');
export const wait = new Wait(SkillType.DEFENSE, '', SkillTarget.NONE, 0, 0, 0, '');
export const leave = new Leave(SkillType.DEFENSE, '', SkillTarget.NONE, 0, 0, 0, '');
export const strikeSmall = new Damage(SkillType.ATTACK, '', SkillTarget.ENEMY_SINGLE, 0, 0, 0, '', 0.7);

// Common characters skills
export const techDefend = new Defend(SkillType.DEFENSE, 'Defend', SkillTarget.NONE, -30, 0, 0,
  'Defend against attacks. Gain 30 TP.');
export const magicDefend = new Defend(SkillType.DEFENSE, 'Defend', SkillTarget.NONE, -5, 0, 0,
  'Defend against attacks. Gain 5 MP.');
export const strike = new Damage(SkillType.ATTACK, 'Strike', SkillTarget.ENEMY_SINGLE, 10, 1, 0,
  'Basic attack, does 100% weapon damage.');
export const heal: Skill = new Heal(SkillType.HEAL, 'Heal', SkillTarget.CHARACTER_ALIVE, 5, 0, 0,
  'Heal a character for 100% weapon damage.');
export const healAll: Skill = new Heal(SkillType.HEAL, 'Heal All', SkillTarget.CHARACTER_ALL_ALIVE, 20, 0, 0,
  'Heal all characters for 50% weapon damage.', 0.5);
export const revive: Skill = new Revive(SkillType.HEAL, 'Revive', SkillTarget.CHARACTER_DEAD, 20, 0, 0,
  'Revive a character with half his life.');

// Warrior skills
export const smash = new Damage(SkillType.ATTACK, 'Smash', SkillTarget.ENEMY_SINGLE, 20, 1, 0,
  'Strong attack, does 150% weapon damage.', 1.5);
export const furyStrike = new DamageAndDamage(SkillType.ATTACK, 'Fury Strike', SkillTarget.ENEMY_SINGLE, 20, 1, 0,
  'Does 200% weapon damage to a target but loose 20% weapon damage as life.', 2.0, 0.2);
export const slash = new Damage(SkillType.ATTACK, 'Slash', SkillTarget.ENEMY_DOUBLE, 20, 1, 0,
  'Area attack, does 80% weapon damage to two targets.', 0.8);

// Monk skills
export const recoveryStrike: Skill = new DamageAndHeal(SkillType.ATTACK, 'Recovery Strike', SkillTarget.ENEMY_SINGLE, 10, 1, 0,
  'Does 70% weapon damage to the target and heal for 40% weapon damage.', 0.7, 0.4);
export const monkHeal: Skill = new Heal(SkillType.HEAL, 'Heal', SkillTarget.CHARACTER_ALIVE, 10, 0, 0,
  'Heal a character for 100% weapon damage.');
export const monkRevive: Skill = new Revive(SkillType.HEAL, 'Revive', SkillTarget.CHARACTER_DEAD, 40, 0, 0,
  'Revive a character with half his life.');

// Paladin skills
export const holyStrike = new Damage(SkillType.ATTACK, 'Holy Strike', SkillTarget.ENEMY_SINGLE, 5, 1, 0,
  'Holy attack, does 100% weapon damage.');
export const dualHeal: Skill = new DualHeal(SkillType.HEAL, 'Dual Heal', SkillTarget.CHARACTER_OTHER, 10, 0, 0,
  'Heal a character for 100% weapon damage and the caster for 80% weapon damage.', 1, 0.8);

// Hunter skills
export const shot = new Damage(SkillType.ATTACK, 'Shot', SkillTarget.ENEMY_SINGLE, 10, 2, 0,
  'Basic ranged attack, does 100% weapon damage.');
export const preciseShot = new Damage(SkillType.ATTACK, 'Precise Shot', SkillTarget.ENEMY_SINGLE, 20, 2, 0,
  'String ranged attack, does 150% weapon damage.', 1.5);

// Mage skills
export const shock = new Damage(SkillType.ATTACK, 'Shock', SkillTarget.ENEMY_SINGLE, 5, 2, 0,
  'Magic attack, does 100% weapon damage.');
export const blast = new Damage(SkillType.ATTACK, 'Blast', SkillTarget.ENEMY_SINGLE, 10, 2, 0,
  'Strong magic attack, does 150% weapon damage.', 1.5);
export const fireball = new Damage(SkillType.ATTACK, 'Fireball', SkillTarget.ENEMY_TRIPLE, 12, 2, 0,
  'Area magic attack, does 60% weapon damage to three targets.', 0.6);

// Priest skills
export const spark = new Damage(SkillType.ATTACK, 'Spark', SkillTarget.ENEMY_SINGLE, 5, 2, 0,
  'Magical attack, does 100% weapon damage.');
