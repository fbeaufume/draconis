import {Component, Input} from '@angular/core';
import {LifeChange} from "../../../model/life-change.model";

@Component({
  selector: 'app-life-change-log',
  templateUrl: './life-change-log.component.html'
})
export class LifeChangeLogComponent {

  @Input()
  lifeChange: LifeChange | null;

  constructor() {
  }
}
