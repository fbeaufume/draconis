import {Component} from '@angular/core';
import {Group, Party} from './model';
import {FightService} from './fight.service';

@Component({
  selector: 'app-fight',
  templateUrl: './fight.component.html',
  styleUrls: ['./fight.component.css']
})
export class FightComponent {

  constructor(private fightService: FightService) {
  }

  get group(): Group {
    return this.fightService.group;
  }

  get party(): Party {
    return this.fightService.party;
  }
}
