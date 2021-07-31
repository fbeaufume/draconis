// Classes for the whole game and fights

import {Creature} from './creature.model';
import {CreatureClass, CreatureType, GameState, SkillIconType, SkillTarget} from "./common.model";
import {Character} from "./character.model";
import {Party} from "./party.model";
import {settings} from "./settings.model";
import {Enemy} from "./enemy.model";
import {Opposition} from "./opposition.model";
import {Constants} from "./constants.model";
import {attackMalus, defenseMalus} from "./status-type.model";
import {
  ApplyStatus,
  ComboDamage,
  Damage,
  DamageAndBleed,
  DamageAndDamage,
  DamageAndHeal,
  DamageAndPoison,
  DefendMagic,
  DefendTech,
  DualHeal,
  FullLifeDamage,
  Heal,
  Regenerate,
  Revive,
  Skill,
  Strike
} from './skill.model';
import {Dungeon, FangForestDungeon, ForgottenGraveyardDungeon, TestDungeon} from "./dungeon.model";
import {TurnOrder} from "./turn-order.model";

// TODO FBE move to a dedicated file
/**
 * All things related to a fight: party, opposition, active character, target enemy, etc.
 */
export class Fight {

  opposition: Opposition;

  /**
   * The current round number.
   */
  round: number = 1;

  turnOrder: TurnOrder;

  /**
   * The currently active character or enemy.
   */
  activeCreature: Creature | null;

  /**
   * The character under the mouse pointer during the selection of a character.
   */
  hoveredCharacter: Character | null;

  /**
   * The skill currently under the mouse pointer during the selection of a skill.
   */
  hoveredSkill: Skill | null;

  /**
   * The skill currently displayed in the focus skill panel.
   */
  focusedSkill: Skill | null;

  /**
   * Skill selected by the player.
   */
  selectedSkill: Skill | null;

  /**
   * The enemy under the mouse pointer during the selection of an enemy.
   */
  hoveredEnemy: Enemy | null;

  /**
   * The creatures targeted by the chosen skill of the active character or enemy.
   */
  targetCreatures: Creature[] = [];

  constructor(
    party: Party,
    opposition: Opposition,
  ) {
    this.opposition = opposition;
    this.opposition.updateDistances();
    this.turnOrder = new TurnOrder(party, this.opposition);
    this.activeCreature = null;
    this.hoveredSkill = null;
    this.focusedSkill = null;
    this.selectedSkill = null;
    this.hoveredEnemy = null;
    this.targetCreatures = [];
  }

  getAllEnemies(): Creature[] {
    const creatures: Creature[] = [];
    this.opposition.rows.forEach(row => creatures.push(...row.enemies));
    return creatures;
  }

  /**
   * Is the creature active.
   */
  isActive(creature: Creature): boolean {
    return creature === this.activeCreature;
  }

  /**
   * Is the creature in the target list.
   */
  isTargeted(creature: Creature): boolean {
    for (const tempCreature of this.targetCreatures) {
      if (creature === tempCreature) {
        return true;
      }
    }
    return false;
  }
}

/**
 * The party location in the "world".
 */
export class Game {

  state: GameState = GameState.START_NEXT_ENCOUNTER;

  region: string = '';

  // Zero when not fighting, otherwise one-based identifier of the opposition in the dungeon
  oppositionId: number = settings.fight - 1;

