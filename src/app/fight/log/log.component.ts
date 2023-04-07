import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import {LogType} from "../../model/common.model";
import {Log} from "../../model/log.model";
import {LogItemComponent} from "./log-item/log-item.component";

@Component({
  selector: 'app-log',
  standalone: true,
  imports: [CommonModule, LogItemComponent],
  templateUrl: './log.component.html'
})
export class LogComponent {

  // Needed to be able to use the enum type in the template
  logType: typeof LogType = LogType;

  @Input()
  log!: Log;

  constructor() {
  }
}
