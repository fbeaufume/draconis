import {Creature} from "./creature.model";
import {CreatureType} from "./creature-type.model";

/**
 * An enemy creature.
 */
export class Enemy extends Creature {

  constructor(
    type: CreatureType,
    name: string,
    lifeMax: number,
  ) {
    super(type, name, lifeMax);
  }
}
