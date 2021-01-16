import {Injectable} from '@angular/core';
import {Character, Enemy, Group, Party} from './model';

@Injectable({
  providedIn: 'root'
})
export class FightService {

  party: Party = new Party([
      new Character('Melkan', 'Warrior', 1, 20, false, 50),
      new Character('Cyl', 'Rogue', 1, 20, false, 50),
      new Character('Arwin', 'Paladin', 1, 20, true, 50)],
    [
      new Character('Faren', 'Archer', 1, 20, false, 50),
      new Character('Harika', 'Mage', 1, 20, true, 50),
      new Character('Nairo', 'Priest', 1, 20, true, 50)
    ]);

  group: Group = new Group([
    new Enemy('Bear A', 28),
    new Enemy('Bear B', 28)
  ], [], []);

  constructor() {
  }
}
