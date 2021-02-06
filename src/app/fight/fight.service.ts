import {Injectable} from '@angular/core';
import {Character, Creature, Enemy, PartyLocation} from './misc.model';
import {Skill, SkillTarget} from './skill.model';
import {Fight, FightStep} from './fight.model';
import {Log, LogType} from './log.model';

@Injectable({
  providedIn: 'root'
})
export class FightService {

  // Pause in msec in the UI between actions
  pauseDuration: number = 1000;

  partyLocation: PartyLocation = new PartyLocation('Fang Forest', 1);

  fight: Fight = new Fight();

  logs: Log[] = [];

  constructor() {
    this.fight.initialize();

    this.logs = [];
    this.logs.push(new Log(LogType.EnterZone, this.partyLocation.region));
  }

  /**
   * Start the fight.
   */
  startFight() {
    this.fight.step = FightStep.END_OF_TURN;

    this.logs.push(new Log(LogType.StartRound, this.fight.round));

    this.processTurn();
  }

  /**
   * Process a character or enemy turn.
   */
  processTurn() {
    const activeCreature: Creature = this.fight.turnOrder.currentOrder[0];

    if (activeCreature.isCharacter()) {
      this.fight.activeCharacter = activeCreature as Character;
      this.fight.step = FightStep.SELECT_SKILL;
    } else if (activeCreature.isEnemy()) {
      this.fight.activeEnemy = activeCreature as Enemy;
      this.fight.step = FightStep.ENEMY_TURN;

      this.pause(() => {
        this.processEnemyTurnStep1(activeCreature as Enemy);
      });
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
    const targetCharacter = this.fight.party.rows[0].characters[0];
    this.fight.targetCharacter = targetCharacter;

    // Process the next step
    this.pause(() => {
      this.processEnemyTurnStep2(enemy, damage, targetCharacter);
    });
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
    this.logs.push(new Log(LogType.Damage, enemy, targetCharacter, damage));

    this.processNextTurn();
  }

  /**
   * The mouse pointer entered a skill.
   */
  enterSkill(skill: Skill) {
    this.fight.hoveredSkill = skill;
    this.fight.focusedSkill = skill;
  }

  /**
   * The mouse pointer left a skill.
   */
  leaveSkill() {
    this.fight.hoveredSkill = null;
  }

  /**
   * Select a character skill.
   */
  selectSkill(skill: Skill) {
    // The player cannot change his mind and select a different skill
    if (this.fight.step != FightStep.SELECT_SKILL) {
      return;
    }

    // Check the skill cost
    if (skill.cost > (this.fight.activeCharacter?.energy ?? 0)) {
      return;
    }

    this.fight.selectedSkill = skill;

    // The next step depends on the target type of the skill
    switch (skill.target) {
      case SkillTarget.NONE:
        skill.execute(this.fight, this.logs);

        this.processNextTurn();
        break;
      case SkillTarget.ENEMY:
        this.fight.step = FightStep.SELECT_ENEMY;
        break;
      case SkillTarget.CHARACTER:
        this.fight.step = FightStep.SELECT_CHARACTER;
        break;
    }
  }

  /**
   * The mouse pointer entered an enemy.
   */
  enterEnemy(enemy: Enemy) {
    this.fight.hoveredEnemy = enemy;
  }

  /**
   * The mouse pointer left an enemy.
   */
  leaveEnemy() {
    this.fight.hoveredEnemy = null;
  }

  /**
   * Select an enemy target for a skill.
   */
  selectEnemy(enemy: Enemy) {
    if (this.fight.selectedSkill == null) {
      return;
    }

    this.fight.targetEnemy = enemy;

    this.fight.selectedSkill.execute(this.fight, this.logs);

    this.fight.step = FightStep.EXECUTING_SKILL;

    // If there are dead enemies, remove them after a pause
    if (this.fight.opposition.hasDeadEnemies()) {
      this.pause(() => {
        // Remove dead enemies from the opposition
        const removedNames = this.fight.opposition.removeDeadEnemies();

        // Remove dead enemies from the turn order
        this.fight.turnOrder.removeDeadEnemies();

        // Log the defeated enemies
        for (const name of removedNames) {
          this.logs.push(new Log(LogType.EnemyDefeated, name));
        }

        // Check if the party won
        if (this.fight.opposition.isWiped()) {
          this.pause(() => {
            this.logs.push(new Log(LogType.PartyVictory));
            this.fight.step = FightStep.PARTY_VICTORY;
          });
        } else {
          this.processNextTurn();
        }
      });
    } else {
      this.processNextTurn();
    }
  }

  /**
   * The mouse pointer entered a character.
   */
  enterCharacter(character: Character) {
    this.fight.hoveredCharacter = character;
  }

  /**
   * The mouse pointer left a character.
   */
  leaveCharacter() {
    this.fight.hoveredCharacter = null;
  }


  /**
   * Select a character target for a skill.
   */
  selectCharacter(character: Character) {
    if (this.fight.selectedSkill == null) {
      return;
    }

    this.fight.targetCharacter = character;

    this.fight.selectedSkill.execute(this.fight, this.logs);

    this.fight.step = FightStep.EXECUTING_SKILL;

    this.processNextTurn();
  }

  /**
   * Process the end of round, e.g. apply DOTs or HOTs.
   */
  processEndOfRound() {
    // Currently there is nothing to do,
    // but where there is, wait a while before doing it

    // Start the next round
    this.fight.round++;
    this.logs.push(new Log(LogType.StartRound, this.fight.round));

    this.processNextTurn();
  }

  /**
   * Process the next turn after some pauses.
   */
  processNextTurn() {
    // Give some time to the player to see the skill result
    this.pause(() => {
      // Then deselect everything
      this.fight.activeCharacter = null;
      this.fight.targetCharacter = null;
      this.fight.focusedSkill = null;
      this.fight.selectedSkill = null;
      this.fight.activeEnemy = null;
      this.fight.targetEnemy = null;

      this.pause(() => {
        // Then start the new turn
        this.fight.turnOrder.nextCreature();
        this.processTurn();
      });
    });
  }


  /**
   * Execute a function after a pause.
   */
  pause(process: Function) {
    window.setTimeout(() => {
      process.call(this);
    }, this.pauseDuration);
  }
}
