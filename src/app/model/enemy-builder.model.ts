import {DragonEnemy, Enemy, HealerEnemy, OldManEnemy, StrategicEnemy, StrategicMeleeEnemy} from "./enemy.model";
import {CreatureType, SkillIconType, SkillTargetType} from "./common.model";
import {SingleSkillStrategy} from "./enemy-strategy.model";
import {DamageAndBleed, DamageAndHeal, DamageAndPoison, Strike} from "./skill.model";

export class EnemyBuilder {

  // Enemies from the test dungeon

  static buildGenericMonster(life: number, power: number): Enemy {
    return new StrategicMeleeEnemy(CreatureType.OTHER, 'Monster', life, power,
      new SingleSkillStrategy(new Strike('Attack')));
  }

  // Enemies from the fang forest

  static buildBear(): Enemy {
    return new StrategicMeleeEnemy(CreatureType.BEAST, 'Bear', 34, 8,
      new SingleSkillStrategy(new DamageAndBleed(SkillIconType.ATTACK, 'Maul',
        SkillTargetType.OTHER_ALIVE, 20, 1, 0, '', [0.5, 0.4])));
  }

  static buildWolf(): Enemy {
    return new StrategicMeleeEnemy(CreatureType.BEAST, 'Wolf', 22, 6,
      new SingleSkillStrategy(new Strike('Bite')));
  }

  static buildOldMan(): Enemy {
    return new OldManEnemy(CreatureType.HUMANOID, 'Old Man', 28, 10, 2);
  }

  static buildGoblinSoldier(): Enemy {
    return new StrategicMeleeEnemy(CreatureType.HUMANOID, 'Goblin Solder', 22, 6,
      new SingleSkillStrategy(new Strike('Strike')));
  }

  static buildGoblinHunter(): Enemy {
    return new StrategicEnemy(CreatureType.HUMANOID, 'Goblin Hunter', 24, 7,
      new SingleSkillStrategy(new Strike('Shot')));
  }

  static buildGoblinShaman(): Enemy {
    return new HealerEnemy(CreatureType.HUMANOID, 'Goblin Shaman', 26, 7);
  }

  static buildGreenDragon(): Enemy {
    return new DragonEnemy(CreatureType.BEAST, 'Green Dragon', 120, 10, 2);
  }

  // Enemies from the forgotten graveyard

  static buildSkeleton(): Enemy {
    return new StrategicMeleeEnemy(CreatureType.UNDEAD, 'Skeleton', 18, 7,
      new SingleSkillStrategy(new Strike('Strike')));
  }

  static buildZombie(): Enemy {
    return new StrategicMeleeEnemy(CreatureType.UNDEAD, 'Zombie', 28, 8,
      new SingleSkillStrategy(new DamageAndPoison(SkillIconType.ATTACK, 'Infect',
        SkillTargetType.OTHER_ALIVE, 20, 1, 0, '', [0.5, 0.4])));
  }

  static buildVampire(): Enemy {
    return new StrategicMeleeEnemy(CreatureType.UNDEAD, 'Vampire', 34, 8,
      new SingleSkillStrategy(new DamageAndHeal(SkillIconType.ATTACK, 'Bite',
        SkillTargetType.OTHER_ALIVE, 20, 1, 0, '', [0.8, 0.5])));
  }
}
