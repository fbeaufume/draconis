import {Component, Input} from '@angular/core';
import {SkillIconType} from "../../model/common.model";

@Component({
  selector: 'app-skill-icon',
  templateUrl: './skill-icon.component.html'
})
export class SkillIconComponent {

  // Needed to be able to use the SkillIconType enum in the template
  skillIconType: typeof SkillIconType;

  @Input()
  iconType: SkillIconType;

  constructor() {
    this.skillIconType = SkillIconType;
  }
}
