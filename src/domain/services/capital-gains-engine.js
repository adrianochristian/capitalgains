import { Portfolio } from '../entities/portfolio.js';
import { TaxPolicy } from '../policies/tax-policy.js';
import { OperationProcessor } from './operation-processor.js';
import { TaxCalculator } from './tax-calculator.js';
export class TaxAssessment {
  #tax;
  #portfolio;

  constructor(tax, portfolio) {
    this.#tax = tax;
    this.#portfolio = portfolio;
  }

  getTax() {
    return this.#tax;
  }
  getPortfolio() {
    return this.#portfolio;
  }
  toJSON() {
    return {
      tax: this.#tax
    };
  }
}
export class CapitalGainsEngine {
  #portfolio;
  #taxPolicy;
  #operationProcessor;
  #taxCalculator;

  constructor({ initialPortfolio = Portfolio.empty() } = {}) {
    if (!(initialPortfolio instanceof Portfolio)) {
      throw new Error('Initial portfolio must be a Portfolio instance');
    }

    this.#portfolio = initialPortfolio;
    this.#taxPolicy = new TaxPolicy();
    this.#operationProcessor = new OperationProcessor();
    this.#taxCalculator = new TaxCalculator({ taxPolicy: this.#taxPolicy });
  }

  getPortfolio() {
    return this.#portfolio;
  }
  run(operations) {
    const results = [];
    let currentPortfolio = this.#portfolio;

    for (let i = 0; i < operations.length; i++) {
      const operation = operations[i];
      const taxResult = this.evaluateOperation(operation, currentPortfolio, i);
      results.push(taxResult);
      currentPortfolio = taxResult.getPortfolio();
    }

    this.#portfolio = currentPortfolio;
    return results;
  }

  evaluateOperation(operation, portfolio, index) {
    if (operation.isBuy()) {
      const { portfolio: newPortfolio } = this.#operationProcessor.processBuy(operation, portfolio);
      return new TaxAssessment(0, newPortfolio);
    }
    const { portfolio: midPortfolio, tradeValue, grossProfit } = this.#operationProcessor.processSell(operation, portfolio, index);
    const { tax, portfolio: finalPortfolio } = this.#taxCalculator.compute({ grossProfit, tradeValue, portfolio: midPortfolio });
    return new TaxAssessment(tax, finalPortfolio);
  }



  reset() {
    this.#portfolio = Portfolio.empty();
  }
  clone() {
    return new CapitalGainsEngine({
      initialPortfolio: this.#portfolio
    });
  }
  toString() {
    return `CapitalGainsEngine(${this.#portfolio})`;
  }
}
