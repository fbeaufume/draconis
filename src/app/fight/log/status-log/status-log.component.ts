import {Component, Input} from '@angular/core';
import {StatusApplication} from "../../../model/status-application.model";

/**
 * This component is used to display one log entry in the logs panel.
 */
@Component({
  selector: 'app-status-log',
  templateUrl: './status-log.component.html'
})
export class StatusLogComponent {

  @Input()
  statusApplication: StatusApplication | null;

  constructor() {
  }
}
