import {Component, Input} from '@angular/core';
import {SkillIconType} from "../../model/common.model";

@Component({
  selector: 'app-skill-icon',
  templateUrl: './skill-icon.component.html',
  styleUrls: ['./skill-icon.component.css']
})
export class SkillIconComponent {

  @Input()
  iconType: SkillIconType;

  constructor() {
  }
}
