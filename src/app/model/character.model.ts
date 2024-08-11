import {
  CreatureClass,
  CreatureType,
  ElementType,
  FactionType,
  SkillModifierType,
  SkillTargetType
} from './common.model';
import {
  AlterTime,
  ApplyDeterioration,
  ApplyImprovement,
  Berserk,
  ComboDamage,
  Damage,
  DamageAndDot,
  DamageAndSelfStatus,
  DamageAndStatus,
  DefendMagic,
  DefendTech,
  DualHeal,
  Execution,
  Heal,
  Judgement,
  Regenerate,
  Revive,
  Sacrifice,
  Skill,
  Strike,
  Vengeance
} from './skill.model';
import {Creature} from './creature.model';
import {
  attackBonus,
  attackMalus,
  bleed,
  burn,
  defend,
  defenseBonus,
  defenseMalus,
  fireTrap,
  iceTrap
} from './status-type.model';
import {Constants} from './constants.model';

/**
 * A party character.
 */
export class Character extends Creature {

  /**
   * The character level.
   */
  level: number;

  /**
   * True for mana based character class, false for tech based.
   */
  useMana: boolean;

  constructor(
    name: string,
    // Character class, could be an enum
    clazz: CreatureClass,
    level: number,
    lifeMax: number,
    useMana: boolean,
    energyMax: number,
    power: number,
    skills: Skill[],
    specialities: CreatureType[]
  ) {
    super(FactionType.PARTY, CreatureType.HUMANOID, name, clazz, lifeMax, energyMax, power, skills, specialities);
    this.level = level;
    this.useMana = useMana;
    this.restoreEnergy();
  }

  isCharacter(): boolean {
    return true;
  }

  isEnemy(): boolean {
    return false;
  }

  isChampion(): boolean {
    return false;
  }

  isEndOfRound(): boolean {
    return false;
  }

  getEnergyName(): string {
    return this.useMana ? 'MP' : 'TP';
  }

  restoreEnergy() {
    this.energy = this.energyMax;
    this.updateEnergyPercent();
  }
}

export class Warrior extends Character {

  constructor(name: string) {
    super(name, CreatureClass.WARRIOR, 4, 30, false, 3, 8, [
        new DefendTech(),
        new Strike('Strike', ElementType.PHYSICAL, 'Inflict _100% physical damage to the target.'),
        new Vengeance('Vengeance', SkillTargetType.OTHER_ALIVE, 1, true, 1, 1,
          'Inflict _80% to _160% physical damage to the target based on how low the character life is.', ElementType.PHYSICAL),
        new Berserk('Berserk', SkillTargetType.OTHER_ALIVE, 1, true, 1, 1,
          'Inflict _150% physical damage to the target and _50% to self.', ElementType.PHYSICAL, [1.5, 0.33]),
        new ComboDamage('Combo Shot', SkillTargetType.OTHER_ALIVE, 1, false, 2, 1,
          'Inflict _80% physical damage then _120% then _160% when used on the same target during consecutive rounds. Cannot be dodged.', ElementType.PHYSICAL, [0.8, 1.2, 1.6], [],
          Constants.COMBO_DURATION, [SkillModifierType.CANNOT_BE_DODGED]),
        new DamageAndDot('Deep Wound', SkillTargetType.OTHER_ALIVE, 1, true, 1, 1,
          'Inflict _50% bleed damage to the target and _120% bleed damage over _3 rounds.', ElementType.BLEED, [0.5, 0.4], [bleed]),
        new Damage('Slash', SkillTargetType.OTHER_ALIVE_DOUBLE, 1, true, 1, 2,
          'Inflict _80% physical damage to two adjacent targets.', ElementType.PHYSICAL, [0.8]),
        new ApplyImprovement('War Cry', SkillTargetType.SAME_ALIVE_ALL, 1, false, 0, 3,
          'Increase the party attack by _20% during _2 rounds.', ElementType.PHYSICAL, [], [attackBonus], 2),
      ],
      [CreatureType.BEAST]);
  }
}

export class Knight extends Character {

  constructor(name: string) {
    super(name, CreatureClass.KNIGHT, 4, 30, false, 3, 8, [
        new DefendTech(),
        new Strike('Strike', ElementType.PHYSICAL, 'Inflict _100% physical damage to the target.'),
        new DamageAndSelfStatus('Guard Strike', SkillTargetType.OTHER_ALIVE, 1, true, 1, 1,
          'Inflict _50% physical damage to the target and reduce received damage by _20% during _1 round.', ElementType.PHYSICAL, [0.5], [defend], 1),
        new ApplyDeterioration('Intimidate', SkillTargetType.OTHER_ALIVE, 1, false, 1, 1,
          'Reduce the target attack by _20% during _3 rounds.', ElementType.PHYSICAL, [], [attackMalus]),
        new ApplyImprovement('Protection', SkillTargetType.SAME_ALIVE_ALL, 1, false, 0, 3,
          'Increase the party defense by _20% during _2 rounds.', ElementType.ARCANE, [], [defenseBonus], 2),
      ],
      [CreatureType.HUMANOID]);
  }
}

// TODO FBE move the skills to other classes, then remove this class
export class Paladin extends Character {

