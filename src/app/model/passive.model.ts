// Passive skill related classes

// TODO FBE replace the passives by statuses that are hidden and never (or after a very long time) expire
/**
 * Base class for passives.
 */
export class Passive {
}

/**
 * A regeneration passive, i.e. a heal over time.
 */
export class Regeneration extends Passive {

  powerLevel: number;

  constructor(powerLevel: number) {
    super();
    this.powerLevel = powerLevel;
  }
}

/**
 * A passive that reflects part of damages received from a melee attack.
 */
export class DamageReflection extends Passive {

  /**
   * The percentage of reflected damages, e.g. 0.5 means that 50% of received damages are reflected.
   */
  powerLevel: number;

  constructor(powerLevel: number) {
    super();
    this.powerLevel = powerLevel;
  }
}
