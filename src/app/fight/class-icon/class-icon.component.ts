import {Component, Input} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CreatureClass} from "../../model/common.model";
import {Creature} from "../../model/creature.model";

@Component({
  selector: 'app-class-icon',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './class-icon.component.html'
})
export class ClassIconComponent {

  // Needed to be able to use the enum type in the template
  creatureClass: typeof CreatureClass = CreatureClass;

  @Input()
  creature!: Creature;

  constructor() {
  }
}
