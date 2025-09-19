export class TaxPolicy {
  static EXEMPTION_THRESHOLD = 20000;
  static TAX_RATE = 0.20;

  calculateTax(profit, tradeValue) {
    if (profit <= 0) return 0;
    if (tradeValue <= TaxPolicy.EXEMPTION_THRESHOLD) return 0;
    return this.roundMoney(profit * TaxPolicy.TAX_RATE);
  }

  isTaxableTrade(tradeValue) {
    return tradeValue > TaxPolicy.EXEMPTION_THRESHOLD;
  }

  roundMoney(amount) {
    if (!Number.isFinite(amount)) return 0;
    return Math.round((amount + Number.EPSILON) * 100) / 100;
  }
}
