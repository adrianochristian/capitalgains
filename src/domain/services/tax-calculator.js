import { TaxPolicy } from '../policies/tax-policy.js';

export class TaxCalculator {
  #taxPolicy;

  constructor({ taxPolicy } = {}) {
    this.#taxPolicy = taxPolicy || new TaxPolicy();
  }

  compute({ grossProfit, tradeValue, portfolio }) {
    let workingPortfolio = portfolio;
    let taxableProfit = 0;
    let compensatedLoss = 0;

    const policy = this.#taxPolicy;
    const isTaxableSale = tradeValue > policy.getExemptionThreshold();

    if (grossProfit > 0) {
      if (!isTaxableSale) {
        return { tax: 0, taxableProfit: 0, compensatedLoss: 0, portfolio: workingPortfolio };
      }

      const compensation = workingPortfolio.compensateLoss(grossProfit);
      workingPortfolio = compensation.portfolio;
      compensatedLoss = compensation.compensated;
      taxableProfit = grossProfit - compensatedLoss;
    } else if (grossProfit !== 0) {
      const loss = Math.abs(grossProfit);
      workingPortfolio = workingPortfolio.addLoss(loss);
      taxableProfit = 0;
    }

    const tax = policy.calculateTax(taxableProfit, tradeValue);

    return { tax, taxableProfit, compensatedLoss, portfolio: workingPortfolio };
  }
}
