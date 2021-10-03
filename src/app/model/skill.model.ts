// Skill related classes

import {Creature} from './creature.model';
import {logs} from './log.model';
import {LifeChangeEfficiency, LifeChangeType, LogType, SkillIconType, SkillTargetType} from "./common.model";
import {
  attackBonus,
  attackMalus,
  combo1,
  combo2,
  defend,
  defenseBonus,
  defenseMalus,
  regen,
  StatusType
} from "./status-type.model";
import {Character} from "./character.model";
import {settings} from "./settings.model";
import {LifeChange, LifeGain, LifeLoss} from "./life-change.model";
import {StatusApplication} from "./status-application.model";
import {Enemy} from "./enemy.model";
import {Constants} from "./constants.model";
import {Fight} from "./fight.model";

/**
 * A character skill.
 */
export abstract class Skill {

  /**
   * The skill icon type. Only used in the UI and for character skills.
   */
  iconTypes: SkillIconType[];

  /**
   * The skill name.
   */
  name: string;

  /**
   * The type of target.
   */
  targetType: SkillTargetType;

  /**
   * The energy cost of the skill when used.
   */
  cost: number;

  /**
   * The range of the skill:
   * - 0 means it can target only creatures of the same faction
   * - 1+ is the number of rows of the other faction it can reach
   */
  range: number;

  /**
   * The cooldown of the skill, i.e. the number of turns to wait before being able to use it again.
   * Defaults to one, meaning that the skill can be used each turn.
   * For example two means that if the skill was used in the first turn, the creature will have to wait for
   * turn 3 before using it again.
   * Note that this is relevant only for characters, since the skill choice for enemies is defined by their strategies.
   */
  cooldownMax: number;

  /**
   * The current cooldown of the skill.
   * This is decreased before a creature turn.
   * When it reaches 0 the skill can be used.
   * Starts at zero.
   * Note that this is relevant only for characters, since the skill choice for enemies is defined by their strategies.
   */
  cooldown: number;

  /**
   * The skill description. Only used in the UI and for character skills.
   */
  description: string;

  /**
   * The power levels of a skill. A regular power level is 1. User a higher number for a stronger skill,
   * or a lower number for a weaker skill. Multiple number are used since a skill may have multiple effects,
   * for example the initial damage power then the damage over time power.
   */
  powerLevels: number[];

  /**
   * The status to apply, if applicable. Defaults to an arbitrary value to simplify null management.
   */
  statuses: StatusType[];

  /**
   * The duration of the applied statuses.
   */
  statusDuration: number;

  constructor(
    iconTypes: SkillIconType[],
    name: string,
    targetType: SkillTargetType,
    cost: number,
    range: number,
    coolDownMax: number,
    description: string,
    powerLevels: number[] = [1],
    statuses: StatusType[] = [],
    statusDuration: number = Constants.DEFAULT_STATUS_DURATION
  ) {
    this.iconTypes = iconTypes;
    this.name = name;
    this.targetType = targetType;
    this.cost = cost;
    this.range = range;
    this.cooldownMax = coolDownMax;
    this.cooldown = 0;
    this.description = description;
    this.powerLevels = powerLevels;
    this.statuses = statuses;
    this.statusDuration = statusDuration;
  }

  /**
   * Return true if the player can select this skill for a given character.
   */
  isSelectableBy(creature: Creature | null): boolean {
    if (creature == null) {
      return false;
    }

    // Check the skill cost
    if (this.cost > creature.energy) {
      return false;
    }

    // Check the cooldown
    // noinspection RedundantIfStatementJS
    if (this.cooldown > 0) {
      return false;
    }

    return true;
  }

