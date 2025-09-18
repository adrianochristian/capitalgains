import { Portfolio } from '../entities/portfolio.js';
import { Money } from '../values/money.js';
import { TaxPolicy } from '../policies/tax-policy.js';
import { Ok, Err } from '../results/result.js';
import { DomainErrors } from '../errors/errors.js';
import { OperationProcessor } from './operation-processor.js';
import { TaxCalculator } from './tax-calculator.js';
export class TaxResult {
  #tax;
  #portfolio;

  constructor(tax, portfolio) {
    if (!(tax instanceof Money)) {
      throw new Error('Tax must be a Money instance');
    }
    if (!(portfolio instanceof Portfolio)) {
      throw new Error('Portfolio must be a Portfolio instance');
    }

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
      tax: this.#tax.toNumber()
    };
  }
}
export class TaxSimulator {
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
  processOperations(operations) {
    if (!Array.isArray(operations)) {
      return Err.of(DomainErrors.internalError('Operations must be an array'));
    }

    const results = [];
    let currentPortfolio = this.#portfolio;

    for (let i = 0; i < operations.length; i++) {
      const operation = operations[i];
      const result = this.processOperation(operation, currentPortfolio, i);
      
      if (result.isErr()) {
        return result;
      }

      const taxResult = result.getValue();
      results.push(taxResult);
      currentPortfolio = taxResult.getPortfolio();
    }

    this.#portfolio = currentPortfolio;
    return Ok.of(results);
  }

  processOperation(operation, portfolio, index) {
    try {
      if (operation.isBuy()) {
        const operationResult = this.#operationProcessor.processBuy(operation, portfolio);
        if (operationResult.isErr()) return operationResult;
        const { portfolio: newPortfolio } = operationResult.getValue();
        const taxResult = new TaxResult(Money.zero(), newPortfolio);
        return Ok.of(taxResult);
      } else if (operation.isSell()) {
        const operationResult = this.#operationProcessor.processSell(operation, portfolio, index);
        if (operationResult.isErr()) return operationResult;
        const { portfolio: midPortfolio, tradeValue, grossProfit } = operationResult.getValue();
        const { tax, portfolio: finalPortfolio } = this.#taxCalculator.compute({
          grossProfit,
          tradeValue,
          portfolio: midPortfolio
        });
        const taxResult = new TaxResult(tax, finalPortfolio);
        return Ok.of(taxResult);
      } else {
        return Err.of(DomainErrors.internalError('Unknown operation type', { index }));
      }
    } catch (error) {
      return Err.of(DomainErrors.internalError(error.message, { index }));
    }
  }



  reset() {
    this.#portfolio = Portfolio.empty();
  }
  clone() {
    return new TaxSimulator({
      initialPortfolio: this.#portfolio
    });
  }
  toString() {
    return `TaxSimulator(${this.#portfolio})`;
  }
}
