import {Component, Input} from '@angular/core';
import {Log} from '../../model/log.model';

@Component({
  selector: 'app-log',
  templateUrl: './log.component.html'
})
export class LogComponent {

  @Input()
  log: Log;

  constructor() {
  }
}
