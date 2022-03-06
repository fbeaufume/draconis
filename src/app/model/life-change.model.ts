import {LifeChangeEfficiency, LifeChangeType} from "./common.model";

/**
 * A life change due to a damage or heal.
 */
export class LifeChange {

  /**
   * Is this a life gain or loss.
   */
  type: LifeChangeType;

  /**
   * The amount of life change. Always positive, use the type attribute to indicate if this is a life gain or loss.
   * The amount is rounded by this class, so no need for the caller to round it.
   */
  amount: number;

  /**
   * The efficiency (normal, critical, etc) of this life change.
   */
  efficiency: LifeChangeEfficiency = LifeChangeEfficiency.NORMAL;

  constructor(
    type: LifeChangeType,
    amount: number,
    efficiency: LifeChangeEfficiency = LifeChangeEfficiency.NORMAL
  ) {
    this.amount = Math.round(amount);
    this.efficiency = efficiency;
    this.type = type;
  }

  isGain(): boolean {
    return this.type == LifeChangeType.GAIN;
  }

  isCritical(): boolean {
    return this.efficiency == LifeChangeEfficiency.CRITICAL;
  }

  isSuccess(): boolean {
    return !this.isDodge();
  }

  isDodge(): boolean {
    return this.efficiency == LifeChangeEfficiency.DODGE;
  }

  /**
   * Return a signed amount, i.e. positive for a heal or negative for a damage
   */
  getSignedAmount(): number {
    if (this.isGain()) {
      return this.amount;
    } else {
      return -this.amount;
    }
  }
}

/**
 * A life gain due to a heal.
 */
export class LifeGain extends LifeChange {
  constructor(
    amount: number,
    efficiency: LifeChangeEfficiency = LifeChangeEfficiency.NORMAL
  ) {
    super(LifeChangeType.GAIN, amount, efficiency);
  }
}

/**
 * A life loss due to a damage.
 */
export class LifeLoss extends LifeChange {
  constructor(
    amount: number,
    efficiency: LifeChangeEfficiency = LifeChangeEfficiency.NORMAL
  ) {
    super(LifeChangeType.LOSS, amount, efficiency);
  }
}
