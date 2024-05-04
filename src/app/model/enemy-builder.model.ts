import {Enemy, OldManEnemy, StrategicEnemy, StrategicMeleeEnemy} from './enemy.model';
import {BasicLogType, CreatureSize, CreatureType, ElementType, SkillTargetType} from './common.model';
import {PriorityStrategy, SequentialStrategy, WeightedStrategy} from './strategy.model';
import {
  Advance,
  ApplyDeterioration,
  ApplyImprovement,
  CustomShot,
  CustomStrike,
  DamageAndDot,
  Drain,
  Heal,
  Leave,
  LogMessage,
  MassAlterTime,
  Shot,
  Strike,
  Vengeance
} from './skill.model';
import {
  attackBonus,
  attackMalus,
  bleed,
  burn,
  fireTrap,
  iceTrap,
  poison,
  reflectMeleeDamage,
  regeneration
} from './status-type.model';

export class EnemyBuilder {

  // Enemies for the test dungeon

  static buildGenericMonster(life: number, power: number): Enemy {
    return new StrategicMeleeEnemy(CreatureType.OTHER, 'Monster', life, power,
      new Strike('Attack', ElementType.PHYSICAL));
  }

  static buildGenericAoeMonster(life: number, power: number): Enemy {
    return new StrategicEnemy(CreatureType.OTHER, 'AoE Monster', life, power,
      new CustomShot('Attack', ElementType.PHYSICAL, 1, SkillTargetType.OTHER_ALIVE_ALL));
  }

  static buildGenericVulnerableMonster(life: number, power: number, ...elementTypes: ElementType[]): Enemy {
    const monster = this.buildGenericMonster(life, power);
    elementTypes.forEach(type => monster.withElementalResistance(type, -9)); // -9 means that the creature receives x10 damages
    return monster;
  }

  // Enemies for the fang forest

  static buildBear(): Enemy {
    return new StrategicMeleeEnemy(CreatureType.BEAST, 'Bear', 34, 8,
      new WeightedStrategy()
        .addSkill(1, new Strike('Bite', ElementType.PHYSICAL))
        .addSkill(1, new DamageAndDot('Maul', SkillTargetType.OTHER_ALIVE, 20, true, 1,
          1, '', ElementType.BLEED, [0.5, 0.4], [bleed]))
        .addSkill(1, new ApplyDeterioration('Roar', SkillTargetType.OTHER_ALIVE, 0, false, 1,
          1, '', ElementType.PHYSICAL, [], [attackMalus])));
  }

  static buildWolf(): Enemy {
    return new StrategicMeleeEnemy(CreatureType.BEAST, 'Wolf', 22, 6,
      new WeightedStrategy()
        .addSkill(3, new Strike('Bite', ElementType.PHYSICAL))
        .addSkill(1, new ApplyImprovement('Howl', SkillTargetType.SELF, 0, false, 0,
          1, '', ElementType.PHYSICAL, [], [attackBonus])),
      CreatureSize.SMALL);
  }

  static buildBrambleSpirit(): Enemy {
    return new StrategicMeleeEnemy(CreatureType.ELEMENTAL, 'Bramble Spirit', 24, 6,
      new Strike('Scratch', ElementType.PHYSICAL))
      .withElementalResistance(ElementType.FIRE, -0.3)
      .withPassiveStatus(reflectMeleeDamage, 0);
  }

  static buildOldMan(): Enemy {
    return new OldManEnemy(CreatureType.HUMANOID, 'Old Man', 28, 10, CreatureSize.REGULAR, 2);
  }

  static buildTroll(): Enemy {
    return new StrategicMeleeEnemy(CreatureType.HUMANOID, 'Troll', 46, 8,
      new Strike('Attack', ElementType.PHYSICAL))
      .withPassiveStatus(regeneration, 1);
  }

  static buildGoblinSoldier(): Enemy {
    return new StrategicMeleeEnemy(CreatureType.HUMANOID, 'Goblin Soldier', 22, 6,
      new Vengeance('Strike', SkillTargetType.OTHER_ALIVE, 0, true, 1, 1, '', ElementType.PHYSICAL));
  }

  static buildGoblinHunter(): Enemy {
    return new StrategicEnemy(CreatureType.HUMANOID, 'Goblin Hunter', 24, 7,
      new Shot('Shot', ElementType.PHYSICAL));
  }

  static buildGoblinShaman(): Enemy {
    return new StrategicEnemy(CreatureType.HUMANOID, 'Goblin Shaman', 26, 7,
      new PriorityStrategy(
        new Heal('Heal', SkillTargetType.SAME_WOUNDED, 5, false, 0, 1, '', ElementType.LIGHT),
        new Shot('Lightning', ElementType.LIGHTNING)));
  }

  static buildGreenDragon(): Enemy {
    return new StrategicMeleeEnemy(CreatureType.BEAST, 'Green Dragon', 120, 10,
      new SequentialStrategy([
        new Strike('Left Claw', ElementType.PHYSICAL),
        new Strike('Right Claw', ElementType.PHYSICAL),
        new LogMessage(BasicLogType.DRAGON_BREATH),
        new CustomStrike('Fire Breath', ElementType.FIRE, 0.7, SkillTargetType.OTHER_ALL)
      ]), CreatureSize.HUGE, 2);
  }

