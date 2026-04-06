import {Component, Input} from '@angular/core';
import {CommonModule} from '@angular/common';
import {StatusTypeName} from '../../model/status-type.model';
import {StatusApplication} from '../../model/status-application.model';

@Component({
    selector: 'app-status',
    imports: [CommonModule],
    templateUrl: './status.component.html'
})
export class StatusComponent {

  // Needed to be able to use the enum type in the template
  statusTypeName: typeof StatusTypeName = StatusTypeName;

  @Input()
  statusApplication!: StatusApplication;

  constructor() {
  }

  /**
   * Angular @for does not know how to iterate over a number,
   * so we give it an array containing the consecutive values, i.e. instead of 3, return [0, 1, 2].
   */
  getDurationArray(): number[] {
    return Array.from({length: this.statusApplication.remainingDuration}, (_, i) => i);
  }
}
