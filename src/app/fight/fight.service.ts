import {Injectable} from '@angular/core';
import {Character, Creature, Enemy, FightStep, Opposition, Party, PartyLocation, Skill, TurnOrder} from './model';
import {Log, LogType} from './log.model';

@Injectable({
  providedIn: 'root'
})
export class FightService {

  // Pause in msec in the UI between actions
  pause: number = 1000;

  partyLocation: PartyLocation = new PartyLocation('Goblin Camp', 'Inner Camp', 'Fight 1');

  party: Party = new Party([
      new Character('Cyl', 'Rogue', 1, 20, false, 50, [
        new Skill('Attack', 5, 1, 0, 8, 'Basic attack, does 100% WD'),
        new Skill('Big Attack', 10, 1, 0, 12, 'Big attack, does 150% WD'),
        // new Skill('Defend', 0, 1, 0, 'Reduce taken damage by 30% until next turn'),
        // new Skill('Venom', 15, 1, 0, 'Hits the target for 100% damage and inflicts 60% poison damage over 3 turns'),
        // new Skill('Vanish', 10, 0, 4, 'Disappear and become immune to attacks'),
        // new Skill('Back Stab', 10, 1, 0, 'Hits the target for 180% damage')
      ]),
      new Character('Melkan', 'Warrior', 1, 20, false, 50, [
        new Skill('Attack', 0, 1, 0, 8, 'Basic attack, does 100% WD')
      ]),
      new Character('Arwin', 'Paladin', 1, 20, true, 50, [
        new Skill('Attack', 0, 1, 0, 8, 'Basic attack, does 100% WD')
      ])],
    [
      new Character('Faren', 'Archer', 1, 20, false, 50, [
        new Skill('Attack', 0, 2, 0, 8, 'Basic attack, does 100% WD')
      ]),
      new Character('Harika', 'Mage', 1, 20, true, 50, [
        new Skill('Attack', 0, 2, 0, 8, 'Basic attack, does 100% WD')
      ]),
      new Character('Nairo', 'Priest', 1, 20, true, 50, [
        new Skill('Attack', 0, 2, 0, 8, 'Basic attack, does 100% WD')
      ])
    ]);

  opposition: Opposition = new Opposition([
    new Enemy('Wolf A', 30, 4),
    new Enemy('Wolf B', 30, 4)
  ], [], []);

  turnOrder: TurnOrder;

  fightStep: FightStep = FightStep.END_OF_TURN;

  selectedCharacter: Character | null;

  selectedSkill: Skill | null;

  selectedEnemy: Enemy | null;

  logs: Log[] = [];

  constructor() {
    this.logs.push(new Log(LogType.EnterZone, this.partyLocation.region, this.partyLocation.zone));
    this.logs.push(new Log(LogType.StartFight, 1));

    this.turnOrder = new TurnOrder(this.party, this.opposition);

    this.processTurn();
  }

  /**
   * Process a character or enemy turn.
   */
  processTurn() {
    const activeCreature: Creature = this.turnOrder.currentOrder[0];

    if (activeCreature.isCharacter) {
      this.selectedCharacter = activeCreature as Character;
      this.fightStep = FightStep.SELECT_SKILL;
    } else {
      this.selectedEnemy = activeCreature as Enemy;
      this.fightStep = FightStep.ENEMY_TURN;

      // Process the enemy turn after a little pause
      window.setTimeout(() => {
        this.processEnemyTurnStep1(activeCreature as Enemy);
      }, this.pause);
    }
  }

  /**
   * Process the first step of an enemy turn:
   * - Choose the skill and the target
   * - Display the selected target
   */
  processEnemyTurnStep1(enemy: Enemy) {
    // Choose the enemy skill
    const damage = enemy.damage;

    // Choose the skill target
    const targetCharacter = this.party.row1Characters[0];
    this.selectedCharacter = targetCharacter;

    // Process the next step
    window.setTimeout(() => {
      this.processEnemyTurnStep2(enemy, damage, targetCharacter);
    }, this.pause);
  }

  /**
   * Process the second step of an enemy turn:
   * - Execute the skill
   * - Log the skill result
   */
  processEnemyTurnStep2(enemy: Enemy, damage: number, targetCharacter: Character) {
    // Execute the skill
    targetCharacter.inflictDamage(damage);

    // Log the result
    this.logs.push(new Log(LogType.EnemyHit, enemy.name, targetCharacter.name, damage));

    this.processNextTurn();
  }

  /**
   * Select a character skill.
   */
  selectSkill(skill: Skill) {
    this.selectedSkill = skill;
    this.fightStep = FightStep.SELECT_ENEMY;
  }

  /**
   * Select an enemy target for a skill.
   */
  selectEnemy(enemy: Enemy) {
    // This "if" is a poor man turn workflow
    if (this.selectedSkill != null) {
      this.selectedEnemy = enemy;

      // Execute the skill
      const damage = this.selectedSkill.damage;
      this.selectedCharacter?.useSkill(this.selectedSkill);
      enemy.inflictDamage(damage);

      // Log the result
      this.logs.push(new Log(LogType.CharacterHit, this.selectedCharacter?.name, enemy.name, damage));

      this.processNextTurn();
    }
  }

  /**
   * Process the next turn after some pauses.
   */
  processNextTurn() {
    // Give some time to the player to see the skill result
    window.setTimeout(() => {
      // Then deselect everything
      this.selectedCharacter = null;
      this.selectedSkill = null;
      this.selectedEnemy = null;

      window.setTimeout(() => {
        // Then start the new turn
        this.turnOrder.nextCreature();
        this.processTurn();
      }, this.pause);
    }, this.pause);
  }
}

