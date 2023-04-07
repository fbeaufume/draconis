import {Component, Input} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SkillIconType} from "../../model/common.model";

@Component({
  selector: 'app-skill-icon',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './skill-icon.component.html'
})
export class SkillIconComponent {

  // Needed to be able to use the enum type in the template
  skillIconType: typeof SkillIconType = SkillIconType;

  @Input()
  iconType!: SkillIconType;

  constructor() {
  }
}
