import {Component} from '@angular/core';
import {FightService} from '../fight.service';
import {Log} from '../log.model';

@Component({
  selector: 'app-logs',
  templateUrl: './logs.component.html',
  styleUrls: ['./logs.component.css']
})
export class LogsComponent {

  constructor(private fightService: FightService) {
  }

  get logs(): Log[] {
    return this.fightService.logs;
  }
}