  constructor(name: string) {
    super(name, CreatureClass.PALADIN, 4, 30, true, 50, 8, [
        new Judgement('Judgement', SkillTargetType.OTHER_ALIVE, 5, true, 1, 1,
          'Inflict _40% to _120% light damage to the target based on how high the target life is.', ElementType.LIGHT),
        new Sacrifice('Sacrifice', SkillTargetType.SAME_ALIVE_OTHER, 10, false, 0, 1,
          'Heal a character for _150% damage but damages self for _50% light damage.', ElementType.LIGHT, [1.5, 0.33]),
      ],
      [CreatureType.UNDEAD]);
  }
}

// TODO FBE move the skills to other classes, then remove this class
export class Hunter extends Character {

  constructor(name: string) {
    super(name, CreatureClass.ARCHER, 4, 30, false, 3, 8, [
        new Execution('Final Shot', SkillTargetType.OTHER_ALIVE, 1, false, 2, 1,
          'Inflict _60% to _140% physical damage to the target based on how low the target life is.', ElementType.PHYSICAL),
        new Damage('Barrage', SkillTargetType.OTHER_FIRST_ROW, 2, false, 1, 2,
          'Inflict _50% physical damage to first row enemies.', ElementType.PHYSICAL, [0.5]),
        new ApplyImprovement('Fire Trap', SkillTargetType.SAME_ALIVE, 1, false, 0, 2,
          'Protect the target with a fire trap that deals _75% damage to melee attackers over _3 rounds.', ElementType.PHYSICAL, [], [fireTrap]),
        new ApplyImprovement('Ice Trap', SkillTargetType.SAME_ALIVE, 1, false, 0, 2,
          'Protect the target with an ice trap that reduces the attack and defense of melee attackers by _20% during _3 rounds.', ElementType.PHYSICAL, [], [iceTrap]),
        new ApplyDeterioration('Crippling Shot', SkillTargetType.OTHER_ALIVE, 1, false, 2, 1,
          'Reduce the target defense by _20% during _3 rounds.', ElementType.PHYSICAL, [], [defenseMalus]),
      ],
      [CreatureType.BEAST]);
  }
}

export class Mage extends Character {

  constructor(name: string) {
    super(name, CreatureClass.MAGE, 4, 30, true, 50, 8, [
        new DefendMagic(),
        new Damage('Lightning', SkillTargetType.OTHER_ALIVE, 5, false, 2, 1,
          'Inflict _100% lightning damage.', ElementType.LIGHTNING),
        new DamageAndDot('Burn', SkillTargetType.OTHER_ALIVE, 10, false, 2, 2,
          'Inflict _50% fire damage to the target and _150% fire damage over _3 rounds.', ElementType.FIRE, [0.5, 0.5], [burn]),
        new DamageAndStatus('Ice Blast', SkillTargetType.OTHER_ALIVE, 10, false, 2, 1,
          'Inflict _50% ice damage to the target and reduce the target attack and defense by _20% during one round.', ElementType.ICE, [0.5], [attackMalus, defenseMalus], 1),
        new Damage('Fireball', SkillTargetType.OTHER_ALIVE_TRIPLE, 10, false, 2, 3,
          'Inflict _80% fire damage to _3 adjacent targets.', ElementType.FIRE, [0.8]),
        new Damage('Inferno', SkillTargetType.OTHER_ALIVE_ALL, 10, false, 2, 3,
          'Inflict _30% fire damage to all enemies.', ElementType.FIRE, [0.3]),
        new AlterTime('Alter Time', SkillTargetType.ALIVE, 10, false, 2, 1,
          'Modify the duration of all statuses of the target by _1 round.', ElementType.ARCANE)
      ],
      [CreatureType.ELEMENTAL]);
  }
}

export class Priest extends Character {

  constructor(name: string) {
    super(name, CreatureClass.PRIEST, 4, 30, true, 50, 8, [
        new DefendMagic(),
        new Damage('Holy Blast', SkillTargetType.OTHER_ALIVE, 5, true, 1, 1,
          'Inflict _100% light damage.', ElementType.LIGHT),
        new Heal('Heal', SkillTargetType.SAME_ALIVE, 5, false, 0, 1,
          'Heal a character for _100% damage.', ElementType.LIGHT),
        new DualHeal('Dual Heal', SkillTargetType.SAME_ALIVE_OTHER, 10, false, 0, 2,
          'Heal a character for _100% damage and self for _80% damage.', ElementType.LIGHT, [1, 0.8]),
        new Regenerate('Regenerate', SkillTargetType.SAME_ALIVE, 5, false, 0, 1,
          'Heal a character for _50% damage and _120% damage over 3 rounds.', ElementType.LIGHT, [0.5, 0.4]),
        new Heal('Heal All', SkillTargetType.SAME_ALIVE_ALL, 15, false, 0, 3,
          'Heal all characters for _50% damage.', ElementType.LIGHT, [0.5]),
        new Revive('Revive', SkillTargetType.SAME_DEAD, 15, false, 0, 2,
          'Revive a character with _50% life.', ElementType.LIGHT),
      ],
      [CreatureType.UNDEAD]);
  }
}
