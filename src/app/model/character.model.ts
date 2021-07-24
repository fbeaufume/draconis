import {CreatureClass, CreatureType} from "./common.model";
import {Skill} from "./skill.model";
import {Creature} from "./creature.model";


/**
 * A party character.
 */
export class Character extends Creature {

  /**
   * The character level.
   */
  level: number;

  /**
   * True for mana based character class, false for tech based.
   */
  useMana: boolean;

  constructor(
    name: string,
    // Character class, could be an enum
    clazz: CreatureClass,
    level: number,
    lifeMax: number,
    useMana: boolean,
    energyMax: number,
    power: number,
    skills: Skill[],
  ) {
    super(CreatureType.HUMANOID, name, clazz, lifeMax, energyMax, power, skills);
    this.level = level;
    this.useMana = useMana;
    this.restoreEnergy();
  }

  isCharacter(): boolean {
    return true;
  }

  isEnemy(): boolean {
    return false;
  }

  isEndOfRound(): boolean {
    return false;
  }

  restoreEnergy() {
    this.energy = this.energyMax;
    this.updateEnergyPercent();
  }
}
