import {Component, Input} from '@angular/core';
import {Log} from '../log.model';
import {Enemy} from '../model';

@Component({
  selector: 'app-log',
  templateUrl: './log.component.html',
  styleUrls: ['./log.component.css']
})
export class LogComponent {

  @Input()
  log: Log;

  constructor() {
  }

  /**
   * Return the class used to display a creature name.
   */
  getClassForCreature(object: any): string {
    return object instanceof Enemy ? 'text-yellow-200' : 'text-gray-200';
  }
}
