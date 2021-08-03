import {
  BleedMeleeEnemy,
  DragonEnemy,
  Enemy,
  HealerEnemy,
  LeechMeleeEnemy,
  MeleeEnemy,
  OldManEnemy,
  PoisonMeleeEnemy,
  StrategicEnemy
} from "./enemy.model";
import {CreatureType} from "./common.model";
import {SingleSkillStrategy} from "./enemy-strategy.model";
import {Strike} from "./skill.model";

export class EnemyBuilder {

  // Enemies from the fang forest

  static buildBear(): Enemy {
    return new BleedMeleeEnemy(CreatureType.BEAST, 'Bear', 34, 8);
  }

  static buildWolf(): Enemy {
    return new MeleeEnemy(CreatureType.BEAST, 'Wolf', 22, 6);
  }

  static buildOldMan(): Enemy {
    return new OldManEnemy(CreatureType.HUMANOID, 'Old Man', 28, 10, 2);
  }

  static buildGoblinSoldier(): Enemy {
    return new MeleeEnemy(CreatureType.HUMANOID, 'Goblin Solder', 22, 6);
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
    return new MeleeEnemy(CreatureType.UNDEAD, 'Skeleton', 18, 7);
  }

  static buildZombie(): Enemy {
    return new PoisonMeleeEnemy(CreatureType.UNDEAD, 'Zombie', 28, 8);
  }

  static buildVampire(): Enemy {
    return new LeechMeleeEnemy(CreatureType.UNDEAD, 'Vampire', 34, 8);
  }
}
