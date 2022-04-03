import {Component, Input} from '@angular/core';
import {Log} from '../../model/log.model';
import {LogType} from "../../model/common.model";

@Component({
  selector: 'app-log',
  templateUrl: './log.component.html'
})
export class LogComponent {

  // Needed to be able to use the LogType enum in the template
  logType: typeof LogType;

  @Input()
  log: Log;

  constructor() {
    this.logType = LogType;
  }
}
