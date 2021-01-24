import {Component} from '@angular/core';
import {Character, Enemy, Opposition, Party, Skill, TurnOrder} from './model';
import {FightService} from './fight.service';

@Component({
  selector: 'app-fight',
  templateUrl: './fight.component.html',
  styleUrls: ['./fight.component.css']
})
export class FightComponent {

  constructor(private fightService: FightService) {
  }

  get opposition(): Opposition {
    return this.fightService.opposition;
  }

  get party(): Party {
    return this.fightService.party;
  }

  get turnOrder(): TurnOrder {
    return this.fightService.turnOrder;
  }

  get activeCharacter(): Character | null {
    return this.fightService.activeCharacter;
  }

  isSelectedSkill(skill: Skill): boolean {
    return skill.name == this.fightService.selectedSkill?.name;
  }

  selectSkill(skill: Skill) {
    this.fightService.selectSkill(skill);
  }

  isSelectedEnemy(enemy: Enemy): boolean {
    return enemy.name == this.fightService.activeEnemy?.name || enemy.name == this.fightService.selectedEnemy?.name;
  }

  selectEnemy(enemy: Enemy) {
    this.fightService.selectEnemy(enemy);
  }
}
