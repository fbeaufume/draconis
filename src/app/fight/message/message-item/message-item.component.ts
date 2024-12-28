import {Component, Input} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MessageItemType} from '../../../model/common.model';
import {Creature} from '../../../model/creature.model';
import {Skill} from '../../../model/skill.model';
import {LifeChange} from '../../../model/life-change.model';
import {StatusApplication} from '../../../model/status-application.model';

/**
 * This component is used to display an item within a message entry (such as a creature name, a skill name,
 * a life change amount, etc.) with the right formatting.
 */
@Component({
    selector: 'app-message-item',
    imports: [CommonModule],
    templateUrl: './message-item.component.html'
})
export class MessageItemComponent {

  // Needed to be able to use the enum type in the template
  messageItemType: typeof MessageItemType = MessageItemType;

  @Input()
  item: any;

  constructor() {
  }

  getMessageItemType(): MessageItemType {
    if (this.item instanceof Creature) {
      return MessageItemType.CREATURE;
    } else if (this.item instanceof Skill) {
      return MessageItemType.SKILL;
    } else if (this.item instanceof LifeChange) {
      return MessageItemType.LIFE_CHANGE;
    } else if (this.item instanceof StatusApplication) {
      return MessageItemType.STATUS_APPLICATION;
    } else {
      return MessageItemType.OTHER;
    }
  }
}
