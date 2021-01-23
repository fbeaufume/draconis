import {Injectable} from '@angular/core';
import {Character, Creature, Enemy, Opposition, Party, PartyLocation, Skill, TurnOrder} from './model';
import {Log, LogType} from './log.model';

@Injectable({
  providedIn: 'root'
})
export class FightService {

  partyLocation: PartyLocation = new PartyLocation('Goblin Camp', 'Inner Camp', 'Fight 1');

  party: Party = new Party([
      new Character('Cyl', 'Rogue', 1, 20, false, 50, [
        new Skill('Attack', 0, 1, 0, 'Basic attack, does 100% WD'),
        new Skill('Defend', 0, 1, 0, 'Reduce taken damage by 30% until next turn'),
        new Skill('Venom', 15, 1, 0, 'Hits the target for 100% damage and inflicts 60% poison damage over 3 turns'),
        new Skill('Vanish', 10, 0, 4, 'Disappear and become immune to attacks'),
        new Skill('Back Stab', 10, 1, 0, 'Hits the target for 180% damage')
      ]),
      new Character('Melkan', 'Warrior', 1, 20, false, 50, [
        new Skill('Attack', 0, 1, 0, 'Basic attack, does 100% WD')
      ]),
      new Character('Arwin', 'Paladin', 1, 20, true, 50, [
        new Skill('Attack', 0, 1, 0, 'Basic attack, does 100% WD')
      ])],
    [
      new Character('Faren', 'Archer', 1, 20, false, 50, [
        new Skill('Attack', 0, 2, 0, 'Basic attack, does 100% WD')
      ]),
      new Character('Harika', 'Mage', 1, 20, true, 50, [
        new Skill('Attack', 0, 2, 0, 'Basic attack, does 100% WD')
      ]),
      new Character('Nairo', 'Priest', 1, 20, true, 50, [
        new Skill('Attack', 0, 2, 0, 'Basic attack, does 100% WD')
      ])
    ]);

  opposition: Opposition = new Opposition([
    new Enemy('Bear A', 30),
    new Enemy('Bear B', 30)
  ], [], []);

  turnOrder: TurnOrder;

  activeCharacter: Character | null;

  activeEnemy: Enemy | null;

  logs: Log[] = [];

  constructor() {
    this.logs.push(new Log(LogType.EnterZone, this.partyLocation.region, this.partyLocation.zone));
    this.logs.push(new Log(LogType.StartFight, 1));

    this.turnOrder = new TurnOrder(this.party, this.opposition);

    this.processTurn();
  }

  // Process a character or enemy turn
  processTurn() {
    const activeCreature: Creature = this.turnOrder.currentOrder[0];

    if (activeCreature.isCharacter) {
      this.activeCharacter = activeCreature as Character;
      this.activeEnemy = null;
    } else {
      this.activeCharacter = null;
      this.activeEnemy = activeCreature as Enemy

      // Process the enemy turn after a little pause
      window.setTimeout(() => {
        this.processEnemyTurn(activeCreature as Enemy);
      }, 1000);
    }
  }

  // Process an enemy turn
  processEnemyTurn(enemy: Enemy) {
    // Do some damage to character 1
    const targetCharacter = this.party.row1Characters[0];
    const damage = 4;
    targetCharacter.inflictDamage(damage);

    this.logs.push(new Log(LogType.EnemyHit, enemy.name, targetCharacter.name, damage));

    this.turnOrder.nextCreature();

    this.processTurn();
  }
}
