import { TaxResult, TaxSimulator } from '../../src/domain/services/simulator.js';
import { Money } from '../../src/domain/values/money.js';
import { Portfolio } from '../../src/domain/entities/portfolio.js';

describe('TaxResult and Simulator extras', () => {
  it('TaxResult validates constructor and toJSON', () => {
    const tr = new TaxResult(Money.fromNumber(1), Portfolio.empty());
    expect(tr.getTax().toNumber()).toBe(1);
    expect(tr.toJSON()).toEqual({ tax: 1 });
    expect(() => new TaxResult(/** @type any */(1), Portfolio.empty())).toThrow('Tax must be a Money instance');
    expect(() => new TaxResult(Money.zero(), /** @type any */(null))).toThrow('Portfolio must be a Portfolio instance');
  });

  it('Simulator toString returns a string', () => {
    const s = new TaxSimulator();
    expect(typeof s.toString()).toBe('string');
  });
});

