import {Component} from '@angular/core';
import {FightService} from './fight/fight.service';
import {GameState} from './model/game.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  constructor(public fightService: FightService) {
  }

  displayStartEncounterButton(): boolean {
    return this.fightService.game.state == GameState.DUNGEON_START;
  }

  displayStartFightButton(): boolean {
    return this.fightService.game.state == GameState.FIGHT_START;
  }
}
