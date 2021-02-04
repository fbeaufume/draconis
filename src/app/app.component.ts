import {Component} from '@angular/core';
import {FightService} from './fight/fight.service';
import {FightStep} from './fight/model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  constructor(public fightService: FightService) {
  }

  displayStartFightButton(): boolean {
    return this.fightService.fightStep == FightStep.BEFORE_START;
  }

  displayResetFightButton(): boolean {
    return this.fightService.fightStep == FightStep.PARTY_VICTORY;
  }
}
