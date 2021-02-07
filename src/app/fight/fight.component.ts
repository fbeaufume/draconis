import {AfterViewInit, Component, ElementRef, QueryList, ViewChild, ViewChildren} from '@angular/core';
import {Character} from '../model/misc.model';
import {Skill} from '../model/skill.model';
import {Enemy} from '../model/enemy.model';
import {FightStep} from '../model/fight.model';
import {FightService} from './fight.service';

@Component({
  selector: 'app-fight',
  templateUrl: './fight.component.html',
  styleUrls: ['./fight.component.css']
})
export class FightComponent implements AfterViewInit {

  // These are used to scroll the log panels to the bottom when a log is added,
  // inspired by https://pumpingco.de/blog/automatic-scrolling-only-if-a-user-already-scrolled-the-bottom-of-a-page-in-angular/
  @ViewChild('logFrame', {static: false}) logFrameElementRef: ElementRef;
  @ViewChildren('log') logItemElements: QueryList<any>;
  private logFrameElement: any;

  constructor(public fightService: FightService) {
  }

  ngAfterViewInit(): void {
    this.logFrameElement = this.logFrameElementRef.nativeElement;
    this.logItemElements.changes.subscribe(_ => this.scrollLogFrameToBottom());
  }

  private scrollLogFrameToBottom(): void {
    this.logFrameElement.scroll({
      top: this.logFrameElement.scrollHeight,
      left: 0,
      behavior: 'smooth'
    });
  }

  getCharacterBorderClass(character: Character): string {
    if (this.fightService.fight.step == FightStep.SELECT_CHARACTER) {
      return character.name == this.fightService.fight.hoveredCharacter?.name || character.name == this.fightService.fight.activeCharacter?.name ?
        'border-gray-200' : 'border-gray-700';
    } else {
      return character.name == this.fightService.fight.activeCharacter?.name || character.name == this.fightService.fight.targetCharacter?.name ?
        'border-gray-200' : 'border-gray-700';
    }
  }

  getSkillBorderClass(skill: Skill): string {
    if (this.fightService.fight.step == FightStep.SELECT_SKILL) {
      // Choosing a skill

      if (skill.name == this.fightService.fight.hoveredSkill?.name) {
        // The skill is hovered

        if (skill.cost > (this.fightService.fight.activeCharacter?.energy ?? 0)) {
          // The skill is too expensive
          return 'border-red-500';
        } else {
          // The skill cost is ok
          return 'border-gray-200';
        }
      } else {
        return 'border-gray-800';
      }
    } else {
      // Not choosing a skill

      if (skill.name == this.fightService.fight.selectedSkill?.name) {
        // The skill is selected
        return 'border-gray-200';
      } else {
        return 'border-gray-800';
      }
    }
  }

  getEnemyBorderClass(enemy: Enemy): string {
    if (this.fightService.fight.step == FightStep.SELECT_ENEMY) {
      return enemy.name == this.fightService.fight.hoveredEnemy?.name ? 'border-yellow-200' : 'border-gray-800';
    } else {
      return enemy.name == this.fightService.fight.activeEnemy?.name || enemy.name == this.fightService.fight.targetEnemy?.name ?
        'border-yellow-200' : 'border-gray-800';
    }
  }

  /**
   * Use a pointer cursor when in a given fight step, or else the default cursor.
   */
  usePointerForStep(fightStep: FightStep) {
    return this.fightService.fight.step == fightStep ? 'cursor-pointer' : 'cursor-default';
  }
}
