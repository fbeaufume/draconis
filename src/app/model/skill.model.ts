// Skill related classes

import {Fight} from './game.model';
import {Creature} from './creature.model';
import {logs} from './log.model';
import {LifeChangeEfficiency, LifeChangeType, LogType, SkillIconType, SkillTarget} from "./common.model";
import {attack, bleed, combo1, combo2, defend, defense, poison, regen, StatusType} from "./status-type.model";
import {Character} from "./character.model";
import {settings} from "./settings.model";
import {LifeChange, LifeGain, LifeLoss} from "./life-change.model";
import {StatusApplication} from "./status-application.model";
import {Enemy} from "./enemy.model";
import {Constants} from "./constants.model";

/**
 * A character skill.
 */
export abstract class Skill {

  constructor(
    public type: SkillIconType,
    public name: string,
    public target: SkillTarget,
    // Skill cost, in energy points
    public cost: number,
    // Skill range in number of rows, 0 if not applicable
    public range: number,
    public coolDown: number,
    public description: string,
    // The power levels of the skill
    public powers: number[] = [1],
    // The status to apply (defaults to an arbitrary value is used to simplify null management)
    public status: StatusType = defend,
    // Is the effect an improvement
    public improvementStatus: boolean = true
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
  isUsableOn(creature: Creature, fight: Fight): boolean {
    switch (this.target) {
      case SkillTarget.CHARACTER_ALIVE:
        return creature.isCharacter() && creature.isAlive();
      case SkillTarget.CHARACTER_OTHER:
        return creature.isCharacter() && creature != fight.activeCreature;
      case SkillTarget.CHARACTER_DEAD:
        return creature.isCharacter() && creature.isDead();
      case SkillTarget.ENEMY_SINGLE:
      case SkillTarget.ENEMY_DOUBLE:
      case SkillTarget.ENEMY_TRIPLE:
        return creature.isEnemy() && creature.isAlive() && (this.range >= creature.distance);
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
  getTargetCharacters(character: Character, fight: Fight): Creature[] {
    const targets = [];

    switch (this.target) {
      case SkillTarget.CHARACTER_ALIVE:
      case SkillTarget.CHARACTER_DEAD:
        targets.push(character);

        break;
      case SkillTarget.CHARACTER_OTHER:
        targets.push(character);
        if (fight.activeCreature != null && fight.activeCreature.isCharacter()) {
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
  const afterDefend = receiver.hasStatus(defend) ? afterCritical * (1 - Constants.DEFEND_BONUS) : afterCritical;

  // Apply the attack bonus or malus
  let afterAttack = afterDefend;
  if (emitter.hasPositiveStatus(attack)) {
    afterAttack = afterAttack * (1 + Constants.ATTACK_BONUS);
  }
  if (emitter.hasNegativeStatus(attack)) {
    afterAttack = afterAttack * (1 - Constants.ATTACK_BONUS);
  }

  // Apply the defense bonus or malus
  let afterDefense = afterAttack;
  if (receiver.hasPositiveStatus(defense)) {
    afterDefense = afterDefense * (1 - Constants.DEFENSE_BONUS);
  }
  if (receiver.hasNegativeStatus(defense)) {
    afterDefense = afterDefense * (1 + Constants.DEFENSE_BONUS);
  }

  return new LifeLoss(randomizeAndRound(afterDefense), isCritical ? LifeChangeEfficiency.CRITICAL : LifeChangeEfficiency.NORMAL);
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
  const randomizedDamage = settings.useRandom ? (Constants.RANDOMIZE_BASE + Math.random() * Constants.RANDOMIZE_RANGE) * amount : amount;
  return Math.round(randomizedDamage);
}

/**
 * Move on row forward. Only used by enemies.
 */
export class Advance extends Skill {

  constructor() {
    super(SkillIconType.DEFENSE, 'Advance', SkillTarget.NONE, 0, 0, 0, '');
  }

  execute(fight: Fight): void {
    super.execute(fight);

    logs.addCreatureLog(LogType.Advance, fight.activeCreature, null, null, null);
  }
}

/**
 * No action. Only used by enemies.
 */
export class Wait extends Skill {

  constructor() {
    super(SkillIconType.DEFENSE, 'Wait', SkillTarget.NONE, 0, 0, 0, '');
  }

  execute(fight: Fight): void {
    super.execute(fight);

    logs.addCreatureLog(LogType.Wait, fight.activeCreature, null, null, null);
  }
}

/**
 * Leave the fight. Only used by enemies.
 */
export class Leave extends Skill {

  constructor() {
    super(SkillIconType.DEFENSE, 'Leave', SkillTarget.NONE, 0, 0, 0, '');
  }

  execute(fight: Fight): void {
    super.execute(fight);

    // Remove the creature from the fight
    if (fight.activeCreature != null) {
      fight.activeCreature.life = 0;
      fight.opposition.removeDeadEnemies();
      fight.opposition.removeEmptyRows();
    }

    logs.addCreatureLog(LogType.Leave, fight.activeCreature, null, null, null);
  }
}

/**
 * A base defend skill.
 */
export class Defend extends Skill {

  execute(fight: Fight): void {
    super.execute(fight);

    if (fight.activeCreature != null) {
      fight.activeCreature.applyStatus(new StatusApplication(defend, true, 0, fight.activeCreature));

      logs.addCreatureLog(LogType.Defend, fight.activeCreature, null, null, null);
    }
  }
}

/**
 * A defend skill for tech users.
 */
export class DefendTech extends Defend {

  constructor() {
    super(SkillIconType.DEFENSE, 'Defend', SkillTarget.NONE, -1000, 0, 0,
      'Reduce received damage by 20%. Regain all TP.');
  }
}

/**
 * A defend skill for mana users.
 */
export class DefendMagic extends Defend {

  constructor() {
    super(SkillIconType.DEFENSE, 'Defend', SkillTarget.NONE, 0, 0, 0,
      'Reduce received damage by 20%.');
  }
}

/**
 * Apply a positive or negative status.
 */
export class ApplyStatus extends Skill {

  execute(fight: Fight): void {
    if (fight.activeCreature == null) {
      return;
    }

    super.execute(fight);

    fight.targetCreatures.forEach(targetCreature => {
      const status = new StatusApplication(this.status, this.improvementStatus, 0, fight.activeCreature);
      targetCreature.applyStatus(status);

      logs.addCreatureLog(this.improvementStatus ? LogType.PositiveStatus : LogType.NegativeStatus, fight.activeCreature, targetCreature, null, null, status);
    });
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
      logs.addCreatureLog(LogType.Damage, activeCreature, targetCreature,
        targetCreature.changeLife(computeEffectiveDamage(activeCreature, targetCreature, this.powers[0])), null);
    });
  }
}

/**
 * A single target regular damaging skill.
 */
export class Strike extends Damage {

  constructor(name: string) {
    super(SkillIconType.ATTACK, name, SkillTarget.ENEMY_SINGLE, 10, 1, 0, 'Inflict 100% damage.');
  }
}

/**
 * A single target small damaging skill.
 */
export class StrikeSmall extends Damage {

  constructor(name: string) {
    super(SkillIconType.ATTACK, name, SkillTarget.ENEMY_SINGLE, 10, 1, 0, '', [0.7]);
  }
}

/**
 * A damaging skill that increases damages when used on the same target during consecutive turns.
 */
export class ComboDamage extends Skill {

  execute(fight: Fight): void {
    if (fight.activeCreature == null || fight.targetCreatures.length != 1) {
      return;
    }

    const activeCreature: Creature = fight.activeCreature;
    const targetCreature = fight.targetCreatures[0];

    super.execute(fight);

    // Get the current step and power of the combo
    let comboStep = 1;
    let power: number = this.powers[0];
    if (targetCreature.hasStatus(combo1)) {
      comboStep = 2;
      power = this.powers[1];
    } else if (targetCreature.hasStatus(combo2)) {
      comboStep = 3;
      power = this.powers[2];
    }

    const lifeChange = targetCreature.changeLife(computeEffectiveDamage(activeCreature, targetCreature, power))
    logs.addCreatureLog(LogType.Damage, activeCreature, targetCreature, lifeChange, null);

    // Add the buff if the attack succeeded
    if (comboStep <= 2 && lifeChange.isSuccess()) {
      targetCreature.applyStatus(new StatusApplication(comboStep == 1 ? combo1 : combo2,
        false, 0, activeCreature));
    }
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
      const lifeChange: LifeChange = computeEffectiveDamage(activeCreature, targetCreature, this.powers[0]);

      if (lifeChange.isSuccess()) {
        logs.addCreatureLog(LogType.DamageAndHeal, activeCreature, targetCreature,
          targetCreature.changeLife(lifeChange),
          activeCreature.changeLife(new LifeChange(Math.round(lifeChange.amount * this.powers[1]), lifeChange.efficiency, LifeChangeType.GAIN)));
      } else {
        logs.addCreatureLog(LogType.Damage, activeCreature, targetCreature, targetCreature.changeLife(lifeChange), null);
      }
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
      const lifeChange: LifeChange = computeEffectiveDamage(activeCreature, targetCreature, this.powers[0]);

      if (lifeChange.isSuccess()) {
        logs.addCreatureLog(LogType.DamageAndDamage, activeCreature, targetCreature,
          targetCreature.changeLife(computeEffectiveDamage(activeCreature, targetCreature, this.powers[0])),
          activeCreature.changeLife(new LifeChange(Math.round(lifeChange.amount * this.powers[1]), lifeChange.efficiency, LifeChangeType.LOSS)));
      } else {
        logs.addCreatureLog(LogType.Damage, activeCreature, targetCreature, targetCreature.changeLife(lifeChange), null);
      }
    });
  }
}

/**
 * A damaging skill that also adds a bleed damage over time.
 * This and DamageAndPoison should be a single class, but it's painful to do so in TypeScript.
 */
export class DamageAndBleed extends Skill {

  execute(fight: Fight): void {
    if (fight.activeCreature == null) {
      return;
    }

    const activeCreature: Creature = fight.activeCreature;

    super.execute(fight);

    fight.targetCreatures.forEach(targetCreature => {
      const lifeChange: LifeChange = computeEffectiveDamage(activeCreature, targetCreature, this.powers[0]);

      // Direct damage part
      logs.addCreatureLog(LogType.Damage, activeCreature, targetCreature, targetCreature.changeLife(lifeChange), null);

      // Damage over time part
      if (lifeChange.isSuccess()) {
        targetCreature.applyStatus(new StatusApplication(bleed, false, this.powers[1], fight.activeCreature));
      }
    });
  }
}

/**
 * A damaging skill that also adds a poison damage over time.
 * This and DamageAndBleed should be a single class, but it's painful to do so in TypeScript.
 */
export class DamageAndPoison extends Skill {

  execute(fight: Fight): void {
    if (fight.activeCreature == null) {
      return;
    }

    const activeCreature: Creature = fight.activeCreature;

    super.execute(fight);

    fight.targetCreatures.forEach(targetCreature => {
      const lifeChange: LifeChange = computeEffectiveDamage(activeCreature, targetCreature, this.powers[0]);

      // Direct damage part
      logs.addCreatureLog(LogType.Damage, activeCreature, targetCreature, targetCreature.changeLife(lifeChange), null);

      // Damage over time part
      if (lifeChange.isSuccess()) {
        targetCreature.applyStatus(new StatusApplication(poison, false, this.powers[1], fight.activeCreature));
      }
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
      logs.addCreatureLog(LogType.Heal, activeCreature, targetCreature,
        targetCreature.changeLife(computeEffectiveHeal(activeCreature, targetCreature, this.powers[0])), null);
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
    logs.addCreatureLog(LogType.Heal, fight.activeCreature, targetCreature1,
      targetCreature1.changeLife(computeEffectiveHeal(fight.activeCreature, targetCreature1, this.powers[0])), null);
    const targetCreature2: Creature = fight.targetCreatures[1];
    logs.addCreatureLog(LogType.Heal, fight.activeCreature, targetCreature2,
      targetCreature2.changeLife(computeEffectiveHeal(fight.activeCreature, targetCreature2, this.powers[1])), null);
  }
}

/**
 * A heal over time skill.
 */
export class Regenerate extends Heal {

  execute(fight: Fight): void {
    super.execute(fight);

    fight.targetCreatures.forEach(targetCreature => {
      targetCreature.applyStatus(new StatusApplication(regen, true, this.powers[1], fight.activeCreature));
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
      logs.addCreatureLog(LogType.Revive, fight.activeCreature, targetCreature, null, null);
    });
  }
}
