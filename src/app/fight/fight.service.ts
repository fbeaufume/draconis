import {Injectable} from '@angular/core';
import {Character, PARTY_ROW_SIZE, PARTY_SIZE, PartyLocation, PAUSE_LONG, PAUSE_SHORT} from '../model/misc.model';
import {Skill, SkillTarget} from '../model/skill.model';
import {Enemy, EnemyAction} from '../model/enemy.model';
import {Fight, FightStep} from '../model/fight.model';
import {Log, LogType} from '../model/log.model';

@Injectable({
  providedIn: 'root'
})
export class FightService {

  // Pause in msec in the UI between actions
  pauseDuration: number = PAUSE_LONG;

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
    const creature = this.fight.turnOrder.currentOrder[0];
    this.fight.activeCreature = creature;

    if (creature.isCharacter()) {
      this.fight.step = FightStep.SELECT_SKILL;
    } else if (creature.isEnemy()) {
      this.fight.step = FightStep.ENEMY_TURN;

      this.pause(() => {
        this.processEnemyTurnStep1(creature as Enemy);
      });
    } else if (creature.isEndOfRound()) {
      this.processEndOfRound();
    } else {
      console.log('Invalid creature type', creature);
    }
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
   * Return true if the selection is valid, false otherwise.
   */
  selectSkill(skill: Skill) {
    // The player cannot change his mind and select a different skill
    if (this.fight.step != FightStep.SELECT_SKILL) {
      return;
    }

    // Check that the skill can be used
    if (!skill.isSelectableBy(this.fight.activeCreature)) {
      return;
    }

    this.fight.selectedSkill = skill;

    // The next step depends on the target type of the skill
    switch (skill.target) {
      case SkillTarget.NONE:
        skill.execute(this.fight, this.logs);

        this.fight.step = FightStep.EXECUTING_SKILL;

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
    if (this.fight.selectedSkill == null || !this.fight.selectedSkill.isUsableOn(enemy)) {
      return;
    }

    this.fight.targetCreatures.push(enemy);

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

    this.fight.targetCreatures.push(character);

    this.fight.selectedSkill.execute(this.fight, this.logs);

    this.fight.step = FightStep.EXECUTING_SKILL;

    this.processNextTurn();
  }

  /**
   * Select a skill or enemy or character from a zero based index.
   */
  selectFromKey(index: number) {
    switch (this.fight.step) {
      case FightStep.SELECT_SKILL:
        if (this.fight.activeCreature != null && this.fight.activeCreature.skills.length > index) {
          this.selectSkill(this.fight.activeCreature.skills[index]);
        }
        break;
      case FightStep.SELECT_CHARACTER:
        if (index < PARTY_ROW_SIZE) {
          this.selectCharacter(this.fight.party.rows[1].characters[index]);
        } else if (index < PARTY_SIZE) {
          this.selectCharacter(this.fight.party.rows[0].characters[index - PARTY_ROW_SIZE]);
        }
        break;
      case FightStep.SELECT_ENEMY:
        this.fight.opposition.rows.forEach(row => {
          if (index < row.enemies.length) {
            this.selectEnemy(row.enemies[index]);
            return;
          }
          index -= row.enemies.length;
        });
        break;
    }
  }

  /**
   * Process the first step of an enemy turn: highlight the selected targets if any.
   */
  processEnemyTurnStep1(enemy: Enemy) {
    // Execute the enemy strategy
    const action = enemy.chooseAction(this.fight);

    if (action.skill.target == SkillTarget.NONE) {
      // Actions without target are executed immediately

      this.processEnemyTurnStep2(action);
    } else {
      // Actions with a target are executed after a pause

      // Select the targets
      this.fight.targetCreatures = action.targetCreatures;

      // Process the next step
      this.pause(() => {
        this.processEnemyTurnStep2(action);
      });
    }
  }

  /**
   * Process the second step of an enemy turn: execute the skill and log the result.
   */
  processEnemyTurnStep2(action: EnemyAction) {
    // Execute the skill
    action.skill.execute(this.fight, this.logs);

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
      this.fight.activeCreature = null;
      this.fight.focusedSkill = null;
      this.fight.selectedSkill = null;
      this.fight.targetCreatures = [];

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

  togglePauseDuration() {
    if (this.pauseDuration == PAUSE_LONG) {
      this.pauseDuration = PAUSE_SHORT;
    } else {
      this.pauseDuration = PAUSE_LONG;
    }
    this.logs.push(new Log(LogType.PauseDurationChanged, this.pauseDuration));
  }
}
