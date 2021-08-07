// Classes for the whole game and fights

import {CreatureClass, CreatureType, GameState, SkillIconType, SkillTargetType} from "./common.model";
import {Character} from "./character.model";
import {Party} from "./party.model";
import {settings} from "./settings.model";
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
  Strike
} from './skill.model';
import {Dungeon, FangForestDungeon, ForgottenGraveyardDungeon, TestDungeon} from "./dungeon.model";
import {Fight} from "./fight.model";

/**
 * Main model class. Contains the party, the dungeons, the current fight, etc.
 */
export class Game {

  state: GameState = GameState.START_NEXT_ENCOUNTER;

  region: string = '';

  // Zero when not fighting, otherwise one-based identifier of the opposition in the dungeon
  oppositionId: number = settings.fight - 1;

  // Zero when not fighting, increases when starting a fight, used to display the proper game proceed message
  oppositionCount: number = 0;

  party: Party = new Party([
      new Character('Melkan', CreatureClass.WARRIOR, 4, 30, false, 50, 8, [
          new DefendTech(),
          new Strike('Strike'),
          new DamageAndDamage(SkillIconType.ATTACK, 'Fury Strike', SkillTargetType.OTHER_ALIVE, 15, 1, 0,
            'Inflict 140% damage to the target and 30% damage to self.', [1.4, 0.3]),
          new DamageAndBleed(SkillIconType.ATTACK, 'Deep Wound', SkillTargetType.OTHER_ALIVE, 20, 1, 0,
            'Inflict 50% damage to the target and 120% damage over ' + Constants.EFFECT_DURATION + ' rounds.', [0.5, 0.4]),
          new Damage(SkillIconType.ATTACK, 'Slash', SkillTargetType.OTHER_ALIVE_DOUBLE, 20, 1, 0,
            'Inflict 80% damage to two adjacent targets.', [0.8]),
          new ApplyStatus(SkillIconType.DETERIORATION, 'Intimidate', SkillTargetType.OTHER_ALIVE, 20, 1, 0,
            'Reduce the enemy attack by 20% during ' + Constants.EFFECT_DURATION + ' rounds.', [], attackMalus, false),
        ],
        [CreatureType.HUMANOID]),
      new Character('Arwin', CreatureClass.PALADIN, 4, 30, true, 50, 8, [
          new DefendMagic(),
          new Damage(SkillIconType.ATTACK, 'Holy Strike', SkillTargetType.OTHER_ALIVE, 5, 1, 0,
            'Inflict 100% damage.'),
          new DamageAndHeal(SkillIconType.ATTACK, 'Recovery Strike', SkillTargetType.OTHER_ALIVE, 10, 1, 0,
            'Inflict 100% damage to the target and heal self for 50% damage.', [1.0, 0.5]),
          new Heal(SkillIconType.HEAL, 'Heal', SkillTargetType.SAME_ALIVE, 5, 0, 0,
            'Heal a character for 100% damage.'),
          new DualHeal(SkillIconType.HEAL, 'Dual Heal', SkillTargetType.SAME_ALIVE_OTHER, 10, 0, 0,
            'Heal a character for 100% damage and self for 80% damage.', [1, 0.8]),
          new Regenerate(SkillIconType.HEAL, 'Regenerate', SkillTargetType.SAME_ALIVE, 5, 0, 0,
            'Heal a character for 50% damage and 120% damage over ' + Constants.EFFECT_DURATION + ' rounds.', [0.5, 0.4]),
          new Heal(SkillIconType.HEAL, 'Heal All', SkillTargetType.SAME_ALIVE_ALL, 20, 0, 0,
            'Heal all characters for 50% damage.', [0.5]),
          new Revive(SkillIconType.HEAL, 'Revive', SkillTargetType.SAME_DEAD, 20, 0, 0,
            'Revive a character with 50% life.'),
        ],
        [CreatureType.UNDEAD])
    ],
    [
      new Character('Faren', CreatureClass.ARCHER, 4, 30, false, 50, 8, [
          new DefendTech(),
          new FullLifeDamage(SkillIconType.ATTACK, 'First Shot', SkillTargetType.OTHER_ALIVE, 10, 2, 0,
            'Inflict 100% damage. Add 50% damage if the target is full life.', [1.0, 1.5]),
          new DamageAndPoison(SkillIconType.ATTACK, 'Viper Shot', SkillTargetType.OTHER_ALIVE, 15, 2, 0,
            'Inflict 50% damage to the target and 120% damage over ' + Constants.EFFECT_DURATION + ' rounds.', [0.5, 0.4]),
          new ComboDamage(SkillIconType.ATTACK, 'Combo Shot', SkillTargetType.OTHER_ALIVE, 10, 1, 0,
            'Inflict 80% damage then 120% then 160% when used on the same target during consecutive turns.', [0.8, 1.2, 1.6]),
          new Damage(SkillIconType.ATTACK, 'Explosive Shot', SkillTargetType.OTHER_ALIVE_TRIPLE, 20, 2, 0,
            'Inflict 60% damage to three adjacent targets.', [0.6]),
          new ApplyStatus(SkillIconType.DETERIORATION, 'Crippling Shot', SkillTargetType.OTHER_ALIVE, 10, 2, 0,
            'Reduce the enemy defense by 20% during ' + Constants.EFFECT_DURATION + ' rounds.', [], defenseMalus, false),
        ],
        [CreatureType.BEAST]),
      new Character('Harika', CreatureClass.MAGE, 4, 30, true, 50, 8, [
          new DefendMagic(),
          new Damage(SkillIconType.ATTACK, 'Lightning', SkillTargetType.OTHER_ALIVE, 5, 2, 0,
            'Inflict 100% damage.'),
          new Damage(SkillIconType.ATTACK, 'Fireball', SkillTargetType.OTHER_ALIVE_TRIPLE, 10, 2, 0,
            'Inflict 60% damage to three adjacent targets.', [0.6]),
          new ApplyStatus(SkillIconType.DETERIORATION, 'Weakness', SkillTargetType.OTHER_ALIVE, 10, 2, 0,
            'Reduce the enemy attack by 20% during ' + Constants.EFFECT_DURATION + ' rounds.', [], attackMalus, false),
          new ApplyStatus(SkillIconType.DETERIORATION, 'Slow', SkillTargetType.OTHER_ALIVE, 10, 2, 0,
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

    this.oppositionCount++;

    this.party.forEachCharacter(c => c.clearStatusApplications());
    this.party.restoreTechPoints();

    this.fight = new Fight(this.party, this.dungeon.oppositions[this.oppositionId - 1]);
  }
}
