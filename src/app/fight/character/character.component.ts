import {Component, Input} from '@angular/core';
import {Character} from '../../model/creature.model';

@Component({
  selector: 'app-character',
  templateUrl: './character.component.html',
  styleUrls: ['./character.component.css']
})
export class CharacterComponent {

  @Input()
  character: Character;

  constructor() {
  }
}
