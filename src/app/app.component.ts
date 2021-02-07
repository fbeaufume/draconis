import {Component} from '@angular/core';
import {FightStep} from './model/fight.model';
import {FightService} from './fight/fight.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  constructor(public fightService: FightService) {
  }

  displayStartFightButton(): boolean {
    return this.fightService.fight.step == FightStep.BEFORE_START;
  }

  displayResetFightButton(): boolean {
    return this.fightService.fight.step == FightStep.PARTY_VICTORY;
  }
}
