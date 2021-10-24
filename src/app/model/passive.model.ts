// Passive skill related classes

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

export class Thorn extends Passive {

  powerLevel: number;

  constructor(powerLevel: number) {
    super();
    this.powerLevel = powerLevel;
  }
}
