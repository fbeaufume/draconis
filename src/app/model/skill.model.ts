// Skill related classes

import {Creature} from './creature.model';
import {logs} from './log.model';
import {
  BasicLogType,
  LifeChangeEfficiency,
  LogType,
  SkillIconType,
  SkillModifierType,
  SkillTargetType
} from './common.model';
import {
  ApplyDotStatusEffect,
  ApplyStatusStatusEffect,
  attackBonus,
  attackMalus,
  combo1,
  combo2,
  defend,
  defenseBonus,
  defenseMalus,
  ReflectDamageStatusEffect,
  regeneration,
  StatusType
} from './status-type.model';
import {Character} from './character.model';
import {settings} from './settings.model';
import {LifeChange, LifeGain, LifeLoss} from './life-change.model';
import {StatusApplication} from './status-application.model';
import {Enemy} from './enemy.model';
import {Constants} from './constants.model';
import {Fight} from './fight.model';
import {EnemyStrategy} from './enemy-strategy.model';

/**
 * A character skill.
 */
export abstract class Skill extends EnemyStrategy {

  /**
   * The skill icon type. Only used in the UI and for character skills.
   */
  abstract get iconTypes(): SkillIconType[];

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
   * True if this is a melee skill.
   * This is used to check if this skill triggers or not an attack effect. For example using a melee attack on a fire
   * enchanted creature can burn the attacker.
   * Checking if this is a melee skill using the range is incorrect since some skills (such as the hunter barrage)
   * have a range of 1 but are not melee attacks.
   */
  melee: boolean;

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

  /**
   * Skill modifiers such as "cannot be dodged", etc.
   */
  modifiers: SkillModifierType[];

  constructor(
    name: string,
    targetType: SkillTargetType,
    cost: number,
    melee: boolean,
    range: number,
    coolDownMax: number,
    description: string,
    powerLevels: number[] = [1],
    statuses: StatusType[] = [],
    statusDuration: number = Constants.DEFAULT_STATUS_DURATION,
    modifiers: SkillModifierType[] = []
  ) {
    super();
    this.name = name;
    this.targetType = targetType;
    this.cost = cost;
    this.melee = melee;
    this.range = range;
    this.cooldownMax = coolDownMax;
    this.cooldown = 0;
    this.description = description;
    this.powerLevels = powerLevels;
    this.statuses = statuses;
    this.statusDuration = statusDuration;
    this.modifiers = modifiers;
  }

  chooseSkill(fight: Fight): Skill | null {
    if (this.isUsableByActiveCreature(fight)) {
      return this;
    } else {
      return null;
    }
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
        console.log('Error in isUsableOn, target type ' + this.targetType + ' is not supported')
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
          targets.unshift(enemy2);
        }

        targets.push(enemy);

        // Add the enemy at the right, if any
        const enemy3 = fight.opposition.getRightEnemy(enemy);
        if (enemy3 != null) {
          targets.push(enemy3);
        }

