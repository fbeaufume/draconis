import {Component, Input} from '@angular/core';
import {Creature} from '../../../model/creature.model';

@Component({
  selector: 'app-creature-log',
  templateUrl: './creature-log.component.html'
})
export class CreatureLogComponent {

  @Input()
  creature: Creature | null;

  constructor() {
  }
}
