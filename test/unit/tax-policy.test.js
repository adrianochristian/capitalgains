import { TaxPolicy } from '../../src/domain/policies/tax-policy.js';
import { Money } from '../../src/domain/values/money.js';

describe('TaxPolicy', () => {
  let policy;

  beforeEach(() => {
    policy = new TaxPolicy();
  });

  describe('calculateTax', () => {
    it('should return zero tax for losses', () => {
      const loss = Money.fromNumber(-100);
      const tradeValue = Money.fromNumber(25000);
      
      const tax = policy.calculateTax(loss, tradeValue);
      expect(tax.isZero()).toBe(true);
    });

    it('should return zero tax for zero profit', () => {
      const zeroProfit = Money.zero();
      const tradeValue = Money.fromNumber(25000);
      
      const tax = policy.calculateTax(zeroProfit, tradeValue);
      expect(tax.isZero()).toBe(true);
    });

    it('should return zero tax when trade value is within exemption threshold', () => {
      const profit = Money.fromNumber(1000);
      const tradeValue = Money.fromNumber(20000);
      
      const tax = policy.calculateTax(profit, tradeValue);
      expect(tax.isZero()).toBe(true);
    });

    it('should return zero tax when trade value is below exemption threshold', () => {
      const profit = Money.fromNumber(1000);
      const tradeValue = Money.fromNumber(15000);
      
      const tax = policy.calculateTax(profit, tradeValue);
      expect(tax.isZero()).toBe(true);
    });

    it('should calculate 20% tax when trade value exceeds exemption threshold', () => {
      const profit = Money.fromNumber(1000);
      const tradeValue = Money.fromNumber(25000);
      
      const tax = policy.calculateTax(profit, tradeValue);
      expect(tax.toNumber()).toBe(200);
    });

    it('should calculate tax correctly for large profits', () => {
      const profit = Money.fromNumber(5000);
      const tradeValue = Money.fromNumber(50000);
      
      const tax = policy.calculateTax(profit, tradeValue);
      expect(tax.toNumber()).toBe(1000);
    });

    it('should handle edge case at exemption boundary', () => {
      const profit = Money.fromNumber(100);
      const tradeValue = Money.fromNumber(20000.01);
      
      const tax = policy.calculateTax(profit, tradeValue);
      expect(tax.toNumber()).toBe(20);
    });

    it('should throw error for invalid profit parameter', () => {
      const tradeValue = Money.fromNumber(25000);
      
      expect(() => policy.calculateTax(null, tradeValue)).toThrow('Profit must be a Money instance');
      expect(() => policy.calculateTax(1000, tradeValue)).toThrow('Profit must be a Money instance');
    });

    it('should throw error for invalid trade value parameter', () => {
      const profit = Money.fromNumber(1000);
      
      expect(() => policy.calculateTax(profit, null)).toThrow('Trade value must be a Money instance');
      expect(() => policy.calculateTax(profit, 25000)).toThrow('Trade value must be a Money instance');
    });
  });

  describe('getters', () => {
    it('should return correct exemption threshold', () => {
      const threshold = policy.getExemptionThreshold();
      expect(threshold.toNumber()).toBe(20000);
    });

    it('should return correct tax rate', () => {
      const rate = policy.getTaxRate();
      expect(rate).toBe(0.20);
    });

    it('should return correct policy name', () => {
      const name = policy.getName();
      expect(name).toBe('TaxPolicy');
    });
  });

  describe('toString', () => {
    it('should return meaningful string representation', () => {
      const str = policy.toString();
      expect(str).toContain('TaxPolicy');
      expect(str).toContain('20000');
      expect(str).toContain('20%');
    });
  });
});
