import {Component, Input} from '@angular/core';
import {LogItemType} from '../../../model/common.model';
import {Creature} from '../../../model/creature.model';
import {Skill} from '../../../model/skill.model';
import {LifeChange} from '../../../model/life-change.model';
import {StatusApplication} from '../../../model/status-application.model';

/**
 * This component is used to display on item within a log entry (such as a creature name, a skill name,
 * a life change amount, etc.) with the right formatting.
 */
@Component({
  selector: 'app-log-item',
  templateUrl: './log-item.component.html'
})
export class LogItemComponent {

  // Needed to be able to use the enum type in the template
  logItemType: typeof LogItemType = LogItemType;

  @Input()
  item: any;

  constructor() {
  }

  getLogItemType(): LogItemType {
    if (this.item instanceof Creature) {
      return LogItemType.CREATURE;
    } else if (this.item instanceof Skill) {
      return LogItemType.SKILL;
    } else if (this.item instanceof LifeChange) {
      return LogItemType.LIFE_CHANGE;
    } else if (this.item instanceof StatusApplication) {
      return LogItemType.STATUS_APPLICATION;
    } else {
      return LogItemType.OTHER;
    }
  }
}
