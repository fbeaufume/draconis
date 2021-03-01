import {Component, Input} from '@angular/core';
import {Status} from '../../model/creature.model';

@Component({
  selector: 'app-status',
  templateUrl: './status.component.html',
  styleUrls: ['./status.component.css']
})
export class StatusComponent {

  @Input()
  status: Status;

  constructor() {
  }
}
