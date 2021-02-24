import {Component, Input} from '@angular/core';
import {Skill} from '../../model/skill.model';

@Component({
  selector: 'app-skill-icon',
  templateUrl: './skill-icon.component.html',
  styleUrls: ['./skill-icon.component.css']
})
export class SkillIconComponent {

  @Input()
  skill: Skill;

  constructor() {
  }
}
