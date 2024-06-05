import {Component, Input} from '@angular/core';
import {CommonModule} from '@angular/common';
import {LifeChange} from '../../model/life-change.model';

@Component({
  selector: 'app-life-change-popup',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './life-change-popup.component.html'
})
export class LifeChangePopupComponent {

  @Input()
  lifeChange!: LifeChange;

  constructor() {
  }
}
