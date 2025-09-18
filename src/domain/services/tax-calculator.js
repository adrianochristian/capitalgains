import { Money } from '../values/money.js';
import { TaxPolicy } from '../policies/tax-policy.js';

export class TaxCalculator {
  #taxPolicy;

  constructor({ taxPolicy } = {}) {
    this.#taxPolicy = taxPolicy || new TaxPolicy();
  }

  compute({ grossProfit, tradeValue, portfolio }) {
    let workingPortfolio = portfolio;
    let taxableProfit = Money.zero();
    let compensatedLoss = Money.zero();

    const policy = this.#taxPolicy;
    const isTaxableSale = typeof policy.getExemptionThreshold === 'function'
      ? tradeValue.isGreaterThan(policy.getExemptionThreshold())
      : true;

    if (grossProfit.isPositive()) {
      if (!isTaxableSale) {
        return { tax: Money.zero(), taxableProfit: Money.zero(), compensatedLoss: Money.zero(), portfolio: workingPortfolio };
      }

      const compensation = workingPortfolio.compensateLoss(grossProfit);
      workingPortfolio = compensation.portfolio;
      compensatedLoss = compensation.compensated;
      taxableProfit = grossProfit.subtract(compensatedLoss);
    } else if (!grossProfit.isZero()) {
      const loss = grossProfit.abs();
      workingPortfolio = workingPortfolio.addLoss(loss);
      taxableProfit = Money.zero();
    }

    const tax = policy.calculateTax(taxableProfit, tradeValue);

    return { tax, taxableProfit, compensatedLoss, portfolio: workingPortfolio };
  }
}
