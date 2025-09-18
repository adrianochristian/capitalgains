import { Money } from '../../src/domain/values/money.js';

describe('Money', () => {
  describe('constructor', () => {
    it('should create Money from BigInt cents', () => {
      const money = new Money(1234n);
      expect(money.getCents()).toBe(1234n);
    });

    it('should throw error for non-BigInt input', () => {
      expect(() => new Money(123)).toThrow('Money cents must be a BigInt');
      expect(() => new Money('123')).toThrow('Money cents must be a BigInt');
    });
  });

  describe('fromNumber', () => {
    it('should convert decimal numbers correctly', () => {
      const money = Money.fromNumber(12.34);
      expect(money.toNumber()).toBe(12.34);
    });

    it('should handle zero correctly', () => {
      const money = Money.fromNumber(0);
      expect(money.toNumber()).toBe(0);
      expect(money.isZero()).toBe(true);
    });

    it('should handle negative numbers', () => {
      const money = Money.fromNumber(-10.50);
      expect(money.toNumber()).toBe(-10.50);
    });

    it('should round properly (half-up)', () => {
      const money1 = Money.fromNumber(10.235);
      expect(money1.toNumber()).toBe(10.24);

      const money2 = Money.fromNumber(10.234);
      expect(money2.toNumber()).toBe(10.23);
    });

    it('should throw error for non-finite numbers', () => {
      expect(() => Money.fromNumber(NaN)).toThrow('Money value must be finite');
      expect(() => Money.fromNumber(Infinity)).toThrow('Money value must be finite');
      expect(() => Money.fromNumber(-Infinity)).toThrow('Money value must be finite');
    });
  });

  describe('zero', () => {
    it('should create zero Money', () => {
      const zero = Money.zero();
      expect(zero.isZero()).toBe(true);
      expect(zero.toNumber()).toBe(0);
    });
  });

  describe('arithmetic operations', () => {
    const money1 = Money.fromNumber(10.50);
    const money2 = Money.fromNumber(5.25);

    describe('add', () => {
      it('should add two Money values', () => {
        const result = money1.add(money2);
        expect(result.toNumber()).toBe(15.75);
      });

      it('should throw error for non-Money input', () => {
        expect(() => money1.add(10)).toThrow('Cannot add non-Money value');
      });
    });

    describe('subtract', () => {
      it('should subtract two Money values', () => {
        const result = money1.subtract(money2);
        expect(result.toNumber()).toBe(5.25);
      });

      it('should handle negative results', () => {
        const result = money2.subtract(money1);
        expect(result.toNumber()).toBe(-5.25);
      });

      it('should throw error for non-Money input', () => {
        expect(() => money1.subtract(10)).toThrow('Cannot subtract non-Money value');
      });
    });

    describe('multiply', () => {
      it('should multiply by BigInt quantity', () => {
        const result = money1.multiply(3n);
        expect(result.toNumber()).toBe(31.50);
      });

      it('should handle zero multiplication', () => {
        const result = money1.multiply(0n);
        expect(result.isZero()).toBe(true);
      });

      it('should throw error for non-BigInt input', () => {
        expect(() => money1.multiply(3)).toThrow('Quantity must be BigInt');
      });
    });

    describe('divide', () => {
      it('should divide by BigInt quantity', () => {
        const money = Money.fromNumber(10.00);
        const result = money.divide(4n);
        expect(result.toNumber()).toBe(2.50);
      });

    it('should handle rounding in division', () => {
      const money = Money.fromNumber(10.00);
      const result = money.divide(3n);
      expect(result.toNumber()).toBe(3.33);
    });
    
    it('should round up when remainder > half', () => {
      expect(Money.fromNumber(0.05).divide(3n).toNumber()).toBe(0.02);
    });

      it('should throw error for division by zero', () => {
        expect(() => money1.divide(0n)).toThrow('Cannot divide by zero');
      });

      it('should throw error for non-BigInt input', () => {
        expect(() => money1.divide(2)).toThrow('Quantity must be BigInt');
      });
    });
  });

  describe('comparison methods', () => {
    const money1 = Money.fromNumber(10.50);
    const money2 = Money.fromNumber(5.25);
    const money3 = Money.fromNumber(10.50);

    describe('isGreaterThan', () => {
      it('should compare correctly', () => {
        expect(money1.isGreaterThan(money2)).toBe(true);
        expect(money2.isGreaterThan(money1)).toBe(false);
        expect(money1.isGreaterThan(money3)).toBe(false);
      });

      it('should throw error for non-Money input', () => {
        expect(() => money1.isGreaterThan(10)).toThrow('Cannot compare with non-Money value');
      });
    });

    describe('isLessOrEqualTo', () => {
      it('should compare correctly', () => {
        expect(money2.isLessOrEqualTo(money1)).toBe(true);
        expect(money1.isLessOrEqualTo(money2)).toBe(false);
        expect(money1.isLessOrEqualTo(money3)).toBe(true);
      });

      it('should throw error for non-Money input', () => {
        expect(() => money1.isLessOrEqualTo(10)).toThrow('Cannot compare with non-Money value');
      });
    });

    describe('equals', () => {
      it('should check equality correctly', () => {
        expect(money1.equals(money3)).toBe(true);
        expect(money1.equals(money2)).toBe(false);
        expect(money1.equals(null)).toBe(false);
        expect(money1.equals('not money')).toBe(false);
      });
    });
  });

  describe('state checking methods', () => {
    it('should check if positive', () => {
      expect(Money.fromNumber(10.50).isPositive()).toBe(true);
      expect(Money.fromNumber(0).isPositive()).toBe(false);
      expect(Money.fromNumber(-5.25).isPositive()).toBe(false);
    });

    it('should check if zero', () => {
      expect(Money.zero().isZero()).toBe(true);
      expect(Money.fromNumber(0).isZero()).toBe(true);
      expect(Money.fromNumber(0.001).isZero()).toBe(true);
      expect(Money.fromNumber(0.01).isZero()).toBe(false);
    });
  });

  describe('abs', () => {
    it('should return absolute value', () => {
      const positive = Money.fromNumber(10.50);
      const negative = Money.fromNumber(-10.50);
      
      expect(positive.abs().equals(positive)).toBe(true);
      expect(negative.abs().toNumber()).toBe(10.50);
    });
  });

  describe('toString', () => {
    it('should return string representation', () => {
      const money = Money.fromNumber(10.50);
      expect(money.toString()).toBe('Money(10.5)');
    });
  });
});
