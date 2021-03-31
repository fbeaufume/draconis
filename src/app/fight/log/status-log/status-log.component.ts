import {Component, Input} from '@angular/core';
import {Status} from "../../../model/creature.model";

@Component({
  selector: 'app-status-log',
  templateUrl: './status-log.component.html',
  styleUrls: ['./status-log.component.css']
})
export class StatusLogComponent {

  @Input()
  status: Status | null;

  constructor() {
  }
}
