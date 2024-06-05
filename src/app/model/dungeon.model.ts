import {Opposition} from './opposition.model';
import {EnemyBuilder} from './enemy-builder.model';
import {ElementType} from './common.model';

/**
 * Dungeon base class. A dungeon is where the fights happen. It is a succession of encounters.
 */
export class Dungeon {

  name: string;

  oppositions: Opposition[];

  constructor(
    name: string,
    oppositions: Opposition[]
  ) {
    this.name = name;
    this.oppositions = oppositions;
  }
}

/**
 * Test dungeon used during application development.
 */
export class TestDungeon extends Dungeon {

  constructor() {
    super('Test Dungeon', [
      new Opposition('some monsters', true, [
        // EnemyBuilder.buildFireElemental(),
        // EnemyBuilder.buildIceElemental(),
        // EnemyBuilder.buildRedMage(),
        // EnemyBuilder.buildBlackMage(),
        // EnemyBuilder.buildGenericMonster(1, 100),
        EnemyBuilder.buildGuardian(20, 5),
        EnemyBuilder.buildGuardian(20, 5),
        // EnemyBuilder.buildBrambleSpirit(),
        // EnemyBuilder.buildTroll(),
        // EnemyBuilder.buildWolf(),
        // EnemyBuilder.buildGenericMonster(1, 1),
        // EnemyBuilder.buildGenericMonster(30,5),
      ], [
        // EnemyBuilder.buildGenericMonster(10, 6),
        // EnemyBuilder.buildGenericMonster(50, 8),
      ]),
      new Opposition('some monsters', true, [
        EnemyBuilder.buildGenericVulnerableMonster(1000, 5, ElementType.PHYSICAL, ElementType.FIRE, ElementType.DARK),
      ], []),
      new Opposition('some monsters', true, [
        EnemyBuilder.buildGenericAoeMonster(1, 100),
        EnemyBuilder.buildGenericAoeMonster(1, 100),
      ], []),
    ]);
  }
}

/**
 * A forest with various beasts.
 */
export class FangForestDungeon extends Dungeon {

  constructor() {
    super('Fang Forest', [
      new Opposition('wild bears', true, [
        EnemyBuilder.buildBear(),
        EnemyBuilder.buildBear(),
      ]),
      new Opposition('a pack of wolves', true, [
        EnemyBuilder.buildWolf(),
      ], [
        EnemyBuilder.buildWolf(),
        EnemyBuilder.buildWolf(),
        EnemyBuilder.buildWolf(),
      ]),
      new Opposition('several bramble spirits', true, [
        EnemyBuilder.buildBrambleSpirit(),
        EnemyBuilder.buildBrambleSpirit(),
        EnemyBuilder.buildBrambleSpirit(),
      ]),
      new Opposition('a mysterious old man', true, [
        EnemyBuilder.buildOldMan()
      ]),
      new Opposition('trolls', true, [
        EnemyBuilder.buildTroll(),
        EnemyBuilder.buildTroll(),
      ]),
      new Opposition('a band of goblins', true, [
        EnemyBuilder.buildGoblinSoldier(),
        EnemyBuilder.buildGoblinSoldier(),
        EnemyBuilder.buildGoblinSoldier(),
      ], [
        EnemyBuilder.buildGoblinHunter(),
        EnemyBuilder.buildGoblinShaman(),
      ]),
      new Opposition('a young but fierce green dragon', false, [
        EnemyBuilder.buildGreenDragon(),
      ]),
    ]);
  }
}

/**
 * A graveyard with undead creatures.
 */
export class ForgottenGraveyardDungeon extends Dungeon {

  constructor() {
    super('Forgotten Graveyard', [
      new Opposition('giant rats', true, [
        EnemyBuilder.buildGiantRat(),
        EnemyBuilder.buildGiantRat(),
        EnemyBuilder.buildGiantRat(),
      ], [
        EnemyBuilder.buildGiantRat(),
        EnemyBuilder.buildGiantRat(),
        EnemyBuilder.buildGiantRat(),
      ]),
      new Opposition('skeletons', true, [
        EnemyBuilder.buildSkeleton(),
        EnemyBuilder.buildSkeleton(),
      ], [
        EnemyBuilder.buildSkeleton(),
        EnemyBuilder.buildSkeleton(),
      ]),
      new Opposition('zombies', true, [
        EnemyBuilder.buildZombie(),
        EnemyBuilder.buildZombie(),
        EnemyBuilder.buildZombie(),
      ]),
      new Opposition('vampires', true, [
        EnemyBuilder.buildVampire(),
        EnemyBuilder.buildVampire(),
      ]),
      new Opposition('undeads', true, [
        EnemyBuilder.buildSkeleton(),
        EnemyBuilder.buildSkeleton(),
      ], [
        EnemyBuilder.buildZombie(),
        EnemyBuilder.buildVampire(),
      ]),
      new Opposition('undeads', true, [
        EnemyBuilder.buildSkeleton(),
        EnemyBuilder.buildZombie(),
        EnemyBuilder.buildSkeleton(),
      ], [
        EnemyBuilder.buildLich(),
      ]),
    ]);
  }
}

/**
 * A mage tower with mages and elemental creatures.
 */
export class MageTowerDungeon extends Dungeon {

  constructor() {
    super('Mage Tower', [
      new Opposition('stone golems', true, [
        EnemyBuilder.buildStoneGolem(),
        EnemyBuilder.buildStoneGolem(),
      ]),
      new Opposition('red mages', true, [
        EnemyBuilder.buildRedMage(),
        EnemyBuilder.buildRedMage(),
        EnemyBuilder.buildRedMage(),
      ]),
      new Opposition('white mages', true, [
        EnemyBuilder.buildStoneGolem(),
      ], [
        EnemyBuilder.buildWhiteMage(),
        EnemyBuilder.buildWhiteMage(),
      ]),
      new Opposition('black mages', true, [
        EnemyBuilder.buildBlackMage(),
        EnemyBuilder.buildBlackMage(),
        EnemyBuilder.buildBlackMage(),
      ]),
    ]);
  }
}
