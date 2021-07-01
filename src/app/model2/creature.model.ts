import {CreatureType} from "./creature-type.model";

/**
 * Base class for all creatures, i.e. enemies and characters.
 */
export class Creature {

  type: CreatureType;

  /**
   * The base creature name such as 'Bear'.
   * Used to build the effective name, such as 'Bear A'.
   */
  name: string;

  /**
   * The maximum life.
   */
  lifeMax: number;

  /**
   * The current life.
   */
  life: number;

  constructor(
    type: CreatureType,
    name: string,
    lifeMax: number,
  ) {
    this.type = type;
    this.name = name;
    this.lifeMax = lifeMax;
    this.life = lifeMax;
  }

  isAlive(): boolean {
    return this.life > 0;
  }

  isDead(): boolean {
    return !this.isAlive();
  }

  isDamaged(): boolean {
    return this.life < this.lifeMax;
  }
}
