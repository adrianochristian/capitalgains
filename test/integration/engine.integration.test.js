import { CapitalGainsEngine, TaxAssessment } from '../../src/domain/services/capital-gains-engine.js';
import { Operation } from '../../src/domain/entities/operation.js';
import { Portfolio } from '../../src/domain/entities/portfolio.js';

describe('Integration: CapitalGainsEngine', () => {
  test('constructor validates initial portfolio type', () => {
    expect(() => new CapitalGainsEngine({ initialPortfolio: {} })).toThrow('Initial portfolio must be a Portfolio instance');
  });

  test('runs operations end-to-end with state progression', () => {
    const engine = new CapitalGainsEngine();
    const ops = [
      new Operation({ type: 'buy', unitPrice: 10, quantity: 1000 }), // buy, tax 0
      new Operation({ type: 'sell', unitPrice: 25, quantity: 100 }),  // trade value 2500 (<= 20000) => isento
      new Operation({ type: 'sell', unitPrice: 30, quantity: 800 }),  // trade value 24000 (> 20000) => tributável
    ];

    const results = engine.run(ops);
    expect(results).toHaveLength(3);
    results.forEach(r => expect(r).toBeInstanceOf(TaxAssessment));

    expect(results[0].getTax()).toBe(0);
    expect(results[1].getTax()).toBe(0);
    expect(results[2].getTax()).toBeGreaterThan(0);

    const finalPortfolio = results[2].getPortfolio();
    expect(finalPortfolio).toBeInstanceOf(Portfolio);
    expect(finalPortfolio.getQuantity()).toBe(100); // 1000 - 100 - 800
  });
});
