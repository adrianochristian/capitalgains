import { TaxCalculator } from '../../src/domain/services/tax-calculator.js';
import { Money } from '../../src/domain/values/money.js';
import { Portfolio } from '../../src/domain/entities/portfolio.js';

function makeRegistry(policy) { return { getTaxPolicy: () => policy }; }

describe('TaxCalculator', () => {
  it('does not consume loss on tax-exempt sale', () => {
    const policy = {
      getExemptionThreshold: () => Money.fromNumber(20000),
      calculateTax: () => Money.fromNumber(9999),
    };
    const calc = new TaxCalculator({ policyRegistry: makeRegistry(policy) });
    const portfolio = new Portfolio({ quantity: null, averageCost: Money.zero(), accumulatedLoss: Money.fromNumber(100) });
    const res = calc.compute({ grossProfit: Money.fromNumber(10), tradeValue: Money.fromNumber(20000), portfolio });
    expect(res.tax.toNumber()).toBe(0);
    expect(res.portfolio.getAccumulatedLoss().toNumber()).toBe(100);
  });

  it('assumes taxable when policy has no exemption method (fallback branch)', () => {
    const policy = { calculateTax: (profit) => profit };
    const calc = new TaxCalculator({ taxPolicy: policy });
    const portfolio = Portfolio.empty();
    const res = calc.compute({ grossProfit: Money.fromNumber(10), tradeValue: Money.fromNumber(1), portfolio });
    expect(res.tax.toNumber()).toBe(10);
  });

  it('positive profit with policy exemption method and taxable trade', () => {
    const policy = {
      getExemptionThreshold: () => Money.fromNumber(20000),
      calculateTax: (profit) => profit,
    };
    const calc = new TaxCalculator({ taxPolicy: policy });
    const portfolio = Portfolio.empty();
    const res = calc.compute({ grossProfit: Money.fromNumber(10), tradeValue: Money.fromNumber(30000), portfolio });
    expect(res.tax.toNumber()).toBe(10);
  });

  it('constructor default dependency path', () => {
    const calc = new TaxCalculator();
    const res = calc.compute({ grossProfit: Money.zero(), tradeValue: Money.fromNumber(1), portfolio: Portfolio.empty() });
    expect(res.tax.toNumber()).toBe(0);
  });

  it('handles zero and negative grossProfit branches', () => {
    const policy = {
      getExemptionThreshold: () => Money.fromNumber(20000),
      calculateTax: (profit) => Money.fromNumber(profit.toNumber() * 0.2),
    };
    const calc = new TaxCalculator({ policyRegistry: makeRegistry(policy) });
    const portfolio = Portfolio.empty();
    const r0 = calc.compute({ grossProfit: Money.zero(), tradeValue: Money.fromNumber(30000), portfolio });
    expect(r0.tax.toNumber()).toBe(0);
    const rn = calc.compute({ grossProfit: Money.fromNumber(-100), tradeValue: Money.fromNumber(30000), portfolio });
    expect(rn.tax.toNumber()).toBe(0);
  });
});
