import {Creature} from './creature.model';
import {messages} from './message.model';
import {
  BasicMessageType,
  DamageSource,
  ElementType,
  LifeChangeEfficiency,
  MessageType,
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
import {Strategy} from './strategy.model';

// TODO FBE use the resistance also for non damaging skill effects (e.g. Intimidate, Ice Blast proc, etc)

/**
 * A character skill.
 */
export abstract class Skill extends Strategy implements DamageSource {

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
   * Can be zero, for free to use skills.
   * Can be negative, for skills that actually generate some energy.
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
   * The element type of this skill. Can be used to reduce the inflicted damage done to resistant creatures.
   */
  elementType: ElementType;

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
    elementType: ElementType,
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

    this.description = formatDescription(description);
    this.elementType = elementType;
    this.powerLevels = powerLevels;
    this.statuses = statuses;
    this.statusDuration = statusDuration;
    this.modifiers = modifiers;
  }

  get costAbsoluteValue(): number {
    return Math.abs(this.cost);
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
        this.logger.error(`Invalid target type ${this.targetType} in isUsableOn`);
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
        this.logger.error(`Invalid target type ${this.targetType} in getTargetEnemies`);
    }

    return targets;
  }

  /**
   * Some skills have an area of effect. This method returns the effective target characters for the skill based
   * on the currently aimed (i.e. hovered or selected) character.
   */
  getTargetCharacters(character: Character, _fight: Fight): Creature[] {
    const targets = [];

    switch (this.targetType) {
      case SkillTargetType.SAME_ALIVE:
      case SkillTargetType.SAME_DEAD:
      case SkillTargetType.ALIVE:
      case SkillTargetType.SAME_ALIVE_OTHER:
        targets.push(character);
        break;
      default:
        this.logger.error(`Invalid target type ${this.targetType} in getTargetCharacters`);
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

  protected isUsableByCreature(creature: Creature, _fight: Fight): boolean {
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
  executeOnTargetCreature(_activeCreature: Creature, _targetCreature: Creature, _fight: Fight) {
    // Does nothing by default
  }
}

/**
 * Return a skill description with some HTML enhancements.
 * Currently, it only highlights expressions that start by '_' by wrapping them with '<b>' and '</b>'.
 */
export function formatDescription(description: string) {
  let input = description; // E.g 'one _two three'
  while (true) {
    const start = input.lastIndexOf('_'); // E.g. 4
    if (start < 0) break;
    const ends = [' ', '.', ',']
      .map(pattern => input.indexOf(pattern, start))
      .filter(position => position >= start); // E.g. [8]
    const end = ends.length <= 0 ? input.length : Math.min(...ends); // E.g. 8

    let next: string;
    if (end === start + 1) {
      // Discard empty blocs
      next = input.substring(0, start) + input.substring(end, input.length);
    }
    else {
      next = input.substring(0, start) + '<b>' + input.substring(start + 1, end) + '</b>' + input.substring(end, input.length);
    }

    input = next;
  }

  return input;
}

/**
 * Compute the effective amount for a damaging attack from a creature to a creature using their characteristics
 * and a small random modification. The result is rounded.
 */
export function computeEffectiveDamage(source: DamageSource, emitter: Creature, receiver: Creature, skillPower: number): LifeChange {
  const random = Math.random();

  // Check if dodge, critical or normal hit
  const canBeDodged: boolean = source instanceof Skill && !source.hasModifier(SkillModifierType.CANNOT_BE_DODGED);
  if (canBeDodged && (random < receiver.dodgeChance)) {
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

  // Apply elemental resistance
  const finalDamage = afterSpecialtyDefense * (1 - receiver.getElementalResistance(source.elementType));

  // Apply status effects if needed, for example a creature protected by a fire trap
  // will apply a fire damage-over-time back to the attacker when melee attacked
  if (source instanceof Skill) {
    receiver.getAllStatusApplications().forEach(sa => {
      sa.statusType.statusEffects.forEach(statusEffect => {
        // Check the status effect range
        if (statusEffect.melee && !source.melee) {
          // The status effect requires a melee skill, but the skill os not a melee one
          return;
        }

        if (statusEffect instanceof ApplyDotStatusEffect) {
          emitter.applyStatus(new StatusApplication(statusEffect.dotType, statusEffect.power, sa.originCreature, statusEffect.duration, statusEffect.elementType));
        }

        if (statusEffect instanceof ApplyStatusStatusEffect) {
          emitter.applyStatus(new StatusApplication(statusEffect.statusType, 0, sa.originCreature, statusEffect.duration, statusEffect.elementType))
        }

        if (statusEffect instanceof ReflectDamageStatusEffect) {
          emitter.addLifeChange(new LifeLoss(finalDamage * statusEffect.percentage, efficiency));
        }
      });
    });
  }

  return new LifeLoss(randomize(finalDamage), isCritical ? LifeChangeEfficiency.CRITICAL : LifeChangeEfficiency.NORMAL);
}

/**
 * Compute the effective amount for a heal from a creature to a creature using their characteristics
 * and a small random modification. The result is rounded.
 * Similar to computeEffectiveDamage but without dodge or some statuses such as defend.
 */
export function computeEffectiveHeal(emitter: Creature, _receiver: Creature, skillPower: number): LifeChange {
  // Use the attacker power and skill power
  const baseAmount = emitter.power * skillPower;

  // Apply the critical bonus
  const random = Math.random();
  const isCritical = random < emitter.criticalChance;
  const afterCritical = isCritical ? baseAmount * emitter.criticalBonus : baseAmount;

  // The elemental resistance is not used here

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
    super('Advance', SkillTargetType.NONE, 0, false, 0, 1, '', ElementType.NONE);
  }

  override executeOnActiveCreature(activeCreature: Creature, fight: Fight) {
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

    messages.addParameterizedMessage(MessageType.ADVANCE, activeEnemy);
  }

  override isUsableByCreature(creature: Creature, fight: Fight): boolean {
    // Creature must be in back row
    if (creature.isInFrontRow()) {
      return false;
    }

    // There must be some free space in the front row
    return fight.opposition.rows[0].canAccept(creature);
  }
}

/**
 * No action. Only used by enemies.
 */
export class Wait extends Skill {

  constructor() {
    super('Wait', SkillTargetType.NONE, 0, false, 0, 1, '', ElementType.NONE);
  }

  override executeOnActiveCreature(activeCreature: Creature, _fight: Fight) {
    messages.addParameterizedMessage(MessageType.WAIT, activeCreature);
  }
}

/**
 * Display a message.
 */
export class Message extends Skill {

  basicMessageType: BasicMessageType;

  constructor(basicMessageType: BasicMessageType) {
    super('Message', SkillTargetType.NONE, 0, false, 0, 1, '', ElementType.NONE);
    this.basicMessageType = basicMessageType;
  }

  override executeOnActiveCreature(_activeCreature: Creature, _fight: Fight) {
    messages.addBasicMessage(this.basicMessageType);
  }
}

/**
 * Leave the fight. Only used by enemies.
 */
export class Leave extends Skill {

  constructor() {
    super('Leave', SkillTargetType.NONE, 0, false, 0, 1, '', ElementType.NONE);
  }

  // TODO FBE bugged, this may cause some characters to use a strategy of an enemy
  override executeOnActiveCreature(activeCreature: Creature, fight: Fight) {
    // Remove the creature from the fight
    activeCreature.life = 0;
    fight.opposition.removeDeadEnemies();
    fight.opposition.removeEmptyRows();

    messages.addParameterizedMessage(MessageType.LEAVE, activeCreature);
  }
}

/**
 * A base defend skill.
 */
export class Defend extends Skill {

  override executeOnActiveCreature(activeCreature: Creature, _fight: Fight) {
    activeCreature.applyStatus(new StatusApplication(defend, 0, activeCreature, this.statusDuration, ElementType.NONE));

    messages.addSkillExecutionMessage(activeCreature, this, null, null);
  }
}

/**
 * A defend skill for tech users.
 */
export class DefendTech extends Defend {

  constructor() {
    super('Defend', SkillTargetType.NONE, -2, false, 0, 1,
      'Reduce received damage by _20% during _1 round. Regain all TP.', ElementType.NONE, [1], [], Constants.DEFEND_DURATION);
  }
}

/**
 * A defend skill for mana users.
 */
export class DefendMagic extends Defend {

  constructor() {
    super('Defend', SkillTargetType.NONE, 0, false, 0, 1,
      'Reduce received damage by _20% during _1 round.', ElementType.NONE, [1], [], Constants.DEFEND_DURATION);
  }
}

/**
 * Apply one or more statuses.
 */
abstract class ApplyStatus extends Skill {

  override executeOnTargetCreature(activeCreature: Creature, targetCreature: Creature, _fight: Fight) {
    this.statuses.forEach(status => {
      const statusApplication = new StatusApplication(status, this.powerLevels[0], activeCreature, this.statusDuration, ElementType.REMOVE_THIS);
      targetCreature.applyStatus(statusApplication);

      messages.addSkillExecutionMessage(activeCreature, this, targetCreature, null);
    })
  }
}

/**
 * Apply one or more improvements.
 */
export class ApplyImprovement extends ApplyStatus {
}

/**
 * Apply one or more deteriorations.
 */
export class ApplyDeterioration extends ApplyStatus {
}

/**
 * A damaging skill.
 */
export class Damage extends Skill {

  override executeOnTargetCreature(activeCreature: Creature, targetCreature: Creature, _fight: Fight) {
    messages.addSkillExecutionMessage(activeCreature, this, targetCreature,
      targetCreature.addLifeChange(computeEffectiveDamage(this, activeCreature, targetCreature, this.powerLevels[0])));
  }
}

/**
 * A single target melee damaging skill.
 */
export class Strike extends Damage {

  constructor(name: string, elementType: ElementType, description: string = 'Inflict 100% damage to the target.') {
    super(name, SkillTargetType.OTHER_ALIVE, -1, true, 1, 1, description, elementType);
  }
}

/**
 * A customizable melee damaging skill.
 */
export class CustomStrike extends Damage {

  constructor(name: string, elementType: ElementType, powerLevel: number, targetType: SkillTargetType) {
    super(name, targetType, 10, true, 1, 1, '', elementType, [powerLevel]);
  }
}

/**
 * A single target distance damaging skill.
 */
export class Shot extends Damage {

  constructor(name: string, elementType: ElementType, description: string = 'Inflict 100% damage to the target.') {
    super(name, SkillTargetType.OTHER_ALIVE, 10, false, 2, 1, description, elementType);
  }
}

/**
 * A customizable distance damaging skill.
 */
export class CustomShot extends Damage {

  constructor(name: string, elementType: ElementType, powerLevel: number, targetType: SkillTargetType) {
    super(name, targetType, 10, false, 2, 1, '', elementType, [powerLevel]);
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

  override executeOnTargetCreature(activeCreature: Creature, targetCreature: Creature, fight: Fight) {
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

  getEffectivePower(activeCreature: Creature, _targetCreature: Creature): number {
    return Constants.VENGEANCE_HIGH - (Constants.VENGEANCE_HIGH - Constants.VENGEANCE_LOW) * activeCreature.lifePercent / 100;
  }
}

/**
 * A damaging skill that does increased damage when the target creature has high life: 40-120 % damage for 0-100 % life.
 */
export class Judgement extends VariableDamage {

  getEffectivePower(_activeCreature: Creature, targetCreature: Creature): number {
    return Constants.JUDGEMENT_LOW + (Constants.JUDGEMENT_HIGH - Constants.JUDGEMENT_LOW) * targetCreature.lifePercent / 100;
  }
}

/**
 * A damaging skill the does increased damage when the target has low life: 60-140 % damage for 100-0 % life.
 */
export class Execution extends VariableDamage {

  getEffectivePower(_activeCreature: Creature, targetCreature: Creature): number {
    return Constants.EXECUTION_HIGH - (Constants.EXECUTION_HIGH - Constants.EXECUTION_LOW) * targetCreature.lifePercent / 100;
  }
}

/**
 * A damaging skill that increases damages when used on the same target during consecutive turns.
 */
export class ComboDamage extends Skill {

  override executeOnTargetCreature(activeCreature: Creature, targetCreature: Creature, _fight: Fight) {
    // Get the combo step to apply
    let comboStep = 1;
    if (targetCreature.hasStatusType(combo1)) {
      comboStep = 2;
    } else if (targetCreature.hasStatusType(combo2)) {
      comboStep = 3;
    }
    const power: number = this.powerLevels[comboStep - 1];

    const lifeChange = targetCreature.addLifeChange(computeEffectiveDamage(this, activeCreature, targetCreature, power))
    messages.addSkillExecutionMessage(activeCreature, this, targetCreature, lifeChange);

    // Add the status only if the attack succeeded
    if (comboStep <= 2 && lifeChange.isSuccess()) {
      // In some special cases (for example if alter time was used on the target), extra applications of combo may be present,
      // so we have to remove them all
      targetCreature.removeStatusApplications(combo1);
      targetCreature.removeStatusApplications(combo2);

      targetCreature.applyStatus(new StatusApplication(comboStep == 1 ? combo1 : combo2, 0, activeCreature, this.statusDuration, ElementType.NONE));
    }
  }
}

/**
 * A skill that damages the target creatures and heals the origin creature.
 */
export class Drain extends Skill {

  override executeOnTargetCreature(activeCreature: Creature, targetCreature: Creature, _fight: Fight) {
    const lifeChange: LifeChange = computeEffectiveDamage(this, activeCreature, targetCreature, this.powerLevels[0]);

    messages.addSkillExecutionMessage(activeCreature, this, targetCreature, targetCreature.addLifeChange(lifeChange));

    // Execute and display the second life change only if the attack succeeded
    if (lifeChange.isSuccess()) {
      messages.addSkillExecutionMessage(activeCreature, this, activeCreature, activeCreature.addLifeChange(new LifeGain(lifeChange.amount * this.powerLevels[1], lifeChange.efficiency)));
    }
  }
}

/**
 * A skill that damages the target creatures but also the origin creature.
 */
export class Berserk extends Skill {

  override executeOnTargetCreature(activeCreature: Creature, targetCreature: Creature, _fight: Fight) {
    const lifeChange: LifeChange = computeEffectiveDamage(this, activeCreature, targetCreature, this.powerLevels[0]);

    messages.addSkillExecutionMessage(activeCreature, this, targetCreature, targetCreature.addLifeChange(lifeChange));

    // Execute and display the second life change only if the attack succeeded
    if (lifeChange.isSuccess()) {
      messages.addSkillExecutionMessage(activeCreature, this, activeCreature, activeCreature.addLifeChange(new LifeLoss(lifeChange.amount * this.powerLevels[1], lifeChange.efficiency)));
    }
  }
}

/**
 * A damaging skill that also adds a damage over time.
 */
// TODO FBE remove the direct damage part
export class DamageAndDot extends Skill {

  override executeOnTargetCreature(activeCreature: Creature, targetCreature: Creature, _fight: Fight) {
    const lifeChange: LifeChange = computeEffectiveDamage(this, activeCreature, targetCreature, this.powerLevels[0]);

    // Direct damage part
    messages.addSkillExecutionMessage(activeCreature, this, targetCreature, targetCreature.addLifeChange(lifeChange));

    // Damage over time part
    if (lifeChange.isSuccess()) {
      targetCreature.applyStatus(new StatusApplication(this.statuses[0], this.powerLevels[1], activeCreature, this.statusDuration, ElementType.REMOVE_THIS));
    }
  }
}

/**
 * A damaging skill that also applies one or more statuses.
 */
export class DamageAndStatus extends Skill {

  override executeOnTargetCreature(activeCreature: Creature, targetCreature: Creature, _fight: Fight) {
    const lifeChange: LifeChange = computeEffectiveDamage(this, activeCreature, targetCreature, this.powerLevels[0]);

    // Damage part
    messages.addSkillExecutionMessage(activeCreature, this, targetCreature, targetCreature.addLifeChange(lifeChange));

    // Statuses part
    if (lifeChange.isSuccess()) {
      this.statuses.forEach(status => targetCreature.applyStatus(new StatusApplication(status, 0, activeCreature, this.statusDuration, ElementType.REMOVE_THIS)))
    }
  }
}

/**
 * A damaging skill that also applies one or more statuses to the active creature.
 */
export class DamageAndSelfStatus extends Damage {

  override executeOnActiveCreature(activeCreature: Creature, fight: Fight) {
    super.executeOnActiveCreature(activeCreature, fight);

    this.statuses.forEach(status => activeCreature.applyStatus(new StatusApplication(status, 0, activeCreature, this.statusDuration, ElementType.REMOVE_THIS)))
  }
}

/**
 * A healing skill.
 */
export class Heal extends Skill {

  override executeOnTargetCreature(activeCreature: Creature, targetCreature: Creature, _fight: Fight) {
    messages.addSkillExecutionMessage(activeCreature, this, targetCreature,
      targetCreature.addLifeChange(computeEffectiveHeal(activeCreature, targetCreature, this.powerLevels[0])));
  }

  override isUsableByCreature(creature: Creature, fight: Fight): boolean {
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

  override executeOnTargetCreature(activeCreature: Creature, targetCreature: Creature, _fight: Fight) {
    messages.addSkillExecutionMessage(activeCreature, this, targetCreature,
      targetCreature.addLifeChange(computeEffectiveHeal(activeCreature, targetCreature, this.powerLevels[0])));

    messages.addSkillExecutionMessage(activeCreature, this, activeCreature,
      activeCreature.addLifeChange(computeEffectiveHeal(activeCreature, activeCreature, this.powerLevels[1])));
  }
}

/**
 * A healing skill that also damages the caster.
 */
export class Sacrifice extends Skill {

  override executeOnTargetCreature(activeCreature: Creature, targetCreature: Creature, _fight: Fight) {
    const lifeChange: LifeChange = computeEffectiveHeal(activeCreature, targetCreature, this.powerLevels[0]);

    messages.addSkillExecutionMessage(activeCreature, this, targetCreature, targetCreature.addLifeChange(lifeChange));

    messages.addSkillExecutionMessage(activeCreature, this, activeCreature,
      activeCreature.addLifeChange(new LifeLoss(lifeChange.amount * this.powerLevels[1], lifeChange.efficiency)));
  }
}

/**
 * A heal over time skill.
 */
// TODO FBE remove the direct heal part
export class Regenerate extends Heal {

  override executeOnTargetCreature(activeCreature: Creature, targetCreature: Creature, _fight: Fight) {
    targetCreature.applyStatus(new StatusApplication(regeneration, this.powerLevels[1], activeCreature, this.statusDuration, ElementType.LIGHT));
    messages.addSkillExecutionMessage(activeCreature, this, targetCreature, null);
  }
}

/**
 * A revive skill.
 */
export class Revive extends Skill {

  override executeOnTargetCreature(activeCreature: Creature, targetCreature: Creature, _fight: Fight) {
    targetCreature.addLifeChange(new LifeGain(targetCreature.lifeMax / 2));
    messages.addSkillExecutionMessage(activeCreature, this, targetCreature, null);
  }
}

/**
 * The alter time skill reduces and increases statuses duration of the target.
 */
export class AlterTime extends Skill {

  override executeOnTargetCreature(activeCreature: Creature, targetCreature: Creature, _fight: Fight) {
    const increment: number = activeCreature?.isSameFactionThan(targetCreature) ? 1 : -1;
    targetCreature.activeStatusApplications.forEach(sa => sa.remainingDuration += sa.isImprovement() ? increment : -increment)
    messages.addSkillExecutionMessage(activeCreature, this, targetCreature, null);
  }
}

/**
 * Similar to alter time, but is used by enemies only if some specific condition is met.
 */
export class MassAlterTime extends AlterTime {

  protected override isUsableByCreature(creature: Creature, fight: Fight): boolean {
    // Can be used only if at least 2 opposing creature have at least 1 status each
    const count: number = fight.getAllAliveCharacters()
      .filter(creature => creature.activeStatusApplications.length >= 1)
      .map(() => 1)
      .reduce((currentSum, a) => currentSum + a, 0);
    if (count < 2) {
      return false;
    }

    return super.isUsableByCreature(creature, fight);
  }
}
