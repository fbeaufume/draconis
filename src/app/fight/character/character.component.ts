import {Component, Input} from '@angular/core';
import {Character} from '../../model/character.model';

@Component({
  selector: 'app-character',
  templateUrl: './character.component.html'
})
export class CharacterComponent {

  @Input()
  character: Character;

  constructor() {
  }
}
