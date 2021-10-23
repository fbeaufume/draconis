import {Enemy, OldManEnemy, StrategicEnemy, StrategicMeleeEnemy} from "./enemy.model";
import {CreatureType, SkillIconType, SkillTargetType} from "./common.model";
import {
  PrioritySkillStrategy,
  SequentialSkillStrategy,
  SingleSkillStrategy,
  WeightedSkillStrategy
} from "./enemy-strategy.model";
import {ApplyStatus, DamageAndDot, Drain, Heal, Shot, Strike, StrikeSmall, Vengeance} from "./skill.model";
import {attackBonus, attackMalus, bleed, poison} from "./status-type.model";

export class EnemyBuilder {

  // Enemies from the test dungeon

  static buildGenericMonster(life: number, power: number): Enemy {
    return new StrategicMeleeEnemy(CreatureType.OTHER, 'Monster', life, power,
      new SingleSkillStrategy(new Strike('Attack')));
  }

  // Enemies from the fang forest

  static buildBear(): Enemy {
    return new StrategicMeleeEnemy(CreatureType.BEAST, 'Bear', 34, 8,
      new WeightedSkillStrategy()
        .addSkill(new Strike('Bite'), 1)
        .addSkill(new DamageAndDot([SkillIconType.ATTACK, SkillIconType.DETERIORATION], 'Maul', SkillTargetType.OTHER_ALIVE, 20, 1,
          1, '', [0.5, 0.4], [bleed]), 1)
        .addSkill(new ApplyStatus([SkillIconType.DETERIORATION], 'Roar', SkillTargetType.OTHER_ALIVE, 0, 1,
          1, '', [], [attackMalus]), 1));
  }

  static buildWolf(): Enemy {
    return new StrategicMeleeEnemy(CreatureType.BEAST, 'Wolf', 22, 6,
      new WeightedSkillStrategy()
        .addSkill(new Strike('Bite'), 3)
        .addSkill(new ApplyStatus([SkillIconType.IMPROVEMENT], 'Howl', SkillTargetType.SELF, 0, 0,
          1, '', [], [attackBonus]), 1));
  }

  static buildOldMan(): Enemy {
    return new OldManEnemy(CreatureType.HUMANOID, 'Old Man', 28, 10, 2);
  }

  static buildGoblinSoldier(): Enemy {
    return new StrategicMeleeEnemy(CreatureType.HUMANOID, 'Goblin Solder', 22, 6,
      new SingleSkillStrategy(new Vengeance([SkillIconType.ATTACK], 'Strike', SkillTargetType.OTHER_ALIVE, 0, 1,
        1, '')));
  }

  static buildGoblinHunter(): Enemy {
    return new StrategicEnemy(CreatureType.HUMANOID, 'Goblin Hunter', 24, 7,
      new SingleSkillStrategy(new Shot('Shot')));
  }

  static buildGoblinShaman(): Enemy {
    return new StrategicEnemy(CreatureType.HUMANOID, 'Goblin Shaman', 26, 7,
      new PrioritySkillStrategy(
        new Heal([SkillIconType.HEAL], 'Heal', SkillTargetType.SAME_WOUNDED, 5, 0, 1, ''),
        new SingleSkillStrategy(new Shot('Lightning'))));
  }

  static buildGreenDragon(): Enemy {
    return new StrategicMeleeEnemy(CreatureType.BEAST, 'Green Dragon', 120, 10,
      new SequentialSkillStrategy([
        new Strike('Left Claw'),
        new Strike('Right Claw'),
        new StrikeSmall('Fire Breath', SkillTargetType.OTHER_ALL)
      ]), 2);
  }

  // Enemies from the forgotten graveyard

  static buildSkeleton(): Enemy {
    return new StrategicMeleeEnemy(CreatureType.UNDEAD, 'Skeleton', 18, 7,
      new SingleSkillStrategy(new Strike('Strike')));
  }

  static buildZombie(): Enemy {
    return new StrategicMeleeEnemy(CreatureType.UNDEAD, 'Zombie', 28, 8,
      new SingleSkillStrategy(new DamageAndDot([SkillIconType.ATTACK, SkillIconType.DETERIORATION], 'Infect',
        SkillTargetType.OTHER_ALIVE, 20, 1, 1, '', [0.5, 0.4], [poison])));
  }

  static buildVampire(): Enemy {
    return new StrategicMeleeEnemy(CreatureType.UNDEAD, 'Vampire', 34, 8,
      new SingleSkillStrategy(new Drain([SkillIconType.ATTACK, SkillIconType.HEAL], 'Bite',
        SkillTargetType.OTHER_ALIVE, 20, 1, 1, '', [0.7, 0.7])));
  }

  static buildLich(): Enemy {
    return new StrategicMeleeEnemy(CreatureType.UNDEAD, 'Lich', 38, 8,
      new SingleSkillStrategy(new Shot('Dark Bolt')));
  }
}
