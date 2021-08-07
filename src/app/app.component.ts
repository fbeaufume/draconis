import {Component} from '@angular/core';
import {FightService} from './fight/fight.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  constructor(public fightService: FightService) {
  }
}
