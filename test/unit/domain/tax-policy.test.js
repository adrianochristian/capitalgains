import { TaxPolicy } from '../../../src/domain/policies/tax-policy.js';

describe('TaxPolicy', () => {
  test('calculateTax returns 0 when profit <= 0', () => {
    const policy = new TaxPolicy();
    expect(policy.calculateTax(0, 1)).toBe(0);
    expect(policy.calculateTax(-1, 50000)).toBe(0);
  });

  test('calculateTax returns 0 when tradeValue <= threshold', () => {
    const policy = new TaxPolicy();
    expect(policy.calculateTax(1000, 20000)).toBe(0);
  });

  test('calculateTax applies rate and rounds', () => {
    const policy = new TaxPolicy();
    // profit 1000 -> tax 200
    expect(policy.calculateTax(1000, 30000)).toBe(200);
    // rounding behavior example
    expect(policy.roundMoney(1.005)).toBe(1.01);
  });

  test('isTaxableTrade checks threshold correctly', () => {
    const policy = new TaxPolicy();
    expect(policy.isTaxableTrade(20000)).toBe(false);
    expect(policy.isTaxableTrade(20000.01)).toBe(true);
  });

  test('roundMoney normalizes non-finite to 0', () => {
    const policy = new TaxPolicy();
    expect(policy.roundMoney(NaN)).toBe(0);
    expect(policy.roundMoney(Infinity)).toBe(0);
    expect(policy.roundMoney(-Infinity)).toBe(0);
  });
});

