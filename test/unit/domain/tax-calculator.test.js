import { Portfolio } from '../../../src/domain/entities/portfolio.js';
import { TaxCalculator } from '../../../src/domain/services/tax-calculator.js';

describe('TaxCalculator', () => {
  test('grossProfit === 0 returns zero tax and same portfolio', () => {
    const calc = new TaxCalculator();
    const p = Portfolio.empty();
    const { tax, portfolio } = calc.compute({ grossProfit: 0, tradeValue: 10000, portfolio: p });
    expect(tax).toBe(0);
    expect(portfolio).toBe(p);
  });

  test('profit with non-taxable trade (<= threshold) yields zero tax', () => {
    const calc = new TaxCalculator();
    const p = Portfolio.empty().addLoss(100); // even with loss, non-taxable should not consume
    const { tax, portfolio } = calc.compute({ grossProfit: 1000, tradeValue: 20000, portfolio: p });
    expect(tax).toBe(0);
    expect(portfolio.getAccumulatedLoss()).toBe(100);
  });

  test('profit with taxable trade consumes loss then taxes remainder', () => {
    const calc = new TaxCalculator();
    let p = Portfolio.empty().addLoss(150); // accumulated loss 150
    const { tax, portfolio } = calc.compute({ grossProfit: 300, tradeValue: 30000, portfolio: p });
    // consume 150, taxable 150 => tax 30
    expect(tax).toBe(30);
    expect(portfolio.getAccumulatedLoss()).toBe(0);
  });

  test('profit with taxable trade and no loss taxes full amount', () => {
    const calc = new TaxCalculator();
    const p = Portfolio.empty();
    const { tax, portfolio } = calc.compute({ grossProfit: 1000, tradeValue: 50000, portfolio: p });
    expect(tax).toBe(200);
    expect(portfolio.getAccumulatedLoss()).toBe(0);
  });

  test('loss adds to accumulatedLoss', () => {
    const calc = new TaxCalculator();
    const p = Portfolio.empty();
    const { tax, portfolio } = calc.compute({ grossProfit: -75, tradeValue: 30000, portfolio: p });
    expect(tax).toBe(0);
    expect(portfolio.getAccumulatedLoss()).toBe(75);
  });
});

