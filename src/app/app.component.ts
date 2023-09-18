import {Component} from '@angular/core';
import {FightService} from './fight/fight.service';
import { RouterOutlet } from '@angular/router';
import { FightComponent } from './fight/fight.component';
import { NgIf } from '@angular/common';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    standalone: true,
    imports: [NgIf, FightComponent, RouterOutlet]
})
export class AppComponent {

  constructor(public fightService: FightService) {
  }
}
