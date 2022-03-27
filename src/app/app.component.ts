import {Component} from '@angular/core';
import {FightService} from './fight/fight.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent {

  constructor(public fightService: FightService) {
  }
}
