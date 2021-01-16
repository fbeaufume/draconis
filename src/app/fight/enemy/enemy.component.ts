import {Component, Input} from '@angular/core';
import {Enemy} from '../model';

@Component({
  selector: 'app-enemy',
  templateUrl: './enemy.component.html',
  styleUrls: ['./enemy.component.css']
})
export class EnemyComponent {

  @Input()
  enemy: Enemy;

  constructor() {
  }
}
