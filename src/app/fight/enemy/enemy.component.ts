import {Component, Input} from '@angular/core';
import {Enemy} from "../../model/enemy.model";

@Component({
  selector: 'app-enemy',
  templateUrl: './enemy.component.html'
})
export class EnemyComponent {

  @Input()
  enemy: Enemy;

  constructor() {
  }
}
