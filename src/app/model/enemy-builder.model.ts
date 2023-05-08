import {Enemy, OldManEnemy, StrategicEnemy, StrategicMeleeEnemy} from './enemy.model';
import {BasicLogType, CreatureType, ElementType, SkillTargetType} from './common.model';
import {PrioritySkillStrategy, SequentialSkillStrategy, WeightedSkillStrategy} from './enemy-strategy.model';
import {
  ApplyDeterioration,
  ApplyImprovement,
  Damage,
  DamageAndDot,
  Drain,
  Heal,
  LogMessage,
  MassAlterTime,
  Shot,
  Strike,
  StrikeSmall,
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
      new Strike('Attack'));
  }

  static buildGenericAoeMonster(life: number, power: number): Enemy {
    return new StrategicEnemy(CreatureType.OTHER, 'AoE Monster', life, power,
      new Damage('Attack', SkillTargetType.OTHER_ALIVE_ALL, 0, false, 2, 1, '', [1]));
  }

  // Enemies for the fang forest

  static buildBear(): Enemy {
    return new StrategicMeleeEnemy(CreatureType.BEAST, 'Bear', 34, 8,
      new WeightedSkillStrategy()
        .addSkill(new Strike('Bite'), 1)
        .addSkill(new DamageAndDot('Maul', SkillTargetType.OTHER_ALIVE, 20, true, 1,
          1, '', [0.5, 0.4], [bleed]), 1)
        .addSkill(new ApplyDeterioration('Roar', SkillTargetType.OTHER_ALIVE, 0, false, 1,
          1, '', [], [attackMalus]), 1));
  }

  static buildWolf(): Enemy {
    return new StrategicMeleeEnemy(CreatureType.BEAST, 'Wolf', 22, 6,
      new WeightedSkillStrategy()
        .addSkill(new Strike('Bite'), 3)
        .addSkill(new ApplyImprovement('Howl', SkillTargetType.SELF, 0, false, 0,
          1, '', [], [attackBonus]), 1));
  }

  static buildBrambleSpirit(): Enemy {
    return new StrategicMeleeEnemy(CreatureType.ELEMENTAL, 'Bramble Spirit', 24, 6,
      new Strike('Scratch'))
      .withElementalResistance(ElementType.FIRE, -0.3)
      .withPassiveStatus(reflectMeleeDamage, 0);
  }

  static buildOldMan(): Enemy {
    return new OldManEnemy(CreatureType.HUMANOID, 'Old Man', 28, 10, 2);
  }

  static buildTroll(): Enemy {
    return new StrategicMeleeEnemy(CreatureType.HUMANOID, 'Troll', 46, 8,
      new Strike('Attack'))
      .withPassiveStatus(regeneration, 1);
  }

  static buildGoblinSoldier(): Enemy {
    return new StrategicMeleeEnemy(CreatureType.HUMANOID, 'Goblin Soldier', 22, 6,
      new Vengeance('Strike', SkillTargetType.OTHER_ALIVE, 0, true, 1, 1, ''));
  }

  static buildGoblinHunter(): Enemy {
    return new StrategicEnemy(CreatureType.HUMANOID, 'Goblin Hunter', 24, 7,
      new Shot('Shot'));
  }

  static buildGoblinShaman(): Enemy {
    return new StrategicEnemy(CreatureType.HUMANOID, 'Goblin Shaman', 26, 7,
      new PrioritySkillStrategy(
        new Heal('Heal', SkillTargetType.SAME_WOUNDED, 5, false, 0, 1, ''),
        new Shot('Lightning')));
  }

  static buildGreenDragon(): Enemy {
    return new StrategicMeleeEnemy(CreatureType.BEAST, 'Green Dragon', 120, 10,
      new SequentialSkillStrategy([
        new Strike('Left Claw'),
        new Strike('Right Claw'),
        new LogMessage(BasicLogType.DRAGON_BREATH),
        new StrikeSmall('Fire Breath', SkillTargetType.OTHER_ALL)
      ]), 2);
  }

  // Enemies for the forgotten graveyard

  static buildGiantRat(): Enemy {
    return new StrategicMeleeEnemy(CreatureType.BEAST, 'Giant Rat', 12, 6,
      new Strike('Bite'));
  }

  static buildSkeleton(): Enemy {
    return new StrategicMeleeEnemy(CreatureType.UNDEAD, 'Skeleton', 18, 7,
      new Strike('Strike'))
      .withElementalResistance(ElementType.DARK, 0.5);
  }

  static buildZombie(): Enemy {
    return new StrategicMeleeEnemy(CreatureType.UNDEAD, 'Zombie', 28, 8,
      new DamageAndDot('Infect', SkillTargetType.OTHER_ALIVE, 20, true, 1, 1, '', [0.5, 0.4], [poison]))
      .withElementalResistance(ElementType.DARK, 0.5);
  }

  static buildVampire(): Enemy {
    return new StrategicMeleeEnemy(CreatureType.UNDEAD, 'Vampire', 34, 8,
      new Drain('Bite', SkillTargetType.OTHER_ALIVE, 20, true, 1, 1, '', [0.7, 0.7]))
      .withElementalResistance(ElementType.DARK, 0.5);
  }

  static buildLich(): Enemy {
    return new StrategicMeleeEnemy(CreatureType.UNDEAD, 'Lich', 38, 8,
      new Shot('Dark Bolt'))
      .withElementalResistance(ElementType.DARK, 0.5);
  }

  // Enemies for the mage tower

  static buildStoneGolem(): Enemy {
    return new StrategicMeleeEnemy(CreatureType.ELEMENTAL, 'Stone Golem', 40, 5,
      new Strike('Bash'))
      .withElementalResistance(ElementType.BLEED, 1)
      .withElementalResistance(ElementType.BLEED, 0.5);
  }

  static buildFireElemental(): Enemy {
    return new StrategicMeleeEnemy(CreatureType.ELEMENTAL, 'Fire Elemental', 30, 7,
      new Strike('Strike'))
      .withElementalResistance(ElementType.FIRE, 1)
      .withElementalResistance(ElementType.ICE, -0.3)
      .withPassiveStatus(fireTrap, 0);
  }

  static buildIceElemental(): Enemy {
    return new StrategicMeleeEnemy(CreatureType.ELEMENTAL, 'Ice Elemental', 30, 7,
      new Strike('Strike'))
      .withElementalResistance(ElementType.FIRE, -0.3)
      .withElementalResistance(ElementType.ICE, 1)
      .withPassiveStatus(iceTrap, 0);
  }

  static buildRedMage(): Enemy {
    return new StrategicEnemy(CreatureType.HUMANOID, 'Red Mage', 26, 7,
      new WeightedSkillStrategy()
        .addSkill(new Shot('Fire Blast'), 1)
        .addSkill(new DamageAndDot('Burn', SkillTargetType.OTHER_ALIVE, 10, false, 2, 1, '', [0.5, 0.5], [burn]), 1)
        .addSkill(new Damage('Fireball', SkillTargetType.OTHER_ALIVE_TRIPLE, 10, false, 2, 1, '', [0.8]), 1));
  }

  static buildWhiteMage(): Enemy {
    return new StrategicEnemy(CreatureType.HUMANOID, 'White Mage', 26, 7,
      new PrioritySkillStrategy(
        new Heal('Heal', SkillTargetType.SAME_WOUNDED, 5, false, 0, 1, ''),
        new Shot('Light Blast')));
  }

  static buildBlackMage(): Enemy {
    return new StrategicEnemy(CreatureType.HUMANOID, 'Black Mage', 26, 7,
      new WeightedSkillStrategy()
        .addSkill(new Drain('Drain Life', SkillTargetType.OTHER_ALIVE, 10, false, 2, 1, '', [0.5, 1]), 1)
        .addSkill(new MassAlterTime('Mass Alter Time', SkillTargetType.OTHER_ALL, 10, false, 2, 1, ''), 1));
  }
}
