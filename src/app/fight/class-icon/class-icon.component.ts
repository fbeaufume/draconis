import {Component, Input} from '@angular/core';
import {Creature} from '../../model/creature.model';
import {CreatureClass} from "../../model/common.model";

@Component({
  selector: 'app-class-icon',
  templateUrl: './class-icon.component.html'
})
export class ClassIconComponent {

  // Needed to be able to use the enum type in the template
  creatureClass: typeof CreatureClass = CreatureClass;

  @Input()
  creature: Creature;

  constructor() {
  }
}
