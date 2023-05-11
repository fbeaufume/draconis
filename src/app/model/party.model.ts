import {PartyRow} from "./party-row.model";
import {Character} from "./character.model";
import {CreatureClass, CreatureType, ElementType, SkillModifierType, SkillTargetType} from "./common.model";
import {
  AlterTime,
  ApplyDeterioration,
  ApplyImprovement,
  Berserk,
  ComboDamage,
  Damage,
  DamageAndDot,
  DamageAndSelfStatus,
  DamageAndStatus,
  DefendMagic,
  DefendTech,
  Drain,
  DualHeal,
  Execution,
  Heal,
  Judgement,
  Regenerate,
  Revive,
  Sacrifice,
  Shot,
  Strike,
  Vengeance
} from "./skill.model";
import {
  attackBonus,
  attackMalus,
  bleed,
  burn,
  defend,
  defenseBonus,
  defenseMalus,
  fireTrap,
  iceTrap,
  poison,
  reflectMeleeDamage
} from "./status-type.model";
import {Constants} from "./constants.model";

/**
 * The player party.
 */
export class Party {

  /**
   * The characters rows. The first row in the array is the front row.
   */
  rows: PartyRow[] = [];

  constructor(
    // Front row characters
    row1Characters: Character[],
    // Back row characters
    row2Characters: Character[]) {
    this.rows.push(new PartyRow(row1Characters));
    this.rows.push(new PartyRow(row2Characters));

    this.updateDistances();
  }

  /**
   * Give each character his distance to the opposition.
   */
  private updateDistances() {
    for (let i = 0; i < this.rows.length; i++) {
      const row = this.rows[i];
      row.characters.forEach(character => {
        character.distance = i + 1;
      });
    }
  }

  /**
   * Execute a callback on each character that validates an optional filter.
   */
  forEachCharacter(callback: (character: Character) => void, filter: (character: Character) => boolean = _ => true) {
    this.rows.forEach(row => row.characters.filter(c => filter(c)).forEach(c => callback(c)));
  }

  /**
   * Return the number of alive creatures
   */
  countAliveCreatures(): number {
    let count = 0;

    this.forEachCharacter(_ => count++, c => c.isAlive());

    return count;
  }

  /**
   * Return true is there is no alive character.
   */
  isWiped() {
    return this.countAliveCreatures() <= 0;
  }

  /**
   * Restore all tech points. Called at the beginning of a new encounter for example.
   */
  restoreTechPoints() {
    this.forEachCharacter(c => c.restoreEnergy(), c => c.isAlive() && !c.useMana);
  }

  /**
   * Restore some mana to mana users, for example after an enemy died.
   */
  restoreManaPoints(amount: number) {
    this.forEachCharacter(c => c.spendEnergy(-amount), c => c.isAlive() && c.useMana);
  }

  /**
   * Target one random alive character from the first accessible row (i.e. the first row unless all characters from first row are dead).
   */
  targetOneFrontRowAliveCharacter(): Character[] {
    let rowIndex = 0;

    if (!this.rows[0].hasAliveCharacter()) {
      // No alive character on the front row, use the back row
      rowIndex = 1;
    }

    const aliveCharacters: Character[] = this.rows[rowIndex].characters.filter(c => c.isAlive());

    return [aliveCharacters[Math.floor(Math.random() * aliveCharacters.length)]];
  }

  /**
   * Target one random alive character.
   */
  targetOneAliveCharacter(): Character[] {
    const aliveCharacters: Character[] = this.targetAllAliveCharacters();

    return [aliveCharacters[Math.floor(Math.random() * aliveCharacters.length)]];
  }

  /**
   * Target all alive party characters.
   */
  targetAllAliveCharacters(): Character[] {
    const characters: Character[] = [];

    this.forEachCharacter(c => characters.push(c), c => c.isAlive());

    return characters;
  }

  /**
   * Get the character at the left of a given character.
   */
  getLeftCharacter(character: Character): Character | null {
    const row = this.getRowOfCharacter(character);

    // Position of the creature in its row
    const position: number = row.characters.indexOf(character);

    if (position > 0) {
      return row.characters[position - 1];
    } else {
      return null;
    }
  }

  /**
   * Get the character at the right of a given character.
   */
  getRightCharacter(character: Character): Character | null {
    const row = this.getRowOfCharacter(character);

    // Position of the creature in its row
    const position: number = row.characters.indexOf(character);

    if (position >= 0 && row.characters.length > position + 1) {
      return row.characters[position + 1];
    } else {
      return null;
    }
  }

