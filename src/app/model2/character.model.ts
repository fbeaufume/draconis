import {Creature} from "./creature.model";
import {CreatureType} from "./creature-type.model";

/**
 * A party character.
 */
export class Character extends Creature {

  constructor(
    name: string,
    lifeMax: number
  ) {
    super(CreatureType.HUMANOID, name, lifeMax);
  }
}
