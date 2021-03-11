// Skill related classes

import {Fight} from './game.model';
import {
  Character,
  Creature,
  Enemy,
  LifeChange,
  LifeChangeEfficiency,
  LifeGain,
  LifeLoss,
  Status,
  StatusExpiration,
  StatusName
} from './creature.model';
import {logs, LogType} from './log.model';
import {DEFEND_BONUS, RANDOMIZE_BASE, RANDOMIZE_RANGE} from './constants.model';

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
  // An alive character
  CHARACTER_ALIVE,
  // All alive characters
  CHARACTER_ALL_ALIVE,
  // An alive character different than the current character
  CHARACTER_OTHER,
  // A dead character
  CHARACTER_DEAD,
  // A single enemy
  ENEMY_SINGLE,
  // Two adjacent enemies, the hovered one + its right one
  ENEMY_DOUBLE,
  // Three adjacent enemies, the hovered one + its left and right ones
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
      case SkillTarget.CHARACTER_DEAD:
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

  execute(fight: Fight): void {
    fight.activeCreature?.spendEnergy(this.cost);
  }
}

/**
 * Compute the effective amount for a damaging attack from a creature to a creature using their characteristics
 * and a small random modification. The result is rounded.
 */
export function computeEffectiveDamage(emitter: Creature, receiver: Creature, skillPower: number, canBeDodged: boolean = true): LifeChange {
  // Check if dodge, critical or normal hit
  const random = Math.random();
  const isDodge = canBeDodged && random < receiver.dodgeChance;
  if (isDodge) {
    return new LifeLoss(0, LifeChangeEfficiency.DODGE);
  }

  // Use the attacker power and skill power
  const baseAmount = emitter.power * skillPower;

  // Apply the critical bonus
  const isCritical = random >= receiver.dodgeChance && random < receiver.dodgeChance + emitter.criticalChance;
  const afterCritical = isCritical ? baseAmount * emitter.criticalBonus : baseAmount;

  // Apply the defend bonus
  const afterDefend = receiver.hasBuff(StatusName.DEFEND) ? afterCritical * DEFEND_BONUS : afterCritical;

  return new LifeLoss(randomizeAndRound(afterDefend), isCritical ? LifeChangeEfficiency.CRITICAL : LifeChangeEfficiency.NORMAL);
}

/**
 * Compute the effective amount for a heal from a creature to a creature using their characteristics
 * and a small random modification. The result is rounded.
 * Similar to computeEffectiveDamage but without dodge or some statuses such as defend.
 */
export function computeEffectiveHeal(emitter: Creature, receiver: Creature, skillPower: number): LifeChange {
  // Use the attacker power and skill power
  const baseAmount = emitter.power * skillPower;

  // Apply the critical bonus
  const random = Math.random();
  const isCritical = random < emitter.criticalChance;
  const afterCritical = isCritical ? baseAmount * emitter.criticalBonus : baseAmount;

  return new LifeGain(randomizeAndRound(afterCritical), isCritical ? LifeChangeEfficiency.CRITICAL : LifeChangeEfficiency.NORMAL);
}

/**
 * Modify a number by adding or removing a small random value, then round the result
 */
function randomizeAndRound(amount: number): number {
  return Math.round((RANDOMIZE_BASE + Math.random() * RANDOMIZE_RANGE) * amount);
}

/**
 * Move on row forward. Only used by enemies.
 */
export class Advance extends Skill {

  execute(fight: Fight): void {
    super.execute(fight);

    logs.add(LogType.Advance, fight.activeCreature);
  }
}

/**
 * No action.
 */
export class Wait extends Skill {

  execute(fight: Fight): void {
    super.execute(fight);

    logs.add(LogType.Wait, fight.activeCreature);
  }
}

/**
 * Leave the fight.
 */
export class Leave extends Skill {

  execute(fight: Fight): void {
    super.execute(fight);

    // Remove the creature from the fight
    if (fight.activeCreature != null) {
      fight.activeCreature.life = 0;
      fight.opposition.removeDeadEnemies();
      fight.opposition.removeEmptyRows();
    }

    logs.add(LogType.Leave, fight.activeCreature);
  }
}

/**
 * A defend skill.
 */
export class Defend extends Skill {

  execute(fight: Fight): void {
    super.execute(fight);

    if (fight.activeCreature != null) {
      fight.activeCreature.addStatus(new Status(StatusName.DEFEND, StatusExpiration.CREATURE_TURN, true, 1, 0, null));

      logs.add(LogType.Defend, fight.activeCreature);
    }
  }
}

