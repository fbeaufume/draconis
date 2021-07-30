import {Opposition} from "./opposition.model";
import {MeleeEnemy} from "./enemy.model";
import {CreatureType} from "./common.model";
import {EnemyBuilder} from "./enemy-builder.model";

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
                // new OldManEnemy(CreatureType.HUMANOID, 'Old Man', 24, 14),
                // new DragonEnemy(CreatureType.BEAST, 'Green Dragon', 120, 10, 2),
                new MeleeEnemy(CreatureType.OTHER, 'Monster', 1, 8),
                new MeleeEnemy(CreatureType.OTHER, 'Monster', 1, 8),
                // new MeleeEnemy(CreatureType.OTHER, Monster', 20, 8),
                // new MeleeEnemy(CreatureType.OTHER, 'Monster', 2, 5),
            ], [
                new MeleeEnemy(CreatureType.OTHER, 'Monster', 50, 8),
                new MeleeEnemy(CreatureType.OTHER, 'Monster', 50, 8),
                // new MeleeEnemy(CreatureType.OTHER, Monster', 50, 8),
                // new MeleeEnemy(CreatureType.OTHER, 'Monster', 50, 8),
            ]),
            new Opposition('some monsters', [
                new MeleeEnemy(CreatureType.OTHER, 'Monster', 5, 8),
                new MeleeEnemy(CreatureType.OTHER, 'Monster', 5, 8),
                new MeleeEnemy(CreatureType.OTHER, 'Monster', 5, 8),
            ], []),
        ]);
    }
}

/**
 * A forest themed dungeon.
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
            new Opposition('a mysterious old man', [
                EnemyBuilder.buildOldMan()
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
 * An undead themed dungeon.
 */
export class ForgottenGraveyardDungeon extends Dungeon {

    constructor() {
        super('Forgotten Graveyard', [
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
                EnemyBuilder.buildVampire(),
                EnemyBuilder.buildZombie(),
            ], [
                EnemyBuilder.buildSkeleton(),
            ]),
        ]);
    }
}