        break;
      default:
        console.log('Error in getTargetEnemies, target type ' + this.targetType + ' is not supported');
    }

    return targets;
  }

  // noinspection JSUnusedLocalSymbols
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
        console.log('Error in getTargetCharacters, target type ' + this.targetType + ' is not supported');
    }

    return targets;
  }

  /**
   * Return true if this skill can be used by an enemy. For example:
   * - A melee skill can only be used by front line enemies
   * - A heal can only be used if at least one allied creature is not full life
   */
  isUsableByActiveCreature(fight: Fight): boolean {
    if (fight.activeCreature == null) {
      return false;
    }

    return this.isUsableByCreature(fight.activeCreature, fight);
  }

  protected isUsableByCreature(creature: Creature, fight: Fight): boolean {
    // Check the range
    return !(this.range == 1 && !creature.isInFrontRow());
  }

  /**
   * Return true if this skill has a particular skill modifier.
   */
  hasModifier(modifier: SkillModifierType): boolean {
    return this.modifiers.includes(modifier);
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
   * Reset the cooldown of this skill to it maximum value.
   */
  resetCooldown() {
    this.cooldown = this.cooldownMax;
  }

  /**
   * Main execution method of a skill. Should not be overridden by skills, instead they should override:
   * - Either execute(Creature, Fight) if they operate on no target (e.g. Advance, Wait, Defend, etc)
   * - Or execute(Creature, Creature, Fight) if they operate on one or more targets
   */
  execute(fight: Fight) {
    if (fight.activeCreature == null) {
      return;
    }
    const activeCreature: Creature = fight.activeCreature;

    // Do not apply the energy cost of the skill to the creature here but later, otherwise the focused skill panel
    // may display the skill cost in red, confusing the player

    // Do not update the cooldown of the skill here but later, otherwise the focused skill panel may display the skill
    // cooldown in red, confusing the player

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
export function computeEffectiveDamage(skill: Skill | null, emitter: Creature, receiver: Creature, skillPower: number, isDamageOrHealOverTime: boolean): LifeChange {
  const random = Math.random();

  // Check if dodge, critical or normal hit
  let dodgeable: boolean = !isDamageOrHealOverTime;
  if (dodgeable && skill != null) {
    dodgeable = !skill.hasModifier(SkillModifierType.CANNOT_BE_DODGED);
  }
  if (dodgeable && (random < receiver.dodgeChance)) {
    return new LifeLoss(0, LifeChangeEfficiency.DODGE);
  }

  // Use the attacker power and skill power
  const baseAmount = emitter.power * skillPower;

  // Apply the critical bonus
  const isCritical = random >= receiver.dodgeChance && random < receiver.dodgeChance + emitter.criticalChance;
  const efficiency: LifeChangeEfficiency = isCritical ? LifeChangeEfficiency.CRITICAL : LifeChangeEfficiency.NORMAL;
  const afterCritical = isCritical ? baseAmount * emitter.criticalBonus : baseAmount;

  // Apply the defend bonus
  // noinspection UnnecessaryLocalVariableJS
  const afterDefend = receiver.hasStatusType(defend) ? afterCritical * (1 - Constants.DEFEND_BONUS) : afterCritical;

  // Apply the attack bonus or malus
  let afterAttack = afterDefend;
  if (emitter.hasPositiveStatusType(attackBonus)) {
    afterAttack = afterAttack * (1 + Constants.ATTACK_BONUS);
  }
  if (emitter.hasNegativeStatusType(attackMalus)) {
    afterAttack = afterAttack * (1 - Constants.ATTACK_BONUS);
  }

  // Apply the defense bonus or malus
  let afterDefense = afterAttack;
  if (receiver.hasPositiveStatusType(defenseBonus)) {
    afterDefense = afterDefense * (1 - Constants.DEFENSE_BONUS);
  }
  if (receiver.hasNegativeStatusType(defenseMalus)) {
    afterDefense = afterDefense * (1 + Constants.DEFENSE_BONUS);
  }

  // Apply the specialty
  const afterSpecialtyAttack = emitter.hasSpecialtyOfCreature(receiver) ? afterDefense * (1 + Constants.SPECIALTY_ATTACK_BONUS) : afterDefense;
  const afterSpecialtyDefense = receiver.hasSpecialtyOfCreature(emitter) ? afterSpecialtyAttack * (1 - Constants.SPECIALTY_DEFENSE_BONUS) : afterSpecialtyAttack;

  // Apply status effects if needed, for example a creature protected by a fire trap
  // will apply a fire damage-over-time back to the attacker when melee attacked
  if (skill != null) {
    receiver.getAllStatusApplications().forEach(sa => {
      sa.statusType.statusEffects.forEach(statusEffect => {
        // Check the status effect range
        if (statusEffect.melee && !skill.melee) {
          // The status effect requires a melee skill, but the skill os not a melee one
          return;
        }

        if (statusEffect instanceof ApplyDotStatusEffect) {
          emitter.applyStatus(new StatusApplication(statusEffect.dotType, statusEffect.power, sa.originCreature, statusEffect.duration));
        }

        if (statusEffect instanceof ApplyStatusStatusEffect) {
          emitter.applyStatus(new StatusApplication(statusEffect.statusType, 0, sa.originCreature, statusEffect.duration))
        }

        if (statusEffect instanceof ReflectDamageStatusEffect) {
          emitter.addLifeChange(new LifeLoss(afterSpecialtyDefense * statusEffect.percentage, efficiency));
        }
      });
    });
  }

  return new LifeLoss(randomize(afterSpecialtyDefense), isCritical ? LifeChangeEfficiency.CRITICAL : LifeChangeEfficiency.NORMAL);
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

  return new LifeGain(randomize(afterCritical), isCritical ? LifeChangeEfficiency.CRITICAL : LifeChangeEfficiency.NORMAL);
}

/**
 * Modify a number by adding or removing a small random value, then round the result
 */
function randomize(amount: number): number {
  return settings.useRandom ? (Constants.RANDOMIZE_BASE + Math.random() * Constants.RANDOMIZE_RANGE) * amount : amount;
}

/**
 * Move on row forward. Only used by enemies.
 */
export class Advance extends Skill {

  constructor() {
    super('Advance', SkillTargetType.NONE, 0, false, 0, 1, '');
  }

  get iconTypes(): SkillIconType[] {
    return [SkillIconType.DEFENSE];
  }

  executeOnActiveCreature(activeCreature: Creature, fight: Fight) {
    const activeEnemy: Enemy = activeCreature as Enemy;

    const currentRow = fight.opposition.rows[1];
    const targetRow = fight.opposition.rows[0];

    // Leave the current row
    let position: number = -1; // Enemy position in the row, used to choose what side to move to
    for (let i = 0; i < currentRow.enemies.length; i++) {
      const enemy = currentRow.enemies[i];
      if (enemy === activeEnemy) {
        position = i;
        currentRow.enemies.splice(i--, 1);
      }
    }

    // Move to the left side or right side of the new row
    if (position < (currentRow.enemies.length + 1) / 2) {
      // Add to the left side
      targetRow.enemies.unshift(activeEnemy);
    } else {
      // Add to the right side
      targetRow.enemies.push(activeEnemy);
    }
    activeEnemy.distance--;

    logs.addParameterizedLog(LogType.ADVANCE, activeEnemy);
  }

  isUsableByCreature(creature: Creature, fight: Fight): boolean {
    // Creature must be in back row
    if (creature.isInFrontRow()) {
      return false;
    }

    // There must be some free space in the front row
    // noinspection RedundantIfStatementJS
    if (fight.opposition.rows[0].isFull()) {
      return false;
    }

    return true;
  }
}

/**
 * No action. Only used by enemies.
 */
export class Wait extends Skill {

  constructor() {
    super('Wait', SkillTargetType.NONE, 0, false, 0, 1, '');
  }

  get iconTypes(): SkillIconType[] {
    return [SkillIconType.DEFENSE];
  }

  executeOnActiveCreature(activeCreature: Creature, fight: Fight) {
    logs.addParameterizedLog(LogType.WAIT, activeCreature);
  }
}

/**
 * Log a message.
 */
export class LogMessage extends Skill {

  basicLogType: BasicLogType;

  constructor(basicLogType: BasicLogType) {
    super('Log Message', SkillTargetType.NONE, 0, false, 0, 1, '');
    this.basicLogType = basicLogType;
  }

  get iconTypes(): SkillIconType[] {
    return [SkillIconType.DEFENSE];
  }

  executeOnActiveCreature(activeCreature: Creature, fight: Fight) {
    logs.addBasicLog(this.basicLogType);
  }
}

/**
 * Leave the fight. Only used by enemies.
 */
export class Leave extends Skill {

  constructor() {
    super('Leave', SkillTargetType.NONE, 0, false, 0, 1, '');
  }

  get iconTypes(): SkillIconType[] {
    return [SkillIconType.DEFENSE];
  }

  executeOnActiveCreature(activeCreature: Creature, fight: Fight) {
    // Remove the creature from the fight
    activeCreature.life = 0;
    fight.opposition.removeDeadEnemies();
    fight.opposition.removeEmptyRows();

    logs.addParameterizedLog(LogType.LEAVE, activeCreature);
  }
}

/**
 * A base defend skill.
 */
export class Defend extends Skill {

  executeOnActiveCreature(activeCreature: Creature, fight: Fight) {
    activeCreature.applyStatus(new StatusApplication(defend, 0, activeCreature, this.statusDuration));

    logs.addSkillExecutionLog(activeCreature, this, null, null);
  }

  get iconTypes(): SkillIconType[] {
    return [SkillIconType.DEFENSE];
  }
}

/**
 * A defend skill for tech users.
 */
export class DefendTech extends Defend {

  constructor() {
    super('Defend', SkillTargetType.NONE, -1000, false, 0, 1,
      'Reduce received damage by 20% during one turn. Regain all TP.', [1], [], Constants.DEFEND_DURATION);
  }
}

/**
 * A defend skill for mana users.
 */
export class DefendMagic extends Defend {

  constructor() {
    super('Defend', SkillTargetType.NONE, 0, false, 0, 1,
      'Reduce received damage by 20% during one turn.', [1], [], Constants.DEFEND_DURATION);
  }
}

/**
 * Apply one or more statuses.
 */
abstract class ApplyStatus extends Skill {

  executeOnTargetCreature(activeCreature: Creature, targetCreature: Creature, fight: Fight) {
    this.statuses.forEach(status => {
      const statusApplication = new StatusApplication(status, this.powerLevels[0], activeCreature, this.statusDuration);
      targetCreature.applyStatus(statusApplication);

      logs.addSkillExecutionLog(activeCreature, this, targetCreature, null);
    })
  }
}

/**
 * Apply one or more improvements.
 */
export class ApplyImprovement extends ApplyStatus {

  get iconTypes(): SkillIconType[] {
    return [SkillIconType.IMPROVEMENT];
  }
}

/**
 * Apply one or more deteriorations.
 */
export class ApplyDeterioration extends ApplyStatus {

  get iconTypes(): SkillIconType[] {
    return [SkillIconType.DETERIORATION];
  }
}

/**
 * A damaging skill.
 */
export class Damage extends Skill {

  executeOnTargetCreature(activeCreature: Creature, targetCreature: Creature, fight: Fight) {
    logs.addSkillExecutionLog(activeCreature, this, targetCreature,
      targetCreature.addLifeChange(computeEffectiveDamage(this, activeCreature, targetCreature, this.powerLevels[0], false)));
  }

  get iconTypes(): SkillIconType[] {
    return [SkillIconType.ATTACK];
  }
}

/**
 * A single target regular damaging skill.
 */
export class Strike extends Damage {

  constructor(name: string) {
    super(name, SkillTargetType.OTHER_ALIVE, 10, true, 1, 1, 'Inflict 100% damage to the target.');
  }
}

/**
 * A single target small damaging skill.
 */
export class StrikeSmall extends Damage {

  constructor(name: string, targetType: SkillTargetType = SkillTargetType.OTHER_ALIVE) {
    super(name, targetType, 10, true, 1, 1, '', [0.7]);
  }
}

/**
 * A long range single target regular damaging skill.
 */
export class Shot extends Damage {

  constructor(name: string) {
    super(name, SkillTargetType.OTHER_ALIVE, 10, false, 2, 1, 'Inflict 100% damage to the target.');
  }
}

/**
 * A base damage class for skills that inflict variable damage based on active and/or target creature.
 *
 * If a sub skill does not override 'isUsableByCreature', then it could be used even if it does less damage than
 * the regular attack.
 */
abstract class VariableDamage extends Damage {

  abstract getEffectivePower(activeCreature: Creature, targetCreature: Creature): number;

  executeOnTargetCreature(activeCreature: Creature, targetCreature: Creature, fight: Fight) {
    // Temporarily change the skill power
    const initialPowerLevel: number = this.powerLevels[0];
    this.powerLevels[0] *= this.getEffectivePower(activeCreature, targetCreature);

    super.executeOnTargetCreature(activeCreature, targetCreature, fight);

    // Restore the skill power
    this.powerLevels[0] = initialPowerLevel;
  }

}

/**
 * A damaging skill that does increased damage when the active creature has low life: 70-150 % damage for 100-0 % life.
 */
export class Vengeance extends VariableDamage {

  getEffectivePower(activeCreature: Creature, targetCreature: Creature): number {
    return Constants.VENGEANCE_HIGH - (Constants.VENGEANCE_HIGH - Constants.VENGEANCE_LOW) * activeCreature.lifePercent / 100;
  }
}

/**
 * A damaging skill that does increased damage when the target creature has high life: 40-120 % damage for 0-100 % life.
 */
export class Judgement extends VariableDamage {

  getEffectivePower(activeCreature: Creature, targetCreature: Creature): number {
    return Constants.JUDGEMENT_LOW + (Constants.JUDGEMENT_HIGH - Constants.JUDGEMENT_LOW) * targetCreature.lifePercent / 100;
  }
}

/**
 * A damaging skill the does increased damage when the target has low life: 60-140 % damage for 100-0 % life.
 */
export class Execution extends VariableDamage {

  getEffectivePower(activeCreature: Creature, targetCreature: Creature): number {
    return Constants.EXECUTION_HIGH - (Constants.EXECUTION_HIGH - Constants.EXECUTION_LOW) * targetCreature.lifePercent / 100;
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
    if (targetCreature.hasStatusType(combo1)) {
      comboStep = 2;
      power = this.powerLevels[1];
    } else if (targetCreature.hasStatusType(combo2)) {
      comboStep = 3;
      power = this.powerLevels[2];
    }

    const lifeChange = targetCreature.addLifeChange(computeEffectiveDamage(this, activeCreature, targetCreature, power, false))
    logs.addSkillExecutionLog(activeCreature, this, targetCreature, lifeChange);

    // TODO FBE remove all other combo status applications (to prevent bugs with Alter Time for example)
    // Add the buff if the attack succeeded
    if (comboStep <= 2 && lifeChange.isSuccess()) {
      targetCreature.applyStatus(new StatusApplication(comboStep == 1 ? combo1 : combo2, 0, activeCreature, this.statusDuration));
    }
  }

  get iconTypes(): SkillIconType[] {
    return [SkillIconType.ATTACK];
  }
}

/**
 * A skill that damages the target creatures and heals the origin creature.
 */
export class Drain extends Skill {

  executeOnTargetCreature(activeCreature: Creature, targetCreature: Creature, fight: Fight) {
    const lifeChange: LifeChange = computeEffectiveDamage(this, activeCreature, targetCreature, this.powerLevels[0], false);

    logs.addSkillExecutionLog(activeCreature, this, targetCreature, targetCreature.addLifeChange(lifeChange));

    // Execute and log the second life change only if the attack succeeded
    if (lifeChange.isSuccess()) {
      logs.addSkillExecutionLog(activeCreature, this, activeCreature, activeCreature.addLifeChange(new LifeGain(lifeChange.amount * this.powerLevels[1], lifeChange.efficiency)));
    }
  }

  get iconTypes(): SkillIconType[] {
    return [SkillIconType.ATTACK, SkillIconType.HEAL];
  }
}

/**
 * A skill that damages the target creatures but also the origin creature.
 */
export class Berserk extends Skill {

  executeOnTargetCreature(activeCreature: Creature, targetCreature: Creature, fight: Fight) {
    const lifeChange: LifeChange = computeEffectiveDamage(this, activeCreature, targetCreature, this.powerLevels[0], false);

    logs.addSkillExecutionLog(activeCreature, this, targetCreature, targetCreature.addLifeChange(lifeChange));

    // Execute and log the second life change only if the attack succeeded
    if (lifeChange.isSuccess()) {
      logs.addSkillExecutionLog(activeCreature, this, activeCreature, activeCreature.addLifeChange(new LifeLoss(lifeChange.amount * this.powerLevels[1], lifeChange.efficiency)));
    }
  }

  get iconTypes(): SkillIconType[] {
    return [SkillIconType.ATTACK];
  }
}

/**
 * A damaging skill that also adds a damage over time.
 */
export class DamageAndDot extends Skill {

  executeOnTargetCreature(activeCreature: Creature, targetCreature: Creature, fight: Fight) {
    const lifeChange: LifeChange = computeEffectiveDamage(this, activeCreature, targetCreature, this.powerLevels[0], false);

    // Direct damage part
    logs.addSkillExecutionLog(activeCreature, this, targetCreature, targetCreature.addLifeChange(lifeChange));

    // Damage over time part
    if (lifeChange.isSuccess()) {
      targetCreature.applyStatus(new StatusApplication(this.statuses[0], this.powerLevels[1], activeCreature, this.statusDuration));
    }
  }

  get iconTypes(): SkillIconType[] {
    return [SkillIconType.ATTACK, SkillIconType.DETERIORATION];
  }
}

/**
 * A damaging skill that also applies one or more statuses.
 */
export class DamageAndStatus extends Skill {

  executeOnTargetCreature(activeCreature: Creature, targetCreature: Creature, fight: Fight) {
    const lifeChange: LifeChange = computeEffectiveDamage(this, activeCreature, targetCreature, this.powerLevels[0], false);

    // Damage part
    logs.addSkillExecutionLog(activeCreature, this, targetCreature, targetCreature.addLifeChange(lifeChange));

    // Statuses part
    if (lifeChange.isSuccess()) {
      this.statuses.forEach(status => targetCreature.applyStatus(new StatusApplication(status, 0, activeCreature, this.statusDuration)))
    }
  }

  get iconTypes(): SkillIconType[] {
    return [SkillIconType.ATTACK, SkillIconType.DETERIORATION];
  }

}

/**
 * A damaging skill that also applies one or more statuses to the active creature.
 */
export class DamageAndSelfStatus extends Damage {

  executeOnActiveCreature(activeCreature: Creature, fight: Fight) {
    super.executeOnActiveCreature(activeCreature, fight);

    this.statuses.forEach(status => activeCreature.applyStatus(new StatusApplication(status, 0, activeCreature, this.statusDuration)))
  }

  get iconTypes(): SkillIconType[] {
    return [SkillIconType.ATTACK, SkillIconType.IMPROVEMENT];
  }
}

/**
 * A healing skill.
 */
export class Heal extends Skill {

  executeOnTargetCreature(activeCreature: Creature, targetCreature: Creature, fight: Fight) {
    logs.addSkillExecutionLog(activeCreature, this, targetCreature,
      targetCreature.addLifeChange(computeEffectiveHeal(activeCreature, targetCreature, this.powerLevels[0])));
  }

  get iconTypes(): SkillIconType[] {
    return [SkillIconType.HEAL];
  }

  isUsableByCreature(creature: Creature, fight: Fight): boolean {
    // Ensure that at least one allied creature is wounded
    if (!fight.getAllEnemies().some(creature => creature.isDamaged())) {
      return false;
    }

    return super.isUsableByCreature(creature, fight);
  }
}

/**
 * A healing skill that heals two targets.
 */
export class DualHeal extends Skill {

  executeOnTargetCreature(activeCreature: Creature, targetCreature: Creature, fight: Fight) {
    logs.addSkillExecutionLog(activeCreature, this, targetCreature,
      targetCreature.addLifeChange(computeEffectiveHeal(activeCreature, targetCreature, this.powerLevels[0])));

    logs.addSkillExecutionLog(activeCreature, this, activeCreature,
      activeCreature.addLifeChange(computeEffectiveHeal(activeCreature, activeCreature, this.powerLevels[1])));
  }

  get iconTypes(): SkillIconType[] {
    return [SkillIconType.HEAL];
  }
}

/**
 * A heal over time skill.
 */
export class Regenerate extends Heal {

  executeOnTargetCreature(activeCreature: Creature, targetCreature: Creature, fight: Fight) {
    targetCreature.applyStatus(new StatusApplication(regeneration, this.powerLevels[1], activeCreature, this.statusDuration));
    logs.addSkillExecutionLog(activeCreature, this, targetCreature, null);
  }

  get iconTypes(): SkillIconType[] {
    return [SkillIconType.HEAL, SkillIconType.IMPROVEMENT];
  }
}

/**
 * A revive skill.
 */
export class Revive extends Skill {

  executeOnTargetCreature(activeCreature: Creature, targetCreature: Creature, fight: Fight) {
    targetCreature.addLifeChange(new LifeGain(targetCreature.lifeMax / 2));
    logs.addSkillExecutionLog(activeCreature, this, targetCreature, null);
  }

  get iconTypes(): SkillIconType[] {
    return [SkillIconType.HEAL];
  }
}

/**
 * The alter time skill reduces and increases statuses duration of the target.
 */
export class AlterTime extends Skill {

  executeOnTargetCreature(activeCreature: Creature, targetCreature: Creature, fight: Fight) {
    const increment: number = activeCreature?.isSameFactionThan(targetCreature) ? 1 : -1;
    targetCreature.activeStatusApplications.forEach(sa => sa.remainingDuration += sa.isImprovement() ? increment : -increment)
    logs.addSkillExecutionLog(activeCreature, this, targetCreature, null);
  }

  get iconTypes(): SkillIconType[] {
    return [SkillIconType.IMPROVEMENT, SkillIconType.DETERIORATION];
  }
}

/**
 * Similar to alter time, but is used by enemies only if some specific condition is met.
 */
export class MassAlterTime extends AlterTime {

  protected isUsableByCreature(creature: Creature, fight: Fight): boolean {
    // Can be used only if at least 2 opposing creature have at least 1 status each
    const count: number = fight.getAllAliveCharacters()
      .filter(creature => creature.activeStatusApplications.length >= 1)
      .map(() => 1)
      .reduce((currentSum, a) => currentSum + a, 0);
    console.log('Count', count);
    if (count < 2) {
      return false;
    }

    return super.isUsableByCreature(creature, fight);
  }
}
