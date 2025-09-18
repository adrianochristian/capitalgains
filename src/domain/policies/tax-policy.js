import { Money } from '../values/money.js';

export class TaxPolicy {
  static EXEMPTION_THRESHOLD = Money.fromNumber(20000);
  static TAX_RATE = 0.20;

  calculateTax(profit, tradeValue) {
    if (!(profit instanceof Money)) {
      throw new Error('Profit must be a Money instance');
    }
    if (!(tradeValue instanceof Money)) {
      throw new Error('Trade value must be a Money instance');
    }

    if (!profit.isPositive()) {
      return Money.zero();
    }

    if (tradeValue.isLessOrEqualTo(TaxPolicy.EXEMPTION_THRESHOLD)) {
      return Money.zero();
    }

    const taxRatePercentage = BigInt(Math.floor(TaxPolicy.TAX_RATE * 100));
    const taxInCents = profit.getCents() * taxRatePercentage / 100n;
    return new Money(taxInCents);
  }

  getName() {
    return 'TaxPolicy';
  }

  getExemptionThreshold() {
    return TaxPolicy.EXEMPTION_THRESHOLD;
  }

  getTaxRate() {
    return TaxPolicy.TAX_RATE;
  }

  toString() {
    return `${this.getName()}(exemption: ${this.getExemptionThreshold()}, rate: ${this.getTaxRate() * 100}%)`;
  }
}
