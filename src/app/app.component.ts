import { Component } from '@angular/core';
import {FightService} from './fight/fight.service';
import {Group, PartyLocation} from './fight/model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  constructor(private fightService: FightService) {
  }

  get partyLocation(): PartyLocation {
    return this.fightService.partyLocation;
  }
}