  party: Party = new Party([
      new Character('Melkan', CreatureClass.WARRIOR, 4, 30, false, 50, 8, [
          new DefendTech(),
          new Strike('Strike'),
          new DamageAndDamage(SkillIconType.ATTACK, 'Fury Strike', SkillTarget.ENEMY_SINGLE, 15, 1, 0,
            'Inflict 140% damage to the target and 30% damage to self.', [1.4, 0.3]),
          new DamageAndBleed(SkillIconType.ATTACK, 'Deep Wound', SkillTarget.ENEMY_SINGLE, 20, 1, 0,
            'Inflict 50% damage to the target and 120% damage over ' + Constants.EFFECT_DURATION + ' rounds.', [0.5, 0.4]),
          new Damage(SkillIconType.ATTACK, 'Slash', SkillTarget.ENEMY_DOUBLE, 20, 1, 0,
            'Inflict 80% damage to two adjacent targets.', [0.8]),
          new ApplyStatus(SkillIconType.DETERIORATION, 'Intimidate', SkillTarget.ENEMY_SINGLE, 20, 1, 0,
            'Reduce the enemy attack by 20% during ' + Constants.EFFECT_DURATION + ' rounds.', [], attackMalus, false),
        ],
        [CreatureType.HUMANOID]),
      new Character('Arwin', CreatureClass.PALADIN, 4, 30, true, 50, 8, [
          new DefendMagic(),
          new Damage(SkillIconType.ATTACK, 'Holy Strike', SkillTarget.ENEMY_SINGLE, 5, 1, 0,
            'Inflict 100% damage.'),
          new DamageAndHeal(SkillIconType.ATTACK, 'Recovery Strike', SkillTarget.ENEMY_SINGLE, 10, 1, 0,
            'Inflict 100% damage to the target and heal self for 50% damage.', [1.0, 0.5]),
          new Heal(SkillIconType.HEAL, 'Heal', SkillTarget.CHARACTER_ALIVE, 5, 0, 0,
            'Heal a character for 100% damage.'),
          new DualHeal(SkillIconType.HEAL, 'Dual Heal', SkillTarget.CHARACTER_OTHER, 10, 0, 0,
            'Heal a character for 100% damage and self for 80% damage.', [1, 0.8]),
          new Regenerate(SkillIconType.HEAL, 'Regenerate', SkillTarget.CHARACTER_ALIVE, 5, 0, 0,
            'Heal a character for 50% damage and 120% damage over ' + Constants.EFFECT_DURATION + ' rounds.', [0.5, 0.4]),
          new Heal(SkillIconType.HEAL, 'Heal All', SkillTarget.CHARACTER_ALL_ALIVE, 20, 0, 0,
            'Heal all characters for 50% damage.', [0.5]),
          new Revive(SkillIconType.HEAL, 'Revive', SkillTarget.CHARACTER_DEAD, 20, 0, 0,
            'Revive a character with 50% life.'),
        ],
        [CreatureType.UNDEAD])
    ],
    [
      new Character('Faren', CreatureClass.ARCHER, 4, 30, false, 50, 8, [
          new DefendTech(),
          new FullLifeDamage(SkillIconType.ATTACK, 'First Shot', SkillTarget.ENEMY_SINGLE, 10, 2, 0,
            'Inflict 100% damage. Add 50% damage if the target is full life.', [1.0, 1.5]),
          new DamageAndPoison(SkillIconType.ATTACK, 'Viper Shot', SkillTarget.ENEMY_SINGLE, 15, 2, 0,
            'Inflict 50% damage to the target and 120% damage over ' + Constants.EFFECT_DURATION + ' rounds.', [0.5, 0.4]),
          new ComboDamage(SkillIconType.ATTACK, 'Combo Shot', SkillTarget.ENEMY_SINGLE, 10, 1, 0,
            'Inflict 80% damage then 120% then 160% when used on the same target during consecutive turns.', [0.8, 1.2, 1.6]),
          new Damage(SkillIconType.ATTACK, 'Explosive Shot', SkillTarget.ENEMY_TRIPLE, 20, 2, 0,
            'Inflict 60% damage to three adjacent targets.', [0.6]),
          new ApplyStatus(SkillIconType.DETERIORATION, 'Crippling Shot', SkillTarget.ENEMY_SINGLE, 10, 2, 0,
            'Reduce the enemy defense by 20% during ' + Constants.EFFECT_DURATION + ' rounds.', [], defenseMalus, false),
        ],
        [CreatureType.BEAST]),
      new Character('Harika', CreatureClass.MAGE, 4, 30, true, 50, 8, [
          new DefendMagic(),
          new Damage(SkillIconType.ATTACK, 'Lightning', SkillTarget.ENEMY_SINGLE, 5, 2, 0,
            'Inflict 100% damage.'),
          new Damage(SkillIconType.ATTACK, 'Fireball', SkillTarget.ENEMY_TRIPLE, 10, 2, 0,
            'Inflict 60% damage to three adjacent targets.', [0.6]),
          new ApplyStatus(SkillIconType.DETERIORATION, 'Weakness', SkillTarget.ENEMY_SINGLE, 10, 2, 0,
            'Reduce the enemy attack by 20% during ' + Constants.EFFECT_DURATION + ' rounds.', [], attackMalus, false),
          new ApplyStatus(SkillIconType.DETERIORATION, 'Slow', SkillTarget.ENEMY_SINGLE, 10, 2, 0,
            'Reduce the enemy defense by 20% during ' + Constants.EFFECT_DURATION + ' rounds.', [], defenseMalus, false),
        ],
        [CreatureType.ELEMENTAL])
    ]);

  dungeons: Dungeon[] = [new TestDungeon(), new FangForestDungeon(), new ForgottenGraveyardDungeon()];
  dungeon: Dungeon = this.dungeons[settings.dungeon] || this.dungeons[1] || this.dungeons[0];

  fight: Fight = new Fight(this.party, new Opposition(''));

  constructor() {
    this.region = this.dungeon.name;
  }

  get opposition(): Opposition {
    return this.fight.opposition;
  }

  hasNextEncounter(): boolean {
    return this.oppositionId < this.dungeon.oppositions.length;
  }

  startNextEncounter() {
    this.state = GameState.START_FIGHT;

    this.oppositionId++;

    this.party.forEachCharacter(c => c.clearStatusApplications());
    this.party.restoreTechPoints();

    this.fight = new Fight(this.party, this.dungeon.oppositions[this.oppositionId - 1]);
  }
}
