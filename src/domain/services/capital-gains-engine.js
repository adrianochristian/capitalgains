import { Portfolio } from '../entities/portfolio.js';
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
}
export class CapitalGainsEngine {
  #portfolio;
  #operationProcessor;
  #taxCalculator;

  constructor({ initialPortfolio = Portfolio.empty() } = {}) {
    if (!(initialPortfolio instanceof Portfolio)) {
      throw new Error('Initial portfolio must be a Portfolio instance');
    }

    this.#portfolio = initialPortfolio;
    this.#operationProcessor = new OperationProcessor();
    this.#taxCalculator = new TaxCalculator();
  }

  run(operations) {
    const results = [];
    let currentPortfolio = this.#portfolio;

    for (const operation of operations) {
      const taxResult = this.evaluateOperation(operation, currentPortfolio);
      results.push(taxResult);
      currentPortfolio = taxResult.getPortfolio();
    }

    this.#portfolio = currentPortfolio;
    return results;
  }

  evaluateOperation(operation, portfolio) {
    if (operation.isBuy()) {
      const { portfolio: newPortfolio } = this.#operationProcessor.processBuy(operation, portfolio);
      return new TaxAssessment(0, newPortfolio);
    }
    const { portfolio: midPortfolio, tradeValue, grossProfit } = this.#operationProcessor.processSell(operation, portfolio);
    const { tax, portfolio: finalPortfolio } = this.#taxCalculator.compute({ grossProfit, tradeValue, portfolio: midPortfolio });
    return new TaxAssessment(tax, finalPortfolio);
  }
}
