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
}
