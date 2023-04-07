import {Component, Input} from '@angular/core';
import {CommonModule} from '@angular/common';
import {LifeChangePopupComponent} from "../life-change-popup/life-change-popup.component";
import {StatusComponent} from "../status/status.component";
import {Enemy} from "../../model/enemy.model";

@Component({
  selector: 'app-enemy',
  standalone: true,
  imports: [CommonModule, LifeChangePopupComponent, StatusComponent],
  templateUrl: './enemy.component.html'
})
export class EnemyComponent {

  @Input()
  enemy!: Enemy;

  constructor() {
  }
}
