import {Component, Input} from '@angular/core';
import {StatusApplication} from '../../model/status-application.model';
import {StatusTypeName} from '../../model/status-type.model';

@Component({
  selector: 'app-status',
  templateUrl: './status.component.html'
})
export class StatusComponent {

  // Needed to be able to use the enum type in the template
  statusTypeName: typeof StatusTypeName;

  @Input()
  statusApplication: StatusApplication;

  constructor() {
    this.statusTypeName = StatusTypeName;
  }

  /**
   * Angular ngFor does not know how to iterate over a number, so we give it an array.
   */
  getDurationArray(): any[] {
    return new Array(this.statusApplication.remainingDuration);
  }
}
