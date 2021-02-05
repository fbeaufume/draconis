import {Injectable} from '@angular/core';
import {Character, Creature, Enemy, FightStep, Opposition, Party, PartyLocation, TurnOrder} from './model';
import {attack, bigAttack, heal, Skill, SkillTarget} from './skill.model';
import {Log, LogType} from './log.model';

@Injectable({
  providedIn: 'root'
})
export class FightService {

  // Pause in msec in the UI between actions
  pauseDuration: number = 1000;

  partyLocation: PartyLocation = new PartyLocation('Fang Forest', 1);

  fightStep: FightStep = FightStep.BEFORE_START;

  round: number = 0;

  // Currently using the same skills for all characters
  skills: Skill[] = [
    attack,
    bigAttack,
    heal,
  ];

  party: Party = new Party([], []);

  opposition: Opposition = new Opposition([], [], []);

  turnOrder: TurnOrder;

  activeCharacter: Character | null;

  // The character under the mouse pointer during the selection of a character
  hoveredCharacter: Character | null;

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
    this.initializeFight();
  }

  initializeFight() {
    this.fightStep = FightStep.BEFORE_START;
    this.round = 1;

    this.party = new Party([
        new Character('Cyl', 'Rogue', 1, 20, false, 50, this.skills),
        new Character('Melkan', 'Warrior', 1, 20, false, 50, this.skills),
        new Character('Arwin', 'Paladin', 1, 20, true, 50, this.skills)],
      [
        new Character('Faren', 'Archer', 1, 20, false, 50, this.skills),
        new Character('Harika', 'Mage', 1, 20, true, 50, this.skills),
        new Character('Nairo', 'Priest', 1, 20, true, 50, this.skills)
      ]);

    this.opposition = new Opposition([
      new Enemy('Wolf A', 15, 4),
      new Enemy('Wolf B', 15, 4)
    ], [], []);

    this.activeCharacter = null;
    this.targetCharacter = null;
    this.hoveredSkill = null;
    this.focusedSkill = null;
    this.selectedSkill = null;
    this.activeEnemy = null;
    this.hoveredEnemy = null;
    this.targetEnemy = null;

    this.turnOrder = new TurnOrder(this.party, this.opposition);

    this.logs = [];
    this.logs.push(new Log(LogType.EnterZone, this.partyLocation.region));
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
    const targetCharacter = this.party.rows[0].characters[0];
    this.targetCharacter = targetCharacter;

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
    // The player cannot change his mind and select a different skill
    if (this.fightStep != FightStep.SELECT_SKILL) {
      return;
    }

    // Check the skill cost
    if (skill.cost > (this.activeCharacter?.energy ?? 0)) {
      return;
    }

    this.selectedSkill = skill;

    // The next step depends on the target type of the skill
    this.fightStep = skill.target == SkillTarget.ENEMY ? FightStep.SELECT_ENEMY : FightStep.SELECT_CHARACTER;
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
    if (this.selectedSkill == null) {
      return;
    }

    this.targetEnemy = enemy;

    // Execute the skill
    const damage = this.selectedSkill.power;
    this.activeCharacter?.useSkill(this.selectedSkill);
    enemy.inflictDamage(damage);

    // Log the result
    this.logs.push(new Log(LogType.CharacterHit, this.activeCharacter?.name, enemy.name, damage));

    this.fightStep = FightStep.EXECUTING_SKILL;

    // If there are dead enemies, remove them after a pause
    if (this.opposition.hasDeadEnemies()) {
      this.pause(() => {
        // Remove dead enemies from the opposition
        const removedNames = this.opposition.removeDeadEnemies();

        // Remove dead enemies from the turn order
        this.turnOrder.removeDeadEnemies();

        // Log the defeated enemies
        for (const name of removedNames) {
          this.logs.push(new Log(LogType.DefeatedEnemy, name));
        }

        // Check if the party won
        if (this.opposition.isWiped()) {
          this.pause(() => {
            this.logs.push(new Log(LogType.PartyVictory));
            this.fightStep = FightStep.PARTY_VICTORY;
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
    this.hoveredCharacter = character;
  }

  /**
   * The mouse pointer left a character.
   */
  leaveCharacter() {
    this.hoveredCharacter = null;
  }


  /**
   * Select a character target for a skill.
   */
  selectCharacter(character: Character) {
    if (this.selectedSkill == null) {
      return;
    }

    this.targetCharacter = character;

    // Execute the skill
    const heal = this.selectedSkill.power;
    this.activeCharacter?.useSkill(this.selectedSkill);
    character.inflictDamage(-heal);

    // Log the result
    this.logs.push(new Log(LogType.CharacterHeal, this.activeCharacter?.name, character.name, heal));

    this.fightStep = FightStep.EXECUTING_SKILL;

    this.processNextTurn();
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
    this.pause(() => {
      // Then deselect everything
      this.activeCharacter = null;
      this.targetCharacter = null;
      this.focusedSkill = null;
      this.selectedSkill = null;
      this.activeEnemy = null;
      this.targetEnemy = null;

      this.pause(() => {
        // Then start the new turn
        this.turnOrder.nextCreature();
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