  // Enemies for the forgotten graveyard

  static buildGiantRat(): Enemy {
    return new StrategicEnemy(CreatureType.BEAST, 'Giant Rat', 12, 5,
      new WeightedStrategy()
        .addSkill(2, new Leave())
        .addSkill(8, new PriorityStrategy(
          new Advance(),
          new Strike('Bite', ElementType.PHYSICAL)))
      , CreatureSize.TINY);
  }

  static buildSkeleton(): Enemy {
    return new StrategicMeleeEnemy(CreatureType.UNDEAD, 'Skeleton', 18, 7,
      new Strike('Strike', ElementType.PHYSICAL))
      .withElementalResistance(ElementType.LIGHT, -0.2)
      .withElementalResistance(ElementType.DARK, 0.5);
  }

  static buildZombie(): Enemy {
    return new StrategicMeleeEnemy(CreatureType.UNDEAD, 'Zombie', 28, 8,
      new DamageAndDot('Infect', SkillTargetType.OTHER_ALIVE, 20, true, 1, 1, '', ElementType.POISON, [0.5, 0.4], [poison]))
      .withElementalResistance(ElementType.LIGHT, -0.2)
      .withElementalResistance(ElementType.DARK, 0.5);
  }

  static buildVampire(): Enemy {
    return new StrategicMeleeEnemy(CreatureType.UNDEAD, 'Vampire', 34, 8,
      new Drain('Bite', SkillTargetType.OTHER_ALIVE, 20, true, 1, 1, '', ElementType.PHYSICAL, [0.7, 0.7]))
      .withElementalResistance(ElementType.LIGHT, -0.2)
      .withElementalResistance(ElementType.DARK, 0.5);
  }

  static buildLich(): Enemy {
    return new StrategicMeleeEnemy(CreatureType.UNDEAD, 'Lich', 38, 8,
      new Shot('Dark Bolt', ElementType.DARK))
      .withElementalResistance(ElementType.LIGHT, -0.2)
      .withElementalResistance(ElementType.DARK, 0.5);
  }

  // Enemies for the mage tower

  static buildStoneGolem(): Enemy {
    return new StrategicMeleeEnemy(CreatureType.ELEMENTAL, 'Stone Golem', 40, 5,
      new Strike('Bash', ElementType.PHYSICAL))
      .withElementalResistance(ElementType.BLEED, 1)
      .withElementalResistance(ElementType.PHYSICAL, 0.5);
  }

  static buildFireElemental(): Enemy {
    return new StrategicMeleeEnemy(CreatureType.ELEMENTAL, 'Fire Elemental', 30, 7,
      new Strike('Strike', ElementType.FIRE))
      .withElementalResistance(ElementType.FIRE, 1)
      .withElementalResistance(ElementType.ICE, -0.3)
      .withPassiveStatus(fireTrap, 0);
  }

  static buildIceElemental(): Enemy {
    return new StrategicMeleeEnemy(CreatureType.ELEMENTAL, 'Ice Elemental', 30, 7,
      new Strike('Strike', ElementType.ICE))
      .withElementalResistance(ElementType.FIRE, -0.3)
      .withElementalResistance(ElementType.ICE, 1)
      .withPassiveStatus(iceTrap, 0);
  }

  static buildRedMage(): Enemy {
    return new StrategicEnemy(CreatureType.HUMANOID, 'Red Mage', 26, 7,
      new WeightedStrategy()
        .addSkill(1, new Shot('Fire Blast', ElementType.FIRE))
        .addSkill(1, new DamageAndDot('Burn', SkillTargetType.OTHER_ALIVE, 10, false, 2, 1, '', ElementType.FIRE, [0.5, 0.5], [burn]))
        .addSkill(1, new CustomShot('Fireball', ElementType.FIRE, 0.8, SkillTargetType.OTHER_ALIVE_TRIPLE)));
  }

  static buildWhiteMage(): Enemy {
    return new StrategicEnemy(CreatureType.HUMANOID, 'White Mage', 26, 7,
      new PriorityStrategy(
        new Heal('Heal', SkillTargetType.SAME_WOUNDED, 5, false, 0, 1, '', ElementType.LIGHT),
        new Shot('Light Blast', ElementType.LIGHT)));
  }

  static buildBlackMage(): Enemy {
    return new StrategicEnemy(CreatureType.HUMANOID, 'Black Mage', 26, 7,
      new WeightedStrategy()
        .addSkill(1, new Drain('Drain Life', SkillTargetType.OTHER_ALIVE, 10, false, 2, 1, '', ElementType.DARK, [0.5, 1]))
        .addSkill(1, new MassAlterTime('Mass Alter Time', SkillTargetType.OTHER_ALL, 10, false, 2, 1, '', ElementType.ARCANE)));
  }
}
