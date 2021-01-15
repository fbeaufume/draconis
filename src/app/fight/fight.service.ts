import {Injectable} from '@angular/core';
import {Character, Party} from './model';

@Injectable({
  providedIn: 'root'
})
export class FightService {

  test = 'hello';

  party: Party = new Party([
      new Character('Melkan', 'Warrior', 1, 20, false, 50),
      new Character('Cyl', 'Rogue', 1, 20, false, 50),
      new Character('Arwin', 'Paladin', 1, 20, true, 50)],
    [
      new Character('Faren', 'Archer', 1, 20, false, 50),
      new Character('Harika', 'Sorceress', 1, 20, true, 50),
      new Character('Nairo', 'Priest', 1, 20, true, 50)
    ]);

  // TODO FBE find a way to use this syntax without the redundant attributes (life, lifePercent, bonuses, etc)
  party2: Party = {
    row1Characters: [
      {
        name: 'Melkan',
        clazz: '',
        level: 1,
        life: 20,
        lifeMax: 20,
        lifePercent: 1,
        useMana: false,
        energy: 50,
        energyMax: 50,
        energyPercent: 1,
        bonuses: [],
        maluses: []
      }
    ],
    row2Characters: []
  };

  constructor() {
  }
}
