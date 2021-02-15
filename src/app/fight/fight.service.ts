import {Injectable} from '@angular/core';
import {Fight, Game, GameState, PARTY_ROW_SIZE, PARTY_SIZE, PAUSE_LONG, PAUSE_SHORT} from '../model/game.model';
import {Character, Enemy, EnemyAction, Party} from '../model/creature.model';
import {Skill, SkillTarget} from '../model/skill.model';
import {Log, LogType} from '../model/log.model';

@Injectable({
  providedIn: 'root'
})
export class FightService {

  // Pause in msec in the UI between actions
  pauseDuration: number = PAUSE_LONG;

  game: Game;

  logs: Log[] = [];

  constructor() {
    this.restart();
  }

  get state(): GameState {
    return this.game.state;
  }

  set state(state: GameState) {
    this.game.state = state;
  }

  get party(): Party {
    return this.game.party;
  }

  get fight(): Fight {
    return this.game.fight;
  }

  /**
   * Start the next encounter, i.e. display the opposition.
   */
  startNextEncounter() {
    this.game.startNextEncounter();

    this.logs.push(new Log(LogType.OppositionAppear, this.fight.round));
  }

  /**
   * Start the fight, i.e. execute the first turn.
   */
  startFight() {
    this.game.state = GameState.END_OF_TURN;

    this.logs.push(new Log(LogType.StartRound, this.fight.round));

    this.processTurn();
  }

  /**
   * Restart the dungeon.
   */
  restart() {
    this.game = new Game();

    this.logs = [];
    this.logs.push(new Log(LogType.EnterZone, this.game.region));
  }

  /**
   * Called after a click on the main action button to proceed to the next state.
   */
  proceed() {
    if (this.game.state == GameState.START_NEXT_ENCOUNTER) {
      this.startNextEncounter();
    }
    else if (this.game.state == GameState.START_FIGHT) {
      this.startFight();
    }
    else if (this.game.state == GameState.DUNGEON_END)
      this.restart();
  }

  /**
   * Process a character or enemy turn.
   */
  processTurn() {
    const creature = this.fight.turnOrder.currentOrder[0];
    this.fight.activeCreature = creature;

    // Skip dead creatures
    if (creature.isDead()) {
      this.processNextTurn(false);
    }

    if (creature.isCharacter()) {
      this.state = GameState.SELECT_SKILL;
    } else if (creature.isEnemy()) {
      this.state = GameState.ENEMY_TURN;

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
    if (this.state != GameState.SELECT_SKILL) {
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

        this.state = GameState.EXECUTING_SKILL;

        this.processNextTurn(true);
        break;
      case SkillTarget.ENEMY:
        this.state = GameState.SELECT_ENEMY;
        break;
      case SkillTarget.CHARACTER_ALIVE:
        // TODO FBE select an alive character only
        this.state = GameState.SELECT_CHARACTER;
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

    this.state = GameState.EXECUTING_SKILL;

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

            if (this.game.hasNextEncounter()) {
              // Moving on to the next encounter
              this.state = GameState.START_NEXT_ENCOUNTER;
            } else {
              // The dungeon is cleared
              this.state = GameState.DUNGEON_END;
            }
          });
        } else {
          this.processNextTurn(true);
        }
      });
    } else {
      this.processNextTurn(true);
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

    // TODO FBE check if the character can be targeted

    this.fight.targetCreatures.push(character);

    this.fight.selectedSkill.execute(this.fight, this.logs);

    this.state = GameState.EXECUTING_SKILL;

    this.processNextTurn(true);
  }

  /**
   * Select a skill or enemy or character from a zero based index.
   */
  selectFromKey(index: number) {
    switch (this.state) {
      case GameState.SELECT_SKILL:
        if (this.fight.activeCreature != null && this.fight.activeCreature.skills.length > index) {
          this.selectSkill(this.fight.activeCreature.skills[index]);
        }
        break;
      case GameState.SELECT_CHARACTER:
        if (index < PARTY_ROW_SIZE) {
          this.selectCharacter(this.party.rows[1].characters[index]);
        } else if (index < PARTY_SIZE) {
          this.selectCharacter(this.party.rows[0].characters[index - PARTY_ROW_SIZE]);
        }
        break;
      case GameState.SELECT_ENEMY:
        for (let i = 0; i < this.fight.opposition.rows.length; i++) {
          const row = this.fight.opposition.rows[i];
          if (index < row.enemies.length) {
            this.selectEnemy(row.enemies[index]);
            return;
          }
          index -= row.enemies.length;
        }
        break;
    }
  }

  /**
   * Process the first step of an enemy turn: highlight the selected targets if any.
   */
  processEnemyTurnStep1(enemy: Enemy) {
    // Execute the enemy strategy
    const action = enemy.chooseAction(this.game);

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

    this.processNextTurn(true);
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

    this.processNextTurn(true);
  }

  /**
   * Process the next turn immediatly or after some pauses.
   */
  processNextTurn(pause: boolean) {
    if (pause) {

      // Give some time to the player to see the skill result
      this.pause(() => {
        this.deselectEverything();

        this.pause(() => {
          this.fight.turnOrder.nextCreature();
          this.processTurn();
        });
      });
    }
    else {
      this.deselectEverything();
      this.fight.turnOrder.nextCreature();
      this.processTurn();
    }
  }

  deselectEverything() {
    this.fight.activeCreature = null;
    this.fight.focusedSkill = null;
    this.fight.selectedSkill = null;
    this.fight.targetCreatures = [];
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
