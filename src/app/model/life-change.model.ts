import {LifeChangeEfficiency, LifeChangeType} from "./common.model";

/**
 * A life change due to a damage or heal.
 */
export class LifeChange {

    constructor(
        // The amount of life change, always positive
        public amount: number,
        public efficiency: LifeChangeEfficiency = LifeChangeEfficiency.NORMAL,
        public type: LifeChangeType
    ) {
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
        super(amount, efficiency, LifeChangeType.GAIN);
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
        super(amount, efficiency, LifeChangeType.LOSS);
    }
}
