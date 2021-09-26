import {Component, Input} from '@angular/core';
import {StatusApplication} from "../../model/status-application.model";

@Component({
  selector: 'app-status',
  templateUrl: './status.component.html',
  styleUrls: ['./status.component.css']
})
export class StatusComponent {

  @Input()
  statusApplication: StatusApplication;

  constructor() {
  }

  /**
   * Angular ngFor does not know how to iterate over a number, so we give it an array.
   */
  getDurationArray(): any[] {
    return new Array(this.statusApplication.remainingDuration);
  }
}
