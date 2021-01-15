import {Component, OnInit} from '@angular/core';
import {Party} from './model';
import {FightService} from './fight.service';

@Component({
  selector: 'app-fight',
  templateUrl: './fight.component.html',
  styleUrls: ['./fight.component.css']
})
export class FightComponent implements OnInit {

  constructor(private fightService: FightService) {
  }

  get party(): Party {
    return this.fightService.party;
  }

  ngOnInit(): void {
  }
}
