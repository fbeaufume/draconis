import {Component, Input} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Character} from '../../model/character.model';
import {LifeChangePopupComponent} from '../life-change-popup/life-change-popup.component';
import {StatusComponent} from '../status/status.component';
import {ClassIconComponent} from '../class-icon/class-icon.component';

@Component({
    selector: 'app-character',
    imports: [CommonModule, LifeChangePopupComponent, StatusComponent, ClassIconComponent],
    templateUrl: './character.component.html'
})
export class CharacterComponent {

  @Input()
  character!: Character;

  constructor() {
  }
}
