import {Opposition} from './opposition.model';
import {EnemyBuilder} from './enemy-builder.model';

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
      new Opposition('some monsters', [
        // EnemyBuilder.buildFireElemental(),
        // EnemyBuilder.buildIceElemental(),
        // EnemyBuilder.buildRedMage(),
        // EnemyBuilder.buildBlackMage(),
        // EnemyBuilder.buildGenericMonster(1, 100),
        EnemyBuilder.buildGenericMonster(30, 6),
        EnemyBuilder.buildGenericMonster(30, 6),
        EnemyBuilder.buildGenericMonster(30, 6),
        // EnemyBuilder.buildBrambleSpirit(),
        // EnemyBuilder.buildTroll(),
        // EnemyBuilder.buildWolf(),
        // EnemyBuilder.buildGenericMonster(1, 1),
        // EnemyBuilder.buildGenericMonster(30,5),
      ], [
        // EnemyBuilder.buildGenericMonster(1, 1),
        // EnemyBuilder.buildGenericMonster(50, 8),
      ]),
      new Opposition('some monsters', [
        EnemyBuilder.buildGreenDragon(),
      ], []),
      new Opposition('some monsters', [
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
      new Opposition('wild bears', [
        EnemyBuilder.buildBear(),
        EnemyBuilder.buildBear(),
      ]),
      new Opposition('a pack of wolves', [
        EnemyBuilder.buildWolf(),
      ], [
        EnemyBuilder.buildWolf(),
        EnemyBuilder.buildWolf(),
        EnemyBuilder.buildWolf(),
      ]),
      new Opposition('several bramble spirits', [
        EnemyBuilder.buildBrambleSpirit(),
        EnemyBuilder.buildBrambleSpirit(),
        EnemyBuilder.buildBrambleSpirit(),
      ]),
      new Opposition('a mysterious old man', [
        EnemyBuilder.buildOldMan()
      ]),
      new Opposition('trolls', [
        EnemyBuilder.buildTroll(),
        EnemyBuilder.buildTroll(),
      ]),
      new Opposition('a band of goblins', [
        EnemyBuilder.buildGoblinSoldier(),
        EnemyBuilder.buildGoblinSoldier(),
        EnemyBuilder.buildGoblinSoldier(),
      ], [
        EnemyBuilder.buildGoblinHunter(),
        EnemyBuilder.buildGoblinShaman(),
      ]),
      new Opposition('a young but fierce green dragon', [
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
      new Opposition('giant rats', [
        EnemyBuilder.buildGiantRat(),
        EnemyBuilder.buildGiantRat(),
        EnemyBuilder.buildGiantRat(),
      ], [
        EnemyBuilder.buildGiantRat(),
        EnemyBuilder.buildGiantRat(),
        EnemyBuilder.buildGiantRat(),
      ]),
      new Opposition('skeletons', [
        EnemyBuilder.buildSkeleton(),
        EnemyBuilder.buildSkeleton(),
      ], [
        EnemyBuilder.buildSkeleton(),
        EnemyBuilder.buildSkeleton(),
      ]),
      new Opposition('zombies', [
        EnemyBuilder.buildZombie(),
        EnemyBuilder.buildZombie(),
        EnemyBuilder.buildZombie(),
      ]),
      new Opposition('vampires', [
        EnemyBuilder.buildVampire(),
        EnemyBuilder.buildVampire(),
      ]),
      new Opposition('undeads', [
        EnemyBuilder.buildSkeleton(),
        EnemyBuilder.buildSkeleton(),
      ], [
        EnemyBuilder.buildZombie(),
        EnemyBuilder.buildVampire(),
      ]),
      new Opposition('undeads', [
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
      new Opposition('stone golems', [
        EnemyBuilder.buildStoneGolem(),
        EnemyBuilder.buildStoneGolem(),
      ]),
      new Opposition('red mages', [
        EnemyBuilder.buildRedMage(),
        EnemyBuilder.buildRedMage(),
        EnemyBuilder.buildRedMage(),
      ]),
      new Opposition('white mages', [
        EnemyBuilder.buildStoneGolem(),
      ], [
        EnemyBuilder.buildWhiteMage(),
        EnemyBuilder.buildWhiteMage(),
      ]),
      new Opposition('black mages', [
        EnemyBuilder.buildBlackMage(),
        EnemyBuilder.buildBlackMage(),
        EnemyBuilder.buildBlackMage(),
      ]),
    ]);
  }
}