  /**
   * Return true if the player is able to use this skill on the target creature.
   */
  isUsableOn(creature: Creature, fight: Fight): boolean {
    switch (this.targetType) {
      case SkillTargetType.SAME_ALIVE:
        return creature.isCharacter() && creature.isAlive();
      case SkillTargetType.SAME_ALIVE_OTHER:
        return creature.isCharacter() && creature != fight.activeCreature;
      case SkillTargetType.SAME_DEAD:
        return creature.isCharacter() && creature.isDead();
      case SkillTargetType.OTHER_ALIVE:
      case SkillTargetType.OTHER_ALIVE_DOUBLE:
      case SkillTargetType.OTHER_ALIVE_TRIPLE:
        return creature.isEnemy() && creature.isAlive() && (this.range >= creature.distance);
      case SkillTargetType.ALIVE:
        return creature.isAlive() && (creature.isCharacter() || this.range >= creature.distance);
      default:
        console.log('Error, target type ' + this.targetType + ' is not supported')
        return false;
    }
  }

  /**
   * Some skills have an area of effect. This method returns the effective target enemies for the skill based
   * on the currently aimed (i.e. hovered or selected) enemy.
   */
  getTargetEnemies(enemy: Enemy, fight: Fight): Enemy[] {
    const targets = [];

    switch (this.targetType) {
      case SkillTargetType.OTHER_ALIVE:
      case SkillTargetType.ALIVE:
        targets.push(enemy);

        break;
      case SkillTargetType.OTHER_ALIVE_DOUBLE:
        targets.push(enemy);

        // Add the enemy at the right, if any
        const enemy1 = fight.opposition.getRightEnemy(enemy);
        if (enemy1 != null) {
          targets.push(enemy1);
        }

        break;
      case SkillTargetType.OTHER_ALIVE_TRIPLE:
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
      default:
        console.log('Error, target type ' + this.targetType + ' is not supported');
    }

    return targets;
  }

  /**
   * Some skills have an area of effect. This method returns the effective target characters for the skill based
   * on the currently aimed (i.e. hovered or selected) character.
   */
  getTargetCharacters(character: Character, fight: Fight): Creature[] {
    const targets = [];

    switch (this.targetType) {
      case SkillTargetType.SAME_ALIVE:
      case SkillTargetType.SAME_DEAD:
      case SkillTargetType.ALIVE:
      case SkillTargetType.SAME_ALIVE_OTHER:
        targets.push(character);
        break;
      default:
        console.log('Error, target type ' + this.targetType + ' is not supported');
    }

    return targets;
  }

  /**
   * Reduce the cooldown of this skills by one.
   */
  reduceCooldown() {
    this.cooldown--;
    if (this.cooldown < 0) {
      this.cooldown = 0;
    }
  }

  /**
   * Main execution method of a skill. Should not be overridden by skills.
   * Instead they should override:
   * - Either execute(Creature, Fight) if they operate on no target (e.g. Advance, Wait, Defend, etc)
   * - Or execute(Creature, Creature, Fight) if they operate on one or more targets
   */
  execute(fight: Fight) {
    if (fight.activeCreature == null) {
      return;
    }
    const activeCreature: Creature = fight.activeCreature;

    // Apply the energy cost to the creature
    activeCreature.spendEnergy(this.cost);

    // Update the cooldown
    this.cooldown = this.cooldownMax;

    this.executeOnActiveCreature(activeCreature, fight);
  }

  /**
   * To be overridden by skills that operate on no target.
   */
  executeOnActiveCreature(activeCreature: Creature, fight: Fight) {
    // Execute the skill on all targeted creatures
    fight.targetCreatures.forEach(targetCreature => this.executeOnTargetCreature(activeCreature, targetCreature, fight));
  }