/**
 * A damaging skill.
 */
export class Damage extends Skill {

  execute(fight: Fight): void {
    if (fight.activeCreature == null) {
      return;
    }

    const activeCreature: Creature = fight.activeCreature;

    super.execute(fight);

    fight.targetCreatures.forEach(targetCreature => {
      logs.add(LogType.Damage, activeCreature, targetCreature,
        targetCreature.changeLife(computeEffectiveDamage(activeCreature, targetCreature, this.power1)));
    });
  }
}

/**
 * A skill that damages the target creatures and heals the origin creature.
 */
export class DamageAndHeal extends Skill {

  execute(fight: Fight): void {
    if (fight.activeCreature == null) {
      return;
    }

    const activeCreature: Creature = fight.activeCreature;

    super.execute(fight);

    fight.targetCreatures.forEach(targetCreature => {
      logs.add(LogType.DamageAndHeal, activeCreature, targetCreature,
        targetCreature.changeLife(computeEffectiveDamage(activeCreature, targetCreature, this.power1)),
        activeCreature.changeLife(computeEffectiveHeal(activeCreature, activeCreature, this.power2)));
    });
  }
}

/**
 * A skill that damages the target creatures and the origin creature.
 */
export class DamageAndDamage extends Skill {

  execute(fight: Fight): void {
    if (fight.activeCreature == null) {
      return;
    }

    const activeCreature: Creature = fight.activeCreature;

    super.execute(fight);

    fight.targetCreatures.forEach(targetCreature => {
      logs.add(LogType.DamageAndDamage, activeCreature, targetCreature,
        targetCreature.changeLife(computeEffectiveDamage(activeCreature, targetCreature, this.power1)),
        activeCreature.changeLife(computeEffectiveDamage(activeCreature, activeCreature, this.power2, false)));
    });
  }
}

/**
 * A damaging skill that also gives a bleed DOT.
 */
export class DamageAndBleed extends Damage {

  execute(fight: Fight): void {
    super.execute(fight);

    fight.targetCreatures.forEach(targetCreature => {
      targetCreature.addStatus(new Status(StatusName.BLEED, StatusExpiration.END_OF_ROUND, false, 3, this.power2, fight.activeCreature));
    });
  }
}

/**
 * A damaging skill that also gives a poison DOT.
 */
export class DamageAndPoison extends Damage {

  execute(fight: Fight): void {
    super.execute(fight);

    fight.targetCreatures.forEach(targetCreature => {
      targetCreature.addStatus(new Status(StatusName.POISON, StatusExpiration.END_OF_ROUND, false, 3, this.power2, fight.activeCreature));
    });
  }
}

/**
 * A healing skill.
 */
export class Heal extends Skill {

  execute(fight: Fight): void {
    if (fight.activeCreature == null) {
      return;
    }

    const activeCreature: Creature = fight.activeCreature;

    super.execute(fight);

    fight.targetCreatures.forEach(targetCreature => {
      logs.add(LogType.Heal, activeCreature, targetCreature,
        targetCreature.changeLife(computeEffectiveHeal(activeCreature, targetCreature, this.power1)));
    });
  }
}

/**
 * A healing skill that heals two targets.
 */
export class DualHeal extends Skill {

  execute(fight: Fight): void {
    if (fight.activeCreature == null) {
      return;
    }

    super.execute(fight);

    const targetCreature1: Creature = fight.targetCreatures[0];
    logs.add(LogType.Heal, fight.activeCreature, targetCreature1,
      targetCreature1.changeLife(computeEffectiveHeal(fight.activeCreature, targetCreature1, this.power1)));
    const targetCreature2: Creature = fight.targetCreatures[1];
    logs.add(LogType.Heal, fight.activeCreature, targetCreature2,
      targetCreature2.changeLife(computeEffectiveHeal(fight.activeCreature, targetCreature2, this.power2)));
  }
}

/**
 * A heal over time skill.
 */
export class Regenerate extends Heal {

  execute(fight: Fight): void {
    super.execute(fight);

    fight.targetCreatures.forEach(targetCreature => {
      targetCreature.addStatus(new Status(StatusName.REGEN, StatusExpiration.END_OF_ROUND, true, 3, this.power2, fight.activeCreature));
    });
  }
}

/**
 * A revive skill.
 */
export class Revive extends Skill {

