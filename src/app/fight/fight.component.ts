import {AfterViewInit, Component, ElementRef, HostListener, QueryList, ViewChild, ViewChildren} from '@angular/core';
import {Fight, Game} from '../model/game.model';
import {Skill} from '../model/skill.model';
import {FightService} from './fight.service';
import {GameState} from "../model/common.model";
import {Constants} from "../model/constants.model";
import {Character} from "../model/character.model";
import {settings} from "../model/settings.model";
import {Enemy} from "../model/enemy.model";

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

  get fight(): Fight {
    return this.fightService.fight;
  }

  get game(): Game {
    return this.fightService.game;
  }

  get oppositionRowCount() {
    return Constants.OPPOSITION_ROWS;
  }

  private scrollLogFrameToBottom(): void {
    this.logFrameElement.scroll({
      top: this.logFrameElement.scrollHeight,
      left: 0,
      behavior: 'smooth'
    });
  }

  getCharacterBorderClass(character: Character): string {
    if (this.game.state == GameState.SELECT_CHARACTER) {
      // Choosing a character

      if (character.name == this.fight.hoveredCharacter?.name) {
        if (this.fight.selectedSkill?.isUsableOn(character, this.fight)) {
          return 'border-gray-200';
        } else {
          return 'border-red-500';
        }
      } else {
        if (this.fight.isActive(character)) {
          return 'border-gray-200';
        } else {
          return 'border-gray-700';
        }
      }
    } else {
      if (this.fight.isActive(character) || this.fight.isTargeted(character)) {
        return 'border-gray-200';
      } else {
        return 'border-gray-700';
      }
    }
  }

  getSkillBorderClass(skill: Skill): string {
    if (Constants.CAN_SELECT_SKILL_STATES.includes(this.game.state)) {
      // Choosing a skill

      if (skill.name == this.fight.hoveredSkill?.name) {
        // Hovering the skill

        if (skill.isSelectableBy(this.fight.activeCreature)) {
          // The skill cost is ok
          return 'border-gray-200';
        } else {
          // The skill is too expensive
          return 'border-red-500';
        }
      } else {
        if (skill.name == this.fight.selectedSkill?.name) {
          // Highlight the previously selected skill
          return 'border-gray-200';
        } else {
          return 'border-gray-800';
        }
      }
    } else {
      // Not choosing a skill

      if (skill.name == this.fight.selectedSkill?.name) {
        // The skill is selected
        return 'border-gray-200';
      } else {
        return 'border-gray-800';
      }
    }
  }

  getEnemyBorderClass(enemy: Enemy): string {
    if (this.game.state == GameState.SELECT_ENEMY) {
      // Choosing an enemy

      if (this.fight.hoveredEnemy != null) {
        // Hovering an enemy

        const targetEnemies: Enemy[] = this.fight.selectedSkill?.getTargetEnemies(this.fight.hoveredEnemy, this.fight) ?? [];

        if (targetEnemies.includes(enemy)) {
          // The current enemy is in the targets

          if (this.fight.selectedSkill?.isUsableOn(enemy, this.fight) ?? false) {
            // The current enemy is a valid target
            return 'border-gray-200';
          } else {
            // The current enemy is not a valid target
            return 'border-red-500';
          }
        } else {
          // The current enemy is not in the targets
          return 'border-gray-800';
        }
      } else {
        // Not hovering an enemy, so no enemy highlight
        return 'border-gray-800';
      }
    } else {
      if (this.fight.isActive(enemy) || this.fight.isTargeted(enemy)) {
        return 'border-gray-200';
      } else {
        return 'border-gray-800';
      }
    }
  }

  /**
   * Use a pointer cursor when in a given game state, or else the default cursor.
   */
  usePointerForStates(states: GameState[]) {
    return states.includes(this.game.state) ? 'cursor-pointer' : 'cursor-default';
  }

  @HostListener('window:keydown', ['$event'])
  processKeyboardShortcut(event: KeyboardEvent) {
    // Check if numeric keypad 1 to 9 (could have been easier with event.keyCode, but it's deprecated)
    const index = ['1', '2', '3', '4', '5', '6', '7', '8', '9'].indexOf(event.key);

    // Process numeric keypad
    if (index >= 0) {
      this.fightService.selectFromKey(index);
      event.preventDefault();
    } else if (event.key == ' ') {
      this.fightService.proceed();
      event.preventDefault();
    } else if (event.key == 'p') {
      settings.togglePauseDuration();
      event.preventDefault();
    }
  }
}
