import { TaxPolicy } from '../policies/tax-policy.js';

export class TaxCalculator {
  #taxPolicy;

  constructor({ taxPolicy } = {}) {
    this.#taxPolicy = taxPolicy || new TaxPolicy();
  }

  compute({ grossProfit, tradeValue, portfolio }) {
    let workingPortfolio = portfolio;
    let taxableProfit = 0;

    const policy = this.#taxPolicy;

    if (grossProfit === 0) {
      return { tax: 0, portfolio: workingPortfolio };
    }

    if (grossProfit > 0) {
      if (!policy.isTaxableTrade(tradeValue)) {
        return { tax: 0, portfolio: workingPortfolio };
      }

      const compensation = workingPortfolio.compensateLoss(grossProfit);
      workingPortfolio = compensation.portfolio;
      taxableProfit = grossProfit - compensation.compensated;
    }
    if (grossProfit < 0) {
      const loss = Math.abs(grossProfit);
      workingPortfolio = workingPortfolio.addLoss(loss);
      taxableProfit = 0;
    }

    const tax = policy.calculateTax(taxableProfit, tradeValue);
    return { tax, portfolio: workingPortfolio };
  }
}