  /**
   * To be overridden by skills that operate on one or more targets.
   */
  executeOnTargetCreature(activeCreature: Creature, targetCreature: Creature, fight: Fight) {
    // Does nothing by default
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
  if (emitter.hasPositiveStatus(attackBonus)) {
    afterAttack = afterAttack * (1 + Constants.ATTACK_BONUS);
  }
  if (emitter.hasNegativeStatus(attackMalus)) {
    afterAttack = afterAttack * (1 - Constants.ATTACK_BONUS);
  }

  // Apply the defense bonus or malus
  let afterDefense = afterAttack;
  if (receiver.hasPositiveStatus(defenseBonus)) {
    afterDefense = afterDefense * (1 - Constants.DEFENSE_BONUS);
  }
  if (receiver.hasNegativeStatus(defenseMalus)) {
    afterDefense = afterDefense * (1 + Constants.DEFENSE_BONUS);
  }

  // Apply the specialty
  const afterSpecialtyAttack = emitter.hasSpecialtyOfCreature(receiver) ? afterDefense * (1 + Constants.SPECIALTY_ATTACK_BONUS) : afterDefense;
  const afterSpecialtyDefense = receiver.hasSpecialtyOfCreature(emitter) ? afterSpecialtyAttack * (1 - Constants.SPECIALTY_DEFENSE_BONUS) : afterSpecialtyAttack;

  return new LifeLoss(randomizeAndRound(afterSpecialtyDefense), isCritical ? LifeChangeEfficiency.CRITICAL : LifeChangeEfficiency.NORMAL);
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
    super([SkillIconType.DEFENSE], 'Advance', SkillTargetType.NONE, 0, 0, 1, '');
  }

  executeOnActiveCreature(activeCreature: Creature, fight: Fight) {
    logs.addCreatureLog(LogType.Advance, activeCreature, null, null, null);
  }
}

/**
 * No action. Only used by enemies.
 */
export class Wait extends Skill {

  constructor() {
    super([SkillIconType.DEFENSE], 'Wait', SkillTargetType.NONE, 0, 0, 1, '');
  }

  executeOnActiveCreature(activeCreature: Creature, fight: Fight) {
    logs.addCreatureLog(LogType.Wait, activeCreature, null, null, null);
  }
}

/**
 * Leave the fight. Only used by enemies.
 */
export class Leave extends Skill {

  constructor() {
    super([SkillIconType.DEFENSE], 'Leave', SkillTargetType.NONE, 0, 0, 1, '');
  }

  executeOnActiveCreature(activeCreature: Creature, fight: Fight) {
    // Remove the creature from the fight
    activeCreature.life = 0;
    fight.opposition.removeDeadEnemies();
    fight.opposition.removeEmptyRows();

    logs.addCreatureLog(LogType.Leave, activeCreature, null, null, null);
  }
}

/**
 * A base defend skill.
 */
export class Defend extends Skill {

  executeOnActiveCreature(activeCreature: Creature, fight: Fight) {
    activeCreature.applyStatus(new StatusApplication(defend, 0, activeCreature, this.statusDuration));

    logs.addCreatureLog(LogType.Defend, activeCreature, null, null, null);
  }
}

/**
 * A defend skill for tech users.
 */
export class DefendTech extends Defend {

  constructor() {
    super([SkillIconType.DEFENSE], 'Defend', SkillTargetType.NONE, -1000, 0, 1,
      'Reduce received damage by 20% during one turn. Regain all TP.', [1], [], Constants.DEFEND_DURATION);
  }
}

/**
 * A defend skill for mana users.
 */
export class DefendMagic extends Defend {

  constructor() {
    super([SkillIconType.DEFENSE], 'Defend', SkillTargetType.NONE, 0, 0, 1,
      'Reduce received damage by 20% during one turn.', [1], [], Constants.DEFEND_DURATION);
  }
}

/**
 * Apply one or more statuses.
 */
export class ApplyStatus extends Skill {

  executeOnTargetCreature(activeCreature: Creature, targetCreature: Creature, fight: Fight) {
    this.statuses.forEach(status => {
      const statusApplication = new StatusApplication(status, 0, activeCreature, this.statusDuration);
      targetCreature.applyStatus(statusApplication);

      logs.addCreatureLog(status.improvement ? LogType.PositiveStatus : LogType.NegativeStatus, activeCreature, targetCreature, null, null, statusApplication);
    })
  }
}

/**
 * A damaging skill.
 */
export class Damage extends Skill {

  executeOnTargetCreature(activeCreature: Creature, targetCreature: Creature, fight: Fight) {
    logs.addCreatureLog(LogType.Damage, activeCreature, targetCreature,
      targetCreature.changeLife(computeEffectiveDamage(activeCreature, targetCreature, this.powerLevels[0])), null);
  }
}

