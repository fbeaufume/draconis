import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {FightComponent} from './fight/fight.component';
import {CharacterComponent} from './fight/character/character.component';
import { EnemyComponent } from './fight/enemy/enemy.component';

@NgModule({
  declarations: [
    AppComponent,
    FightComponent,
    CharacterComponent,
    EnemyComponent
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
