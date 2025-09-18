export class TaxPolicy {
  static EXEMPTION_THRESHOLD = 20000;
  static TAX_RATE = 0.20;

  calculateTax(profit, tradeValue) {
    if (profit <= 0) return 0;
    if (tradeValue <= TaxPolicy.EXEMPTION_THRESHOLD) return 0;
    return profit * TaxPolicy.TAX_RATE;
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
