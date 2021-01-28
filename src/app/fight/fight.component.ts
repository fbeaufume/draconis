import {Component} from '@angular/core';
import {Character, Enemy, FightStep, Opposition, Party, Skill, TurnOrder} from './model';
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

  get targetCharacter(): Character | null {
    return this.fightService.targetCharacter;
  }

  getCharacterBorderClass(character: Character): string {
    return character.name == this.fightService.activeCharacter?.name || character.name == this.fightService.targetCharacter?.name ?
      'border-gray-200' : 'border-gray-700';
  }

  getSkillBorderClass(skill: Skill): string {
    return skill.name == this.fightService.selectedSkill?.name ? 'border-gray-200' : 'border-gray-800';
  }

  selectSkill(skill: Skill) {
    this.fightService.selectSkill(skill);
  }

  get focusedSkill(): Skill | null {
    return this.fightService.focusedSkill;
  }

  focusSkill(skill: Skill) {
    this.fightService.focusSkill(skill);
  }

  getEnemyBorderClass(enemy: Enemy): string {
    return enemy.name == this.fightService.activeEnemy?.name || enemy.name == this.fightService.targetEnemy?.name ?
      'border-yellow-200' : 'border-gray-800';
  }

  selectEnemy(enemy: Enemy) {
    this.fightService.selectEnemy(enemy);
  }

  /**
   * Use a pointer cursor when in a given fight step, or else the default cursor.
   */
  usePointerForStep(fightStep: FightStep) {
    return this.fightService.fightStep == fightStep ? 'cursor-pointer' : 'cursor-default';
  }
}
