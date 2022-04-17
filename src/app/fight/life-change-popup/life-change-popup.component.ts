import {Component, Input} from '@angular/core';
import {LifeChange} from '../../model/life-change.model';

@Component({
  selector: 'app-life-change-popup',
  templateUrl: './life-change-popup.component.html'
})
export class LifeChangePopupComponent {

  @Input()
  lifeChange: LifeChange;

  constructor() {
  }
}
