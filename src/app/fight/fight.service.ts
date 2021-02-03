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

  round: number = 1;

  // Currently using the same skills for all characters
  skills: Skill[] = [
    new Skill('Attack', 0, 1, 0, 10, 'Basic attack, does 10 damage'),
    new Skill('Special Attack', 10, 1, 0, 15, 'Special attack, does 15 damage'),
    new Skill('Ultimate Attack', 60, 1, 0, 40, 'Ultimate attack, does 40 damage'),
    // new Skill('Defend', 0, 1, 0, 'Reduce taken damage by 30% until next turn'),
    // new Skill('Venom', 15, 1, 0, 'Hits the target for 100% damage and inflicts 60% poison damage over 3 turns'),
    // new Skill('Vanish', 10, 0, 4, 'Disappear and become immune to attacks'),
    // new Skill('Back Stab', 10, 1, 0, 'Hits the target for 180% damage')
  ];

  party: Party = new Party([
      new Character('Cyl', 'Rogue', 1, 20, false, 50, this.skills),
      new Character('Melkan', 'Warrior', 1, 20, false, 50, this.skills),
      new Character('Arwin', 'Paladin', 1, 20, true, 50, this.skills)],
    [
      new Character('Faren', 'Archer', 1, 20, false, 50, this.skills),
      new Character('Harika', 'Mage', 1, 20, true, 50, this.skills),
      new Character('Nairo', 'Priest', 1, 20, true, 50, this.skills)
    ]);

  opposition: Opposition = new Opposition([
    new Enemy('Wolf A', 30, 4),
    new Enemy('Wolf B', 60, 4)
  ], [], []);

  turnOrder: TurnOrder;

  fightStep: FightStep = FightStep.BEFORE_START;

  activeCharacter: Character | null;

  // The character targeted by a skill (from a character or an enemy)
  targetCharacter: Character | null;

  // The skill currently under the mouse pointer during the selection of a skill
  hoveredSkill: Skill | null;

  // The skill currently displayed in the focus skill panel
  focusedSkill: Skill | null;

  // Skill selected by the player
  selectedSkill: Skill | null;

  activeEnemy: Enemy | null;

  // The enemy under the mouse pointer during the selection of an enemy
  hoveredEnemy: Enemy | null;

  // The enemy targeted by a skill (from a character or an enemy)
  targetEnemy: Enemy | null;

  logs: Log[] = [];

  constructor() {
    this.logs.push(new Log(LogType.EnterZone, this.partyLocation.region, this.partyLocation.zone));

    this.turnOrder = new TurnOrder(this.party, this.opposition);
  }

  /**
   * Start the fight.
   */
  startFight() {
    this.fightStep = FightStep.END_OF_TURN;

    this.logs.push(new Log(LogType.StartRound, this.round));

    this.processTurn();
  }

  /**
   * Process a character or enemy turn.
   */
  processTurn() {
    const activeCreature: Creature = this.turnOrder.currentOrder[0];

    if (activeCreature.isCharacter()) {
      this.activeCharacter = activeCreature as Character;
      this.fightStep = FightStep.SELECT_SKILL;
    } else if (activeCreature.isEnemy()) {
      this.activeEnemy = activeCreature as Enemy;
      this.fightStep = FightStep.ENEMY_TURN;

      window.setTimeout(() => {
        this.processEnemyTurnStep1(activeCreature as Enemy);
      }, this.pause);
    } else {
      this.processEndOfRound();
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
    const targetCharacter = this.party.rows[0].characters[0];
    this.targetCharacter = targetCharacter;

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
   * The mouse pointer entered a skill.
   */
  enterSkill(skill: Skill) {
    this.hoveredSkill = skill;
    this.focusedSkill = skill;
  }

  /**
   * The mouse pointer left a skill.
   */
  leaveSkill() {
    this.hoveredSkill = null;
  }

  /**
   * Select a character skill.
   */
  selectSkill(skill: Skill) {
    if (
      // Cannot select a skill after we selected one
      this.fightStep == FightStep.SELECT_SKILL
      // Check the skill cost
      && (skill.cost <= (this.activeCharacter?.energy ?? 0))) {
      this.selectedSkill = skill;
      this.fightStep = FightStep.SELECT_ENEMY;
    }
  }

  /**
   * The mouse pointer entered an enemy.
   */
  enterEnemy(enemy: Enemy) {
    this.hoveredEnemy = enemy;
  }

  /**
   * The mouse pointer left an enemy.
   */
  leaveEnemy() {
    this.hoveredEnemy = null;
  }

  /**
   * Select an enemy target for a skill.
   */
  selectEnemy(enemy: Enemy) {
    // This "if" is a poor man turn workflow
    if (this.selectedSkill != null) {
      this.targetEnemy = enemy;

      // Execute the skill
      const damage = this.selectedSkill.damage;
      this.activeCharacter?.useSkill(this.selectedSkill);
      enemy.inflictDamage(damage);

      // Log the result
      this.logs.push(new Log(LogType.CharacterHit, this.activeCharacter?.name, enemy.name, damage));

      this.fightStep = FightStep.EXECUTING_SKILL;

      // If there are dead enemies, remove them after a pause
      if (this.opposition.hasDeadEnemies()) {
        window.setTimeout(() => {
          // Remove dead enemies from the opposition
          const removedNames = this.opposition.removeDeadEnemies();

          // Remove dead enemies from the turn order
          this.turnOrder.removeDeadEnemies();

          // Log the defeated enemies
          for (const name of removedNames) {
            this.logs.push(new Log(LogType.DefeatedEnemy, name));
          }

          this.processNextTurn();
        }, this.pause);
      }
      else {
        this.processNextTurn();
      }
    }
  }

  /**
   * Process the end of round, e.g. apply DOTs or HOTs.
   */
  processEndOfRound() {
    // Currently there is nothing to do,
    // but where there is, wait a while before doing it

    // Start the next round
    this.round++;
    this.logs.push(new Log(LogType.StartRound, this.round));

    this.processNextTurn();
  }

  /**
   * Process the next turn after some pauses.
   */
  processNextTurn() {
    // Give some time to the player to see the skill result
    window.setTimeout(() => {
      // Then deselect everything
      this.activeCharacter = null;
      this.targetCharacter = null;
      this.focusedSkill = null;
      this.selectedSkill = null;
      this.activeEnemy = null;
      this.targetEnemy = null;

      window.setTimeout(() => {
        // Then start the new turn
        this.turnOrder.nextCreature();
        this.processTurn();
      }, this.pause);
    }, this.pause);
  }
}
