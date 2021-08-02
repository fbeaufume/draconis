import {Creature, EndOfRound} from "./creature.model";
import {Party} from "./party.model";
import {Opposition} from "./opposition.model";
import {Character} from "./character.model";
import {Enemy} from "./enemy.model";

/**
 * The action order of characters and enemies during a turn.
 */
export class TurnOrder {

    /**
     * Turn order of playable creatures (i.e. characters and living enemies).
     * The active creature if the first one in the array.
     */
    currentOrder: Creature[] = [];

    constructor(
        party: Party,
        opposition: Opposition) {
        if (opposition.countAliveCreatures() <= 0) {
            // At the beginning of a dungeon, there is no opposition,
            // so we do not display any turn order
            return;
        }

        this.initialize(party, opposition);

        // Add a special creature to mark the end of round
        this.currentOrder.push(new EndOfRound());
    }

    /**
     * Build a good order of characters and enemies.
     */
    initialize(party: Party, opposition: Opposition) {
        // Shuffle tha party
        const characters: Character[] = [];
        party.forEachCharacter(character => characters.push(character));
        TurnOrder.shuffle(characters);

        // Shuffle the enemies
        const enemies: Enemy[] = [];
        opposition.forEachEnemy(enemy => {
            // An enemy with N actions is present N times in the turn order
            for (let i = 0; i < enemy.actions; i++) {
                enemies.push(enemy)
            }
        });
        TurnOrder.shuffle(enemies);

        // Interleave all creatures
        const bigFaction = enemies.length > characters.length ? enemies : characters;
        const smallFaction = enemies.length > characters.length ? characters : enemies;
        let smallFactionPos = 0;
        for (let i = 0; i < bigFaction.length; i++) {
            this.currentOrder.push(bigFaction[i]);

            // From time to time we add a member of the small faction to the turn order
            if (((smallFactionPos + 1) / smallFaction.length - 1 / (2 * smallFaction.length)) <= ((i + 1) / bigFaction.length)) {
                this.currentOrder.push(smallFaction[smallFactionPos++]);
            }
        }
    }

    private static shuffle(array: Creature[]) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    nextCreature() {
        const creature = this.currentOrder[0];
        this.currentOrder.copyWithin(0, 1);
        this.currentOrder[this.currentOrder.length - 1] = creature;
    }

    removeDeadEnemies() {
        for (let i = 0; i < this.currentOrder.length; i++) {
            const creature = this.currentOrder[i];

            if (creature.life <= 0 && creature.isEnemy()) {
                this.currentOrder.splice(i--, 1);
            }
        }
    }
}
