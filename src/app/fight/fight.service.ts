import {Injectable} from '@angular/core';
import {Character, Enemy, Group, Party, PartyLocation, Skill, TurnOrder} from './model';

@Injectable({
  providedIn: 'root'
})
export class FightService {

  partyLocation: PartyLocation = new PartyLocation('Goblin Camp', 'Inner Camp', 'Fight 1');

  party: Party = new Party([
      new Character('Cyl', 'Rogue', 1, 20, false, 50,[
        new Skill("Attack", 0, 1, 0, "Basic attack, does 100% WD"),
        new Skill("Defend", 0, 1, 0, "Reduce taken damage by 30% until next turn"),
        new Skill("Venom", 15, 1, 0, "Hits the target for 100% damage and inflicts 60% poison damage over 3 turns"),
        new Skill("Vanish", 10, 0, 4, "Disappear and become immune to attacks"),
        new Skill("Back Stab", 10, 1, 0, "Hits the target for 180% damage")
      ]),
      new Character('Melkan', 'Warrior', 1, 20, false, 50,[
        new Skill("Attack", 0, 1, 0, "Basic attack, does 100% WD")
      ]),
      new Character('Arwin', 'Paladin', 1, 20, true, 50, [
        new Skill("Attack", 0, 1, 0, "Basic attack, does 100% WD")
      ])],
    [
      new Character('Faren', 'Archer', 1, 20, false, 50, [
        new Skill("Attack", 0, 2, 0, "Basic attack, does 100% WD")
      ]),
      new Character('Harika', 'Mage', 1, 20, true, 50, [
        new Skill("Attack", 0, 2, 0, "Basic attack, does 100% WD")
      ]),
      new Character('Nairo', 'Priest', 1, 20, true, 50, [
        new Skill("Attack", 0, 2, 0, "Basic attack, does 100% WD")
      ])
    ]);

  group: Group = new Group([
    new Enemy('Bear A', 28),
    new Enemy('Bear B', 28)
  ], [], []);

  turnOrder: TurnOrder = new TurnOrder(this.party, this.group);

  currentActiveCharacter: Character = this.party.row1Characters[0];

  constructor() {
  }
}
