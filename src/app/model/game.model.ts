import {GameState, MessageType} from './common.model';
import {Party, StandardParty} from './party.model';
import {settings} from './settings.model';
import {Opposition} from './opposition.model';
import {Dungeon, FangForestDungeon, ForgottenGraveyardDungeon, MageTowerDungeon, TestDungeon} from './dungeon.model';
import {Fight} from './fight.model';
import {messages} from './message.model';

// Classes for the whole game and fights

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

  dungeons: Dungeon[] = [
    new TestDungeon(),
    new FangForestDungeon(),
    new ForgottenGraveyardDungeon(),
    new MageTowerDungeon()];
  dungeon: Dungeon = this.dungeons[settings.dungeon] || this.dungeons[1] || this.dungeons[0];

  fight: Fight = new Fight(this.party, new Opposition('', true));

  constructor() {
    this.region = this.dungeon.name;

    messages.clear();
    messages.addParameterizedMessage(MessageType.ENTER_ZONE, this.region);
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
