import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {FightComponent} from './fight/fight.component';
import {CharacterComponent} from './fight/character/character.component';
import {EnemyComponent} from './fight/enemy/enemy.component';
import {LogComponent} from './fight/log/log.component';
import {SkillIconComponent} from './fight/skill-icon/skill-icon.component';
import {StatusComponent} from './fight/status/status.component';
import {ClassIconComponent} from './fight/class-icon/class-icon.component';

@NgModule({
  declarations: [
    AppComponent,
    FightComponent,
    CharacterComponent,
    EnemyComponent,
    LogComponent,
    SkillIconComponent,
    StatusComponent,
    ClassIconComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
