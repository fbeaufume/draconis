import {Component} from '@angular/core';
import {FightService} from './fight/fight.service';
import {FightStep, PartyLocation} from './fight/model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  constructor(private fightService: FightService) {
  }

  displayStartFightButton(): boolean {
    return this.fightService.fightStep == FightStep.BEFORE_START;
  }

  get partyLocation(): PartyLocation {
    return this.fightService.partyLocation;
  }

  startFight() {
    this.fightService.startFight();
  }
}