/**
 * A single target regular damaging skill.
 */
export class Strike extends Damage {

  constructor(name: string) {
    super([SkillIconType.ATTACK], name, SkillTargetType.OTHER_ALIVE, 10, 1, 1, 'Inflict 100% damage.');
  }
}

/**
 * A single target small damaging skill.
 */
export class StrikeSmall extends Damage {

  constructor(name: string, targetType: SkillTargetType = SkillTargetType.OTHER_ALIVE) {
    super([SkillIconType.ATTACK], name, targetType, 10, 1, 1, '', [0.7]);
  }
}

/**
 * A long range single target regular damaging skill.
 */
export class Shot extends Damage {

  constructor(name: string) {
    super([SkillIconType.ATTACK], name, SkillTargetType.OTHER_ALIVE, 10, 2, 1, 'Inflict 100% damage.');
  }
}

/**
 * A damaging skill that does different damage to full life target creatures.
 */
export class FullLifeDamage extends Skill {

  executeOnTargetCreature(activeCreature: Creature, targetCreature: Creature, fight: Fight) {
    const isFullLife: boolean = targetCreature.isFullLife();
    logs.addCreatureLog(LogType.Damage, activeCreature, targetCreature,
      targetCreature.changeLife(computeEffectiveDamage(activeCreature, targetCreature, isFullLife ? this.powerLevels[1] : this.powerLevels[0])), null);
  }
}

/**
 * A damaging skill that increases damages when used on the same target during consecutive turns.
 */
export class ComboDamage extends Skill {

  executeOnTargetCreature(activeCreature: Creature, targetCreature: Creature, fight: Fight) {
    // Get the current step and power of the combo
    let comboStep = 1;
    let power: number = this.powerLevels[0];
    if (targetCreature.hasStatus(combo1)) {
      comboStep = 2;
      power = this.powerLevels[1];
    } else if (targetCreature.hasStatus(combo2)) {
      comboStep = 3;
      power = this.powerLevels[2];
    }

    const lifeChange = targetCreature.changeLife(computeEffectiveDamage(activeCreature, targetCreature, power))
    logs.addCreatureLog(LogType.Damage, activeCreature, targetCreature, lifeChange, null);

    // Add the buff if the attack succeeded
    if (comboStep <= 2 && lifeChange.isSuccess()) {
      targetCreature.applyStatus(new StatusApplication(comboStep == 1 ? combo1 : combo2, 0, activeCreature, this.statusDuration));
    }
  }
}

/**
 * A skill that damages the target creatures and heals the origin creature.
 */
export class DamageAndHeal extends Skill {

  executeOnTargetCreature(activeCreature: Creature, targetCreature: Creature, fight: Fight) {
    const lifeChange: LifeChange = computeEffectiveDamage(activeCreature, targetCreature, this.powerLevels[0]);

    if (lifeChange.isSuccess()) {
      logs.addCreatureLog(LogType.DamageAndHeal, activeCreature, targetCreature,
        targetCreature.changeLife(lifeChange),
        activeCreature.changeLife(new LifeChange(Math.round(lifeChange.amount * this.powerLevels[1]), lifeChange.efficiency, LifeChangeType.GAIN)));
    } else {
      logs.addCreatureLog(LogType.Damage, activeCreature, targetCreature, targetCreature.changeLife(lifeChange), null);
    }
  }
}

/**
 * A skill that damages the target creatures and the origin creature.
 */
export class DamageAndDamage extends Skill {

  executeOnTargetCreature(activeCreature: Creature, targetCreature: Creature, fight: Fight) {
    const lifeChange: LifeChange = computeEffectiveDamage(activeCreature, targetCreature, this.powerLevels[0]);

    if (lifeChange.isSuccess()) {
      logs.addCreatureLog(LogType.DamageAndDamage, activeCreature, targetCreature,
        targetCreature.changeLife(computeEffectiveDamage(activeCreature, targetCreature, this.powerLevels[0])),
        activeCreature.changeLife(new LifeChange(Math.round(lifeChange.amount * this.powerLevels[1]), lifeChange.efficiency, LifeChangeType.LOSS)));
    } else {
      logs.addCreatureLog(LogType.Damage, activeCreature, targetCreature, targetCreature.changeLife(lifeChange), null);
    }
  }
}

