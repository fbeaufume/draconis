import {Component, Input} from '@angular/core';
import {LifeChange} from '../../model/creature.model';

@Component({
  selector: 'app-life-change-popup',
  templateUrl: './life-change-popup.component.html',
  styleUrls: ['./life-change-popup.component.css']
})
export class LifeChangePopupComponent {

  @Input()
  lifeChange: LifeChange;

  constructor() {
  }
}
