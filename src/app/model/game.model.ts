// Classes for the whole game and fights

import {CreatureClass, CreatureType, GameState, SkillIconType, SkillTargetType} from "./common.model";
import {Character} from "./character.model";
import {Party} from "./party.model";
import {settings} from "./settings.model";
import {Opposition} from "./opposition.model";
import {attackMalus, bleed, burn, defenseMalus, poison} from "./status-type.model";
import {
  AlterTime,
  ApplyStatus,
  ComboDamage,
  Damage,
  DamageAndDamage,
  DamageAndDot,
  DamageAndHeal,
  DamageAndStatus,
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
import {Constants} from "./constants.model";

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
          new DamageAndDamage([SkillIconType.ATTACK], 'Fury Strike', SkillTargetType.OTHER_ALIVE, 15, 1, 1,
            'Inflict 140% damage to the target and 30% damage to self.', [1.4, 0.3]),
          new DamageAndDot([SkillIconType.ATTACK, SkillIconType.DETERIORATION], 'Deep Wound', SkillTargetType.OTHER_ALIVE, 15, 1, 1,
            'Inflict 50% damage to the target and 120% damage over 3 rounds.', [0.5, 0.4], [bleed]),
          new Damage([SkillIconType.ATTACK], 'Slash', SkillTargetType.OTHER_ALIVE_DOUBLE, 10, 1, 2,
            'Inflict 80% damage to two adjacent targets.', [0.8]),
          new ApplyStatus([SkillIconType.DETERIORATION], 'Intimidate', SkillTargetType.OTHER_ALIVE, 20, 1, 1,
            'Reduce the target attack by 20% during 3 rounds.', [], [attackMalus]),
        ],
        [CreatureType.HUMANOID]),
      new Character('Arwin', CreatureClass.PALADIN, 4, 30, true, 50, 8, [
          new DefendMagic(),
          new Damage([SkillIconType.ATTACK], 'Strike', SkillTargetType.OTHER_ALIVE, 0, 1, 1,
            'Inflict 100% damage.'),
          new Heal([SkillIconType.HEAL], 'Heal', SkillTargetType.SAME_ALIVE, 5, 0, 1,
            'Heal a character for 100% damage.'),
          new DualHeal([SkillIconType.HEAL], 'Dual Heal', SkillTargetType.SAME_ALIVE_OTHER, 10, 0, 2,
            'Heal a character for 100% damage and self for 80% damage.', [1, 0.8]),
          new Regenerate([SkillIconType.HEAL, SkillIconType.IMPROVEMENT], 'Regenerate', SkillTargetType.SAME_ALIVE, 5, 0, 1,
            'Heal a character for 50% damage and 120% damage over 3 rounds.', [0.5, 0.4]),
          new Heal([SkillIconType.HEAL], 'Heal All', SkillTargetType.SAME_ALIVE_ALL, 15, 0, 3,
            'Heal all characters for 50% damage.', [0.5]),
          new Revive([SkillIconType.HEAL], 'Revive', SkillTargetType.SAME_DEAD, 15, 0, 2,
            'Revive a character with 50% life.'),
        ],
        [CreatureType.UNDEAD])
    ],
    [
      new Character('Faren', CreatureClass.ARCHER, 4, 30, false, 50, 8, [
          new DefendTech(),
          new FullLifeDamage([SkillIconType.ATTACK], 'First Shot', SkillTargetType.OTHER_ALIVE, 10, 2, 1,
            'Inflict 100% damage. Add 50% damage if the target is full life.', [1.0, 1.5]),
          new DamageAndDot([SkillIconType.ATTACK, SkillIconType.DETERIORATION], 'Viper Shot', SkillTargetType.OTHER_ALIVE, 15, 2, 1,
            'Inflict 50% damage to the target and 120% damage over 3 rounds.', [0.5, 0.4], [poison]),
          new ComboDamage([SkillIconType.ATTACK], 'Combo Shot', SkillTargetType.OTHER_ALIVE, 10, 1, 1,
            'Inflict 80% damage then 120% then 160% when used on the same target during consecutive turns.', [0.8, 1.2, 1.6], [], Constants.COMBO_DURATION),
          new Damage([SkillIconType.ATTACK], 'Explosive Shot', SkillTargetType.OTHER_ALIVE_TRIPLE, 20, 2, 1,
            'Inflict 60% damage to three adjacent targets.', [0.6]),
          new ApplyStatus([SkillIconType.DETERIORATION], 'Crippling Shot', SkillTargetType.OTHER_ALIVE, 10, 2, 1,
            'Reduce the target defense by 20% during 3 rounds.', [], [defenseMalus]),
        ],
        [CreatureType.BEAST]),
      new Character('Harika', CreatureClass.MAGE, 4, 30, true, 50, 8, [
          new DefendMagic(),
          new Damage([SkillIconType.ATTACK], 'Lightning', SkillTargetType.OTHER_ALIVE, 5, 2, 1,
            'Inflict 100% damage.'),
          new DamageAndDot([SkillIconType.ATTACK], 'Burn', SkillTargetType.OTHER_ALIVE, 10, 2, 2,
            'Inflict 50% damage to the target and 150% damage over 3 rounds.', [0.5, 0.5], [burn]),
          new DamageAndStatus([SkillIconType.ATTACK, SkillIconType.DETERIORATION], 'Ice Blast', SkillTargetType.OTHER_ALIVE, 10, 2, 1,
            'Inflict 50% damage to the target and reduce the target attack and defense by 20% during one round.', [0.5], [attackMalus, defenseMalus], 1),
          new DamageAndHeal([SkillIconType.ATTACK, SkillIconType.HEAL], 'Drain Life', SkillTargetType.OTHER_ALIVE, 10, 1, 1,
            'Inflict 50% damage to the target and heal self for 50% damage.', [0.5, 1]),
          new Damage([SkillIconType.ATTACK], 'Fireball', SkillTargetType.OTHER_ALIVE_TRIPLE, 10, 2, 3,
            'Inflict 80% damage to three adjacent targets.', [0.8]),
          new ApplyStatus([SkillIconType.DETERIORATION], 'Weakness', SkillTargetType.OTHER_ALIVE, 10, 2, 1,
            'Reduce the target attack by 20% during 3 rounds.', [], [attackMalus]),
          new ApplyStatus([SkillIconType.DETERIORATION], 'Slow', SkillTargetType.OTHER_ALIVE, 10, 2, 1,
            'Reduce the target defense by 20% during 3 rounds.', [], [defenseMalus]),
          new AlterTime([SkillIconType.IMPROVEMENT, SkillIconType.DETERIORATION], 'Alter Time', SkillTargetType.ALIVE, 10, 2, 1,
            'Modify the duration of all statuses of a target by one turn.')
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