/**
 * A damaging skill that also adds a damage over time.
 */
export class DamageAndDot extends Skill {

  executeOnTargetCreature(activeCreature: Creature, targetCreature: Creature, fight: Fight) {
    const lifeChange: LifeChange = computeEffectiveDamage(activeCreature, targetCreature, this.powerLevels[0]);

    // Direct damage part
    logs.addCreatureLog(LogType.Damage, activeCreature, targetCreature, targetCreature.changeLife(lifeChange), null);

    // Damage over time part
    if (lifeChange.isSuccess()) {
      targetCreature.applyStatus(new StatusApplication(this.statuses[0], this.powerLevels[1], activeCreature, this.statusDuration));
    }
  }
}

/**
 * A damaging skill that also applies one or more statuses.
 */
export class DamageAndStatus extends Skill {

  executeOnTargetCreature(activeCreature: Creature, targetCreature: Creature, fight: Fight) {
    const lifeChange: LifeChange = computeEffectiveDamage(activeCreature, targetCreature, this.powerLevels[0]);

    // Damage part
    logs.addCreatureLog(LogType.Damage, activeCreature, targetCreature, targetCreature.changeLife(lifeChange), null);

    // Statuses part
    if (lifeChange.isSuccess()) {
      this.statuses.forEach(status => targetCreature.applyStatus(new StatusApplication(status, 0, activeCreature, this.statusDuration)))
    }
  }
}

/**
 * A healing skill.
 */
export class Heal extends Skill {

  executeOnTargetCreature(activeCreature: Creature, targetCreature: Creature, fight: Fight) {
    logs.addCreatureLog(LogType.Heal, activeCreature, targetCreature,
      targetCreature.changeLife(computeEffectiveHeal(activeCreature, targetCreature, this.powerLevels[0])), null);
  }
}

/**
 * A healing skill that heals two targets.
 */
export class DualHeal extends Skill {

  executeOnTargetCreature(activeCreature: Creature, targetCreature: Creature, fight: Fight) {
    logs.addCreatureLog(LogType.Heal, activeCreature, targetCreature,
      targetCreature.changeLife(computeEffectiveHeal(activeCreature, targetCreature, this.powerLevels[0])), null);

    logs.addCreatureLog(LogType.Heal, activeCreature, activeCreature,
      activeCreature.changeLife(computeEffectiveHeal(activeCreature, activeCreature, this.powerLevels[1])), null);
  }
}

/**
 * A heal over time skill.
 */
export class Regenerate extends Heal {

  executeOnTargetCreature(activeCreature: Creature, targetCreature: Creature, fight: Fight) {
    targetCreature.applyStatus(new StatusApplication(regen, this.powerLevels[1], activeCreature, this.statusDuration));
  }
}

/**
 * A revive skill.
 */
export class Revive extends Skill {

  executeOnTargetCreature(activeCreature: Creature, targetCreature: Creature, fight: Fight) {
    targetCreature.changeLife(new LifeGain(targetCreature.lifeMax / 2));
    logs.addCreatureLog(LogType.Revive, activeCreature, targetCreature, null, null);
  }
}

/**
 * The alter time skill reduces and increases statuses duration of the target.
 */
export class AlterTime extends Skill {

  executeOnTargetCreature(activeCreature: Creature, targetCreature: Creature, fight: Fight) {
    const increment: number = activeCreature?.isSameFactionThan(targetCreature) ? 1 : -1;
    targetCreature.statusApplications.forEach(statusApplication => statusApplication.remainingDuration += statusApplication.isImprovement() ? increment : -increment)
    logs.addCreatureLog(LogType.Revive, activeCreature, targetCreature, null, null);
  }
}