  getRowOfCharacter(character: Character): PartyRow {
    return this.rows[character.distance - 1];
  }
}

/**
 * A standard balanced party.
 */
export class StandardParty extends Party {

  constructor() {
    super([
        new Character('Melkan', CreatureClass.WARRIOR, 4, 30, false, 50, 8, [
            new DefendTech(),
            new Strike('Strike', ElementType.PHYSICAL, 'Inflict 100% physical damage to the target.'),
            new Vengeance('Vengeance', SkillTargetType.OTHER_ALIVE, 10, true, 1, 1,
              'Inflict 80% to 160% physical damage to the target based on how low the character life is.', ElementType.PHYSICAL),
            new Berserk('Berserk', SkillTargetType.OTHER_ALIVE, 10, true, 1, 1,
              'Inflict 150% physical damage to the target and 50% to self.', ElementType.PHYSICAL, [1.5, 0.33]),
            new DamageAndSelfStatus('Guard Strike', SkillTargetType.OTHER_ALIVE, 10, true, 1, 1,
              'Inflict 50% physical damage to the target and reduce received damage by 20% during one turn.', ElementType.PHYSICAL, [0.5], [defend], 1),
            new DamageAndDot('Deep Wound', SkillTargetType.OTHER_ALIVE, 15, true, 1, 1,
              'Inflict 50% bleed damage to the target and 120% bleed damage over 3 rounds.', ElementType.BLEED, [0.5, 0.4], [bleed]),
            new Damage('Slash', SkillTargetType.OTHER_ALIVE_DOUBLE, 10, true, 1, 2,
              'Inflict 80% physical damage to two adjacent targets.', ElementType.PHYSICAL, [0.8]),
            new ApplyImprovement('War Cry', SkillTargetType.SAME_ALIVE_ALL, 10, false, 0, 3,
              'Increase the party attack by 20% during 2 rounds.', ElementType.PHYSICAL, [], [attackBonus], 2),
            new ApplyDeterioration('Intimidate', SkillTargetType.OTHER_ALIVE, 20, false, 1, 1,
              'Reduce the target attack by 20% during 3 rounds.', ElementType.PHYSICAL, [], [attackMalus]),
          ],
          [CreatureType.HUMANOID]),
        new Character('Arwin', CreatureClass.PALADIN, 4, 30, true, 50, 8, [
            new DefendMagic(),
            new Judgement('Judgement', SkillTargetType.OTHER_ALIVE, 5, true, 1, 1,
              'Inflict 40% to 120% light damage to the target based on how high the target life is.', ElementType.LIGHT),
            new Damage('Holy Strike', SkillTargetType.OTHER_ALIVE, 5, true, 1, 1,
              'Inflict 100% light damage.', ElementType.LIGHT),
            new Heal('Heal', SkillTargetType.SAME_ALIVE, 5, false, 0, 1,
              'Heal a character for 100% damage.', ElementType.LIGHT),
            new DualHeal('Dual Heal', SkillTargetType.SAME_ALIVE_OTHER, 10, false, 0, 2,
              'Heal a character for 100% damage and self for 80% damage.', ElementType.LIGHT, [1, 0.8]),
            new Sacrifice('Sacrifice', SkillTargetType.SAME_ALIVE_OTHER, 10, false, 0, 1,
              'Heal a character for 150% damage but damages self for 50% light damage.', ElementType.LIGHT, [1.5, 0.33]),
            new Regenerate('Regenerate', SkillTargetType.SAME_ALIVE, 5, false, 0, 1,
              'Heal a character for 50% damage and 120% damage over 3 rounds.', ElementType.LIGHT, [0.5, 0.4]),
            new Heal('Heal All', SkillTargetType.SAME_ALIVE_ALL, 15, false, 0, 3,
              'Heal all characters for 50% damage.', ElementType.LIGHT, [0.5]),
            new ApplyImprovement('Protection', SkillTargetType.SAME_ALIVE_ALL, 10, false, 0, 3,
              'Increase the party defense by 20% during 2 rounds.', ElementType.ARCANE, [], [defenseBonus], 2),
            new Revive('Revive', SkillTargetType.SAME_DEAD, 15, false, 0, 2,
              'Revive a character with 50% life.', ElementType.LIGHT),
          ],
          [CreatureType.UNDEAD])
      ],
      [
        new Character('Faren', CreatureClass.ARCHER, 4, 30, false, 50, 8, [
            new DefendTech(),
            new Shot('Shot', ElementType.PHYSICAL, 'Inflict 100% physical damage to the target.'),
            new DamageAndDot('Viper Shot', SkillTargetType.OTHER_ALIVE, 15, false, 2, 1,
              'Inflict 50% poison damage to the target and 120% poison damage over 3 rounds.', ElementType.POISON, [0.5, 0.4], [poison]),
            new ComboDamage('Combo Shot', SkillTargetType.OTHER_ALIVE, 10, false, 2, 1,
              'Inflict 80% physical damage then 120% then 160% when used on the same target during consecutive turns. Cannot be dodged.', ElementType.PHYSICAL, [0.8, 1.2, 1.6], [],
              Constants.COMBO_DURATION, [SkillModifierType.CANNOT_BE_DODGED]),
            new Execution('Final Shot', SkillTargetType.OTHER_ALIVE, 10, false, 2, 1,
              'Inflict 60% to 140% physical damage to the target based on how low the target life is.', ElementType.PHYSICAL),
            new Damage('Explosive Shot', SkillTargetType.OTHER_ALIVE_TRIPLE, 20, false, 2, 1,
              'Inflict 60% physical damage to three adjacent targets.', ElementType.PHYSICAL, [0.6]),
            new Damage('Barrage', SkillTargetType.OTHER_FIRST_ROW, 20, false, 1, 2,
              'Inflict 50% physical damage to first row enemies.', ElementType.PHYSICAL, [0.5]),
            new ApplyImprovement('Fire Trap', SkillTargetType.SAME_ALIVE, 10, false, 0, 2,
              'Protect the target with a fire trap that deals 75% damage to melee attackers over 3 rounds.', ElementType.PHYSICAL, [], [fireTrap]),
            new ApplyImprovement('Ice Trap', SkillTargetType.SAME_ALIVE, 10, false, 0, 2,
              'Protect the target with an ice trap that reduces the attack and defense of melee attackers by 20% during 3 rounds.', ElementType.PHYSICAL, [], [iceTrap]),
            new ApplyDeterioration('Crippling Shot', SkillTargetType.OTHER_ALIVE, 10, false, 2, 1,
              'Reduce the target defense by 20% during 3 rounds.', ElementType.PHYSICAL, [], [defenseMalus]),
          ],
          [CreatureType.BEAST]),
        new Character('Harika', CreatureClass.MAGE, 4, 30, true, 50, 8, [
            new DefendMagic(),
            new Damage('Lightning', SkillTargetType.OTHER_ALIVE, 5, false, 2, 1,
              'Inflict 100% lightning damage.', ElementType.LIGHTNING),
            new DamageAndDot('Burn', SkillTargetType.OTHER_ALIVE, 10, false, 2, 2,
              'Inflict 50% fire damage to the target and 150% fire damage over 3 rounds.', ElementType.FIRE, [0.5, 0.5], [burn]),
            new DamageAndStatus('Ice Blast', SkillTargetType.OTHER_ALIVE, 10, false, 2, 1,
              'Inflict 50% ice damage to the target and reduce the target attack and defense by 20% during one round.', ElementType.ICE, [0.5], [attackMalus, defenseMalus], 1),
            new Drain('Drain Life', SkillTargetType.OTHER_ALIVE, 10, false, 2, 1,
              'Inflict 50% dark damage to the target and heal self for 50% damage.', ElementType.DARK, [0.5, 1]),
            new Damage('Fireball', SkillTargetType.OTHER_ALIVE_TRIPLE, 10, false, 2, 3,
              'Inflict 80% fire damage to three adjacent targets.', ElementType.FIRE, [0.8]),
            new Damage('Inferno', SkillTargetType.OTHER_ALIVE_ALL, 10, false, 2, 3,
              'Inflict 30% fire damage to all enemies.', ElementType.FIRE, [0.3]),
            new ApplyImprovement('Blade Shield', SkillTargetType.SAME_ALIVE, 10, false, 0, 2,
              'Protect the target with blades that reflects 50% received melee damage for 3 rounds.', ElementType.ARCANE, [], [reflectMeleeDamage]),
            new AlterTime('Alter Time', SkillTargetType.ALIVE, 10, false, 2, 1,
              'Modify the duration of all statuses of the target by one turn.', ElementType.ARCANE)
          ],
          [CreatureType.ELEMENTAL])
      ]);
  }
}
