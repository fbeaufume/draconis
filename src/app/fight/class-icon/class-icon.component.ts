import {Component, Input} from '@angular/core';
import {Creature} from '../../model/creature.model';

@Component({
  selector: 'app-class-icon',
  templateUrl: './class-icon.component.html',
  styleUrls: ['./class-icon.component.css']
})
export class ClassIconComponent {

  @Input()
  creature: Creature;

  constructor() {
  }
}
