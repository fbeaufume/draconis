import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {FightComponent} from './fight/fight.component';
import {CharacterComponent} from './fight/character/character.component';
import {EnemyComponent} from './fight/enemy/enemy.component';
import {LogComponent} from './fight/log/log.component';

@NgModule({
  declarations: [
    AppComponent,
    FightComponent,
    CharacterComponent,
    EnemyComponent,
    LogComponent
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
