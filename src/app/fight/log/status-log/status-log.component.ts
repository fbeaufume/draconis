import {Component, Input} from '@angular/core';
import {StatusApplication} from "../../../model/status-application.model";

@Component({
  selector: 'app-status-log',
  templateUrl: './status-log.component.html',
  styleUrls: ['./status-log.component.css']
})
export class StatusLogComponent {

  @Input()
  statusApplication: StatusApplication | null;

  constructor() {
  }
}
