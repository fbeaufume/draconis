import {Injectable} from '@angular/core';
import {Game} from '../model/game.model';
import {Creature, EnemyAction} from '../model/creature.model';
import {Skill} from '../model/skill.model';
import {Log, logs} from '../model/log.model';
import {Constants} from '../model/constants.model';
import {
  GameState,
  LifeChangeEfficiency,
  LifeChangeType,
  LogType,
  SkillTargetType,
  StatusExpirationType
} from "../model/common.model";
import {Character} from "../model/character.model";
import {Party} from "../model/party.model";
import {settings} from "../model/settings.model";
import {Enemy} from "../model/enemy.model";
import {Fight} from "../model/fight.model";
import {LifeChange} from "../model/life-change.model";

@Injectable({
  providedIn: 'root'
})
export class FightService {

  game: Game;

  constructor() {
    this.restart();
  }

  get logs(): Log[] {
    return logs.logs;
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

  getAllCreatures(): Creature[] {
    const creatures = this.fight.getAllEnemies();
    this.party.rows.forEach(row => creatures.push(...row.characters));
    return creatures;
  }

  /**
   * Start the next encounter, i.e. display the opposition.
   */
  startNextEncounter() {
    this.endOfTurnCleanup();

    this.game.startNextEncounter();

    logs.clear();
    logs.addStringLog(LogType.OppositionAppear, this.fight.opposition.description);
  }

  /**
   * Start the fight, i.e. execute the first turn.
   */
  startFight() {
    this.game.state = GameState.END_OF_TURN;

    logs.addNumberLog(LogType.StartRound, this.fight.round);

    this.processTurn();
  }

  /**
   * Restart the dungeon.
   */
  restart() {
    this.game = new Game();

    logs.clear();
    logs.addStringLog(LogType.EnterZone, this.game.region);
  }

  /**
   * Called after a click on the main action button to proceed to the next fight state.
   */
  proceed() {
    if (this.game.state == GameState.START_NEXT_ENCOUNTER) {
      this.startNextEncounter();
    } else if (this.game.state == GameState.START_FIGHT) {
      this.startFight();
    } else if (this.game.state == GameState.DUNGEON_END) {
      this.restart();
    }
  }

  /**
   * Return the message displayed in the main action button to proceed to the next fight state.
   */
  getProceedMessage(): string | null {
    if (this.game.state == GameState.START_NEXT_ENCOUNTER) {
      if (this.game.oppositionCount <= 0) {
        return 'Start dungeon';
      } else {
        return 'Continue';
      }
    } else if (this.game.state == GameState.START_FIGHT) {
      return 'Start fight';
    } else if (this.game.state == GameState.DUNGEON_END) {
      return 'Quit dungeon';
    } else return null;
  }

  /**
   * Process a character or enemy turn.
   */
  processTurn() {
    const creature = this.fight.turnOrder.currentOrder[0];
    this.fight.activeCreature = creature;

    // Decrease the skills cooldown
    creature.decreaseCooldowns();

    // Decrease some statuses duration and remove the expired ones
    this.getAllCreatures().forEach(creature => {
      creature.decreaseStatusesDuration(StatusExpirationType.ORIGIN_CREATURE_TURN_START, this.fight.activeCreature);
    });

    // Skip dead characters
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
    // Check that the player can change his mind and select a different skill
    if (!Constants.CAN_SELECT_SKILL_STATES.includes(this.state)) {
      return;
    }

    // Check that the skill can be used
    if (!skill.isSelectableBy(this.fight.activeCreature)) {
      return;
    }

    this.fight.selectedSkill = skill;

    // The next step depends on the target type of the skill
    switch (skill.targetType) {
      case SkillTargetType.NONE:
      case SkillTargetType.SAME_ALIVE_ALL:
        if (skill.targetType == SkillTargetType.SAME_ALIVE_ALL) {
          this.fight.targetCreatures.push(...this.party.targetAllAliveCharacters());
        }

        this.executeSkill(skill);

        this.state = GameState.EXECUTING_SKILL;

        this.processNextTurn(true);
        break;
      case SkillTargetType.OTHER_ALIVE:
      case SkillTargetType.OTHER_ALIVE_DOUBLE:
      case SkillTargetType.OTHER_ALIVE_TRIPLE:
        this.state = GameState.SELECT_ENEMY;
        break;
      case SkillTargetType.SAME_ALIVE:
      case SkillTargetType.SAME_ALIVE_OTHER:
      case SkillTargetType.SAME_DEAD:
        this.state = GameState.SELECT_CHARACTER;
        break;
      case SkillTargetType.ALIVE:
        this.state = GameState.SELECT_CHARACTER_OR_ENEMY;
        break;
      default:
        console.log('Error in selectSkill, skill target type ' + skill.targetType + ' is not supported');
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
    if (this.fight.selectedSkill == null || !this.fight.selectedSkill.isUsableOn(enemy, this.fight)) {
      return;
    }

    // Get the effective target creatures
    this.fight.targetCreatures.push(...this.fight.selectedSkill.getTargetEnemies(enemy, this.fight));

    this.executeSkill(this.fight.selectedSkill);

    this.state = GameState.EXECUTING_SKILL;

    // If there are dead enemies, remove them after a pause
    if (this.fight.opposition.hasDeadEnemies()) {
      this.pause(() => {
        this.processDeadEnemies();

        // Execute the next turn
        if (!this.processEndOfFight()) {
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
    if (this.fight.selectedSkill == null || !this.fight.selectedSkill.isUsableOn(character, this.fight)) {
      return;
    }

    // Get the effective target creatures
    this.fight.targetCreatures.push(...this.fight.selectedSkill.getTargetCharacters(character, this.fight));

    // Execute the skill and log the output
    this.executeSkill(this.fight.selectedSkill);

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
        if (index < Constants.PARTY_ROW_SIZE) {
          this.selectCharacter(this.party.rows[1].characters[index]);
        } else if (index < Constants.PARTY_SIZE) {
          this.selectCharacter(this.party.rows[0].characters[index - Constants.PARTY_ROW_SIZE]);
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
    const action = enemy.handleTurn(this.game);

    if (action.skill.targetType == SkillTargetType.NONE) {
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
    this.executeSkill(action.skill);

    // Execute the next turn
    if (!this.processEndOfFight()) {
      this.processNextTurn(true);
    }
  }

  /**
   * Execute a skill and its after effects such as thorn damage, etc.
   */
  executeSkill(skill: Skill) {
    skill.execute(this.fight);

    // Use life change after effects such as thorn damage
    this.getAllCreatures().forEach(creature => {
      if (creature.selfLifeChangeAmount != 0) {
        const roundedAmount = Math.abs(Math.round(creature.selfLifeChangeAmount));
        creature.changeLife(new LifeChange(roundedAmount, LifeChangeEfficiency.NORMAL,
          creature.selfLifeChangeAmount > 0 ? LifeChangeType.GAIN : LifeChangeType.LOSS));
      }
    });
  }

  /**
   * Process the end of round, e.g. apply DOTs or HOTs.
   */
  processEndOfRound() {
    // Execute and update end of round statuses
    this.getAllCreatures().forEach(creature => {
      // Apply the life changes from DOTs and HOTs
      creature.applyDotsAndHots();

      // Decrease the statuses duration and remove the expired ones
      creature.decreaseStatusesDuration(StatusExpirationType.END_OF_ROUND);
    });

    // If there are dead enemies, remove them after a pause
    if (this.fight.opposition.hasDeadEnemies()) {
      this.pause(() => {
        this.processDeadEnemies();

        // Start the next round
        if (!this.processEndOfFight()) {
          this.fight.round++;
          logs.addNumberLog(LogType.StartRound, this.fight.round);

          this.processNextTurn(true);
        }
      });
    } else {
      // Start the next round
      if (!this.processEndOfFight()) {
        this.fight.round++;
        logs.addNumberLog(LogType.StartRound, this.fight.round);

        this.processNextTurn(true);
      }
    }
  }

  /**
   * Process the next turn immediately or after some pauses.
   */
  processNextTurn(pause: boolean) {
    // Decrease some status durations
    this.getAllCreatures().forEach(creature => {
      creature.decreaseStatusesDuration(StatusExpirationType.ORIGIN_CREATURE_TURN_END, this.fight.activeCreature);
    });

    if (pause) {
      // Give some time to the player to see the skill result
      this.pause(() => {
        this.endOfTurnCleanup();

        this.pause(() => {
          this.fight.turnOrder.nextCreature();
          this.processTurn();
        });
      });
    } else {
      this.endOfTurnCleanup();
      this.fight.turnOrder.nextCreature();
      this.processTurn();
    }
  }

  /**
   * Clear the selected creature and skill. Hide all displayed damages.
   */
  endOfTurnCleanup() {
    this.clearLifeChanges();

    // We did not apply earlier the skill cost to the creature because of side effects in the UI, but it's ok now
    if (this.fight.activeCreature != null && this.fight.selectedSkill != null) {
      this.fight.activeCreature.spendEnergy(this.fight.selectedSkill.cost);
    }

    // We did not reset the skill cooldown because of side effects in the UI, but it's ok now
    if (this.fight.selectedSkill != null) {
      this.fight.selectedSkill.resetCooldown();
    }

    this.fight.activeCreature = null;
    this.fight.focusedSkill = null;
    this.fight.selectedSkill = null;
    this.fight.targetCreatures = [];
  }

  /**
   * Clear the life changes on all creatures.
   */
  clearLifeChanges() {
    this.getAllCreatures().forEach(creature => {
      creature.clearLifeChange();
    });
  }

  /**
   * Remove dead enemies.
   */
  processDeadEnemies() {
    // Clear the life changes, otherwise the life change animation can be displayed a second time for alive creatures
    this.clearLifeChanges();

    // Remove dead enemies from the opposition
    const removedEnemies: Enemy[] = this.fight.opposition.removeDeadEnemies();

    // Restore some mana points to the characters when enemies died
    const totalRemovedEnemiesLife: number = removedEnemies.reduce((sum, enemy) => sum + enemy.lifeMax, 0);
    if (totalRemovedEnemiesLife > 0) {
      this.party.restoreManaPoints(totalRemovedEnemiesLife * Constants.MANA_GAIN_PER_DEAD_ENEMY);
    }

    // Remove the empty enemy rows
    this.fight.opposition.removeEmptyRows();

    // Remove dead enemies from the turn order
    this.fight.turnOrder.removeDeadEnemies();

    // Log the defeated enemies
    removedEnemies.forEach(enemy => logs.addCreatureLog(LogType.EnemyDefeated, enemy, null, null, null));
  }

  /**
   * If the fight is over (party victory or party defeat), process it and return true.
   * Return false otherwise.
   */
  processEndOfFight(): boolean {
    // Handle party defeat
    if (this.party.isWiped()) {
      this.pause(() => {
        logs.addLog(LogType.PartyDefeat);

        // The dungeon is over
        this.state = GameState.DUNGEON_END;
      });

      return true;
    }

    // Handle party victory
    if (this.fight.opposition.isWiped()) {
      this.pause(() => {
        logs.addLog(LogType.PartyVictory);

        if (this.game.hasNextEncounter()) {
          // Moving on to the next encounter
          this.state = GameState.START_NEXT_ENCOUNTER;
        } else {
          // The dungeon is over
          logs.addLog(LogType.DungeonCleared);
          this.state = GameState.DUNGEON_END;
        }
      });

      return true;
    }

    return false;
  }

  /**
   * Execute a function after a pause.
   */
  pause(process: Function) {
    window.setTimeout(() => {
      process.call(this);
    }, settings.pauseDuration);
  }
}
