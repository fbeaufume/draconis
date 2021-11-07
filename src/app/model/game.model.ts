// Classes for the whole game and fights

import {GameState} from "./common.model";
import {Party, StandardParty} from "./party.model";
import {settings} from "./settings.model";
import {Opposition} from "./opposition.model";
import {Dungeon, FangForestDungeon, ForgottenGraveyardDungeon, TestDungeon} from "./dungeon.model";
import {Fight} from "./fight.model";

/**
 * Main model class. Contains the party, the dungeons, the current fight, etc.
 */
export class Game {

  state: GameState = GameState.START_NEXT_ENCOUNTER;

  region: string = '';

  // Zero when not fighting, otherwise one-based identifier of the opposition in the dungeon
  oppositionId: number = settings.fight - 1;

  // Zero when not fighting, increases when starting a fight, used to display the proper game proceed message
  oppositionCount: number = 0;

  party: Party = new StandardParty();

  dungeons: Dungeon[] = [new TestDungeon(), new FangForestDungeon(), new ForgottenGraveyardDungeon()];
  dungeon: Dungeon = this.dungeons[settings.dungeon] || this.dungeons[1] || this.dungeons[0];

  fight: Fight = new Fight(this.party, new Opposition(''));

  constructor() {
    this.region = this.dungeon.name;
  }

  get opposition(): Opposition {
    return this.fight.opposition;
  }

  hasNextEncounter(): boolean {
    return this.oppositionId < this.dungeon.oppositions.length;
  }

  startNextEncounter() {
    this.state = GameState.START_FIGHT;

    this.oppositionId++;

    this.oppositionCount++;

    this.party.forEachCharacter(c => c.clearStatusApplications());
    this.party.restoreTechPoints();

    this.fight = new Fight(this.party, this.dungeon.oppositions[this.oppositionId - 1]);
  }
}
