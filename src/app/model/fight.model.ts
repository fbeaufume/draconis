// Fight related classes

import {Character, Creature, EndOfRound, OPPOSITION_ROWS, Party, PARTY_ROWS, PARTY_SIZE} from './misc.model';
import {blast, heal, magicDefend, magicStrike, shot, Skill, smash, spark, techDefend, techStrike} from './skill.model';
import {DragonEnemy, Enemy, MeleeEnemy, Opposition} from './enemy.model';

/**
 * The current step in the fight workflow.
 * Used to enable of disable the selection of a target skill, enemy or character.
 * When some numeric values are changed, update accordingly the call to 'usePointerForStep' in fight.component.html.
 */
export enum FightStep {
    // Before the fight starts (displays the "Start fight" button)
    BEFORE_START,
    // Between creature turns
    END_OF_TURN,
    // Enemy turn
    ENEMY_TURN,
    // Character turn, the player must select a skill
    SELECT_SKILL,
    // Character turn, the player must select an enemy (for example as the target of an attack or debuff)
    SELECT_ENEMY,
    // Character turn, the player must select a character (for example as the target of a heal or buff)
    SELECT_CHARACTER,
    // Executing the player skill
    EXECUTING_SKILL,
    PARTY_VICTORY,
}

/**
 * The action order of characters and enemies during a turn.
 */
export class TurnOrder {
    // Turn order with active (e.g. living) living creatures
    currentOrder: Creature[] = [];

    constructor(
        party: Party,
        opposition: Opposition) {
        this.initialize(party, opposition);

        // Add a special creature to mark the end of round
        this.currentOrder.push(new EndOfRound());
    }

    /**
     * Build a good order of characters and enemies:
     * - Good interleave of characters and monsters
     * - Party healers must not evenly distributed
     */
    initialize(party: Party, opposition: Opposition) {
        // Shuffle the party damage dealers
        const partyDealers: Character[] = [];
        for (let i = 0; i < PARTY_ROWS; i++) {
            for (let j = 0; j < 2; j++) {
                partyDealers.push(party.rows[i].characters[j]);
            }
        }
        TurnOrder.shuffle(partyDealers);

        // Shuffle the party healers
        const partyHealers: Character[] = [];
        for (let i = 0; i < PARTY_ROWS; i++) {
            partyHealers.push(party.rows[i].characters[2]);
        }
        TurnOrder.shuffle(partyHealers);

        // Aggregate all party characters
        const characters: Character[] = [partyDealers[0], partyDealers[1], partyHealers[0], partyDealers[2], partyDealers[3], partyHealers[1]];

        // Shuffle the enemies
        const enemies: Enemy[] = [];
        //
        for (let i = 0; i < OPPOSITION_ROWS; i++) { // Iterate over rows
            for (let j = 0; j < opposition.rows[i].enemies.length; j++) { // Iterate over creatures
                for (let k = 0; k < opposition.rows[i].enemies[j].actions; k++) { // Iterate over actions
                    enemies.push(opposition.rows[i].enemies[j]);
                }
            }
        }
        TurnOrder.shuffle(enemies);

        // Interleave all creatures
        const bigFaction = enemies.length > PARTY_SIZE ? enemies : characters;
        const smallFaction = enemies.length > PARTY_SIZE ? characters : enemies;
        let smallFactionPos = 0;
        for (let i = 0; i < bigFaction.length; i++) {
            this.currentOrder.push(bigFaction[i]);

            // From time to time we add a member of the small faction to the turn order
            if (((smallFactionPos + 1) / smallFaction.length) <= ((i + 1) / bigFaction.length)) {
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

            if (creature.life <= 0 && creature instanceof Enemy) {
                this.currentOrder.splice(i, 1);
            }
        }
    }
}

/**
 * All things related to a fight: party, opposition, active character, target enemy, etc.
 */
export class Fight {

    step: FightStep = FightStep.BEFORE_START;

    round: number = 0;

    party: Party = new Party([], []);

    opposition: Opposition = new Opposition([], [], []);

    turnOrder: TurnOrder;

    // The currently active character or enemy
    activeCreature: Creature | null;

    // The character under the mouse pointer during the selection of a character
    hoveredCharacter: Character | null;

    // The skill currently under the mouse pointer during the selection of a skill
    hoveredSkill: Skill | null;

    // The skill currently displayed in the focus skill panel
    focusedSkill: Skill | null;

    // Skill selected by the player
    selectedSkill: Skill | null;

    // The enemy under the mouse pointer during the selection of an enemy
    hoveredEnemy: Enemy | null;

    // The creatures targeted by the chosen skill of the active character or enemy
    targetCreatures: Creature[] = [];

    initialize() {
        this.step = FightStep.BEFORE_START;
        this.round = 1;

        this.party = new Party([
                new Character('Cyl', 'Rogue', 1, 20, false, 50, 10, [
                    techDefend, techStrike
                ]),
                new Character('Melkan', 'Warrior', 1, 20, false, 50, 10, [
                    techDefend, techStrike, smash
                ]),
                new Character('Arwin', 'Paladin', 1, 20, true, 50, 10, [
                    magicDefend, magicStrike, heal
                ])],
            [
                new Character('Faren', 'Archer', 1, 20, false, 50, 10, [
                    techDefend, shot
                ]),
                new Character('Harika', 'Mage', 1, 20, true, 50, 10, [
                    magicDefend, blast
                ]),
                new Character('Nairo', 'Priest', 1, 20, true, 50, 10, [
                    magicDefend, spark, heal
                ])
            ]);

        // Sample oppositions
        const oppositions: Opposition[] = [
            new Opposition([
                new MeleeEnemy('Bear A', 38, 8),
                new MeleeEnemy('Bear B', 38, 8),
            ], [], []),
            new Opposition([
                new MeleeEnemy('Wolf A', 24, 6),
                new MeleeEnemy('Wolf B', 24, 6),
            ], [
                new MeleeEnemy('Wolf C', 24, 6),
                new MeleeEnemy('Wolf D', 24, 6),
                new MeleeEnemy('Wolf E', 24, 6),
            ], [
                new MeleeEnemy('Wolf F', 24, 6),
            ]),
            new Opposition([
                new DragonEnemy('Green Dragon', 80, 12, 2),
            ], [], []),
        ];

        this.opposition = oppositions[2];
        this.updateEnemies();

        this.activeCreature = null;
        this.hoveredSkill = null;
        this.focusedSkill = null;
        this.selectedSkill = null;
        this.hoveredEnemy = null;
        this.targetCreatures = [];

        this.turnOrder = new TurnOrder(this.party, this.opposition);
    }

    /**
     * Give each enemy some information about the fight.
     * Used for example to: check skills range, advance toward characters, etc.
     */
    private updateEnemies() {
        for (let i = 0; i < this.opposition.rows.length; i++) {
            const row = this.opposition.rows[i];
            row.enemies.forEach(enemy => {
                enemy.distance = i + 1;
            });
        }
    }

    /**
     * Is the creature active.
     */
    isActive(creature: Creature): boolean {
        return creature === this.activeCreature;
    }

    /**
     * Is the creature in the target list.
     */
    isTargeted(creature: Creature): boolean {
        for (const tempCreature of this.targetCreatures) {
            if (creature === tempCreature) {
                return true;
            }
        }
        return false;
    }
}
