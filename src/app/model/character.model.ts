import {CreatureClass} from "./common.model";
import {Skill} from "./skill.model";
import {Creature} from "./creature.model";


/**
 * A party character.
 */
export class Character extends Creature {

  constructor(
    name: string,
    // Character class, could be an enum
    clazz: CreatureClass,
    public level: number,
    lifeMax: number,
    // True for mana based character class, false for tech based
    public useMana: boolean,
    energyMax: number,
    power: number,
    skills: Skill[],
  ) {
    super(name, clazz, lifeMax, energyMax, power, skills);

    this.restoreEnergy();
  }

  isCharacter(): boolean {
    return true;
  }

  isEnemy(): boolean {
    return false;
  }

  restoreEnergy() {
    this.energy = this.energyMax;
    this.updateEnergyPercent();
  }
}