  execute(fight: Fight): void {
    super.execute(fight);

    fight.targetCreatures.forEach(targetCreature => {
      targetCreature.changeLife(new LifeGain(targetCreature.lifeMax / 2));
      logs.add(LogType.Revive, fight.activeCreature, targetCreature);
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
  'Reduce received damage by 20%. Gain 30 TP.');
export const magicDefend = new Defend(SkillType.DEFENSE, 'Defend', SkillTarget.NONE, -5, 0, 0,
  'Reduce received damage by 20%. Gain 5 MP.');
export const strike = new Damage(SkillType.ATTACK, 'Strike', SkillTarget.ENEMY_SINGLE, 10, 1, 0,
  'Inflict 100% damage.');
export const heal: Skill = new Heal(SkillType.HEAL, 'Heal', SkillTarget.CHARACTER_ALIVE, 5, 0, 0,
  'Heal a character for 100% damage.');
export const healAll: Skill = new Heal(SkillType.HEAL, 'Heal All', SkillTarget.CHARACTER_ALL_ALIVE, 20, 0, 0,
  'Heal all characters for 50% damage.', 0.5);
export const regenerate: Skill = new Regenerate(SkillType.HEAL, 'Regenerate', SkillTarget.CHARACTER_ALIVE, 5, 0, 0,
  'Heal a character for 50% damage and 120% damage over 3 rounds.', 0.5, 0.4);
export const revive: Skill = new Revive(SkillType.HEAL, 'Revive', SkillTarget.CHARACTER_DEAD, 20, 0, 0,
  'Revive a character with 50% life.');

// Warrior skills
export const furyStrike = new DamageAndDamage(SkillType.ATTACK, 'Fury Strike', SkillTarget.ENEMY_SINGLE, 15, 1, 0,
  'Inflict 150% damage to the target and 30% damage to self.', 1.5, 0.3);
export const deepWound = new DamageAndBleed(SkillType.ATTACK, 'Deep Wound', SkillTarget.ENEMY_SINGLE, 20, 1, 0,
  'Inflict 50% damage to the target and 120% damage over 3 rounds.', 0.5, 0.4);
export const slash = new Damage(SkillType.ATTACK, 'Slash', SkillTarget.ENEMY_DOUBLE, 20, 1, 0,
  'Inflict 80% damage to two adjacent targets.', 0.8);

// Monk skills
export const recoveryStrike: Skill = new DamageAndHeal(SkillType.ATTACK, 'Recovery Strike', SkillTarget.ENEMY_SINGLE, 20, 1, 0,
  'Inflict 100% damage to the target and heal for 50% damage.', 1.0, 0.5);
export const monkHeal: Skill = new Heal(SkillType.HEAL, 'Heal', SkillTarget.CHARACTER_ALIVE, 10, 0, 0,
  'Heal a character for 100% damage.');
export const monkRevive: Skill = new Revive(SkillType.HEAL, 'Revive', SkillTarget.CHARACTER_DEAD, 40, 0, 0,
  'Revive a character with 50% life.');

// Paladin skills
export const holyStrike = new Damage(SkillType.ATTACK, 'Holy Strike', SkillTarget.ENEMY_SINGLE, 5, 1, 0,
  'Inflict 100% damage.');
export const dualHeal: Skill = new DualHeal(SkillType.HEAL, 'Dual Heal', SkillTarget.CHARACTER_OTHER, 10, 0, 0,
  'Heal a character for 100% damage and self for 80% damage.', 1, 0.8);

// Archer skills
export const shot = new Damage(SkillType.ATTACK, 'Shot', SkillTarget.ENEMY_SINGLE, 10, 2, 0,
  'Inflict 100% damage.');
export const preciseShot = new Damage(SkillType.ATTACK, 'Precise Shot', SkillTarget.ENEMY_SINGLE, 20, 2, 0,
  'Inflict 150% damage.', 1.5);
export const viperShot = new DamageAndPoison(SkillType.ATTACK, 'Viper Shot', SkillTarget.ENEMY_SINGLE, 20, 2, 0,
  'Inflict 50% damage to the target and 120% damage over 3 rounds.', 0.5, 0.4);

// Mage skills
export const lightning = new Damage(SkillType.ATTACK, 'Lightning', SkillTarget.ENEMY_SINGLE, 5, 2, 0,
  'Inflict 100% damage.');
export const fireball = new Damage(SkillType.ATTACK, 'Fireball', SkillTarget.ENEMY_TRIPLE, 12, 2, 0,
  'Inflict 60% damage to three adjacent targets.', 0.6);

// Priest skills
export const shock = new Damage(SkillType.ATTACK, 'Shock', SkillTarget.ENEMY_SINGLE, 5, 2, 0,
  'Inflict 100% damage.');
