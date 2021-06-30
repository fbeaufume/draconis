import {CreatureType} from "./creature-type.model";

/**
 * Base class for all creatures, i.e. enemies and characters.
 */
export class Creature {

  /**
   * The current life.
   */
  life: number;

  constructor(
    public type: CreatureType,
    public lifeMax: number,
  ) {
    this.life = lifeMax;
  }
}
