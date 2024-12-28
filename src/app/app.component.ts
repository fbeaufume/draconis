import {Component} from '@angular/core';
import {FightService} from './fight/fight.service';
import { FightComponent } from './fight/fight.component';
import { NgIf } from '@angular/common';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    imports: [NgIf, FightComponent]
})
export class AppComponent {

  constructor(public fightService: FightService) {
  }
}
