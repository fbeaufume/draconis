import {AfterViewInit, Component, ElementRef, QueryList, ViewChild, ViewChildren} from '@angular/core';
import {Character, Enemy, FightStep, Opposition, Party, Skill, TurnOrder} from './model';
import {FightService} from './fight.service';
import {Log} from './log.model';

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

  constructor(private fightService: FightService) {
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
    if (this.fightService.fightStep == FightStep.SELECT_SKILL) {
      return skill.name == this.fightService.hoveredSkill?.name ? 'border-gray-400' : 'border-gray-800';
    } else {
      return skill.name == this.fightService.selectedSkill?.name ? 'border-gray-200' : 'border-gray-800';
    }
  }

  get focusedSkill(): Skill | null {
    return this.fightService.focusedSkill;
  }

  enterSkill(skill: Skill) {
    this.fightService.enterSkill(skill);
  }

  leaveSkill() {
    this.fightService.leaveSkill();
  }

  selectSkill(skill: Skill) {
    this.fightService.selectSkill(skill);
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

  get logs(): Log[] {
    return this.fightService.logs;
  }
}
