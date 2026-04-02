import {Component} from '@angular/core';
import {FightService} from './fight/fight.service';
import { FightComponent } from './fight/fight.component';


@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    imports: [FightComponent]
})
export class AppComponent {

  constructor(public fightService: FightService) {
  }
}
