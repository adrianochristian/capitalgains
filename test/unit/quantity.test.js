import { Quantity } from '../../src/domain/values/quantity.js';

describe('Quantity', () => {
  describe('constructor', () => {
    it('should create Quantity from positive BigInt', () => {
      const quantity = new Quantity(1000n);
      expect(quantity.getValue()).toBe(1000n);
    });

    it('should throw error for non-BigInt input', () => {
      expect(() => new Quantity(1000)).toThrow('Quantity value must be a BigInt');
      expect(() => new Quantity('1000')).toThrow('Quantity value must be a BigInt');
    });

    it('should throw error for non-positive values', () => {
      expect(() => new Quantity(0n)).toThrow('Quantity must be positive');
      expect(() => new Quantity(-100n)).toThrow('Quantity must be positive');
    });
  });

  describe('fromNumber', () => {
    it('should convert positive numbers correctly', () => {
      const quantity = Quantity.fromNumber(1000);
      expect(quantity.toNumber()).toBe(1000);
    });

    it('should handle decimal numbers by flooring', () => {
      const quantity = Quantity.fromNumber(1000.9);
      expect(quantity.toNumber()).toBe(1000);
    });

    it('should throw error for non-finite numbers', () => {
      expect(() => Quantity.fromNumber(NaN)).toThrow('Quantity value must be finite');
      expect(() => Quantity.fromNumber(Infinity)).toThrow('Quantity value must be finite');
    });

    it('should throw error for non-positive numbers', () => {
      expect(() => Quantity.fromNumber(0)).toThrow('Quantity must be positive');
      expect(() => Quantity.fromNumber(-100)).toThrow('Quantity must be positive');
    });

    it('should throw error if floored value is non-positive', () => {
      expect(() => Quantity.fromNumber(0.5)).toThrow('Quantity must be positive after conversion to integer');
    });
  });

  describe('arithmetic operations', () => {
    const qty1 = Quantity.fromNumber(1000);
    const qty2 = Quantity.fromNumber(500);

    describe('add', () => {
      it('should add two quantities', () => {
        const result = qty1.add(qty2);
        expect(result.toNumber()).toBe(1500);
      });

      it('should throw error for non-Quantity input', () => {
        expect(() => qty1.add(500)).toThrow('Cannot add non-Quantity value');
      });
    });

    describe('subtract', () => {
      it('should subtract quantities when result is positive', () => {
        const result = qty1.subtract(qty2);
        expect(result.toNumber()).toBe(500);
      });

      it('should throw error when result would be non-positive', () => {
        expect(() => qty2.subtract(qty1)).toThrow('Quantity subtraction result must be positive');
        expect(() => qty1.subtract(qty1)).toThrow('Quantity subtraction result must be positive');
      });

      it('should throw error for non-Quantity input', () => {
        expect(() => qty1.subtract(500)).toThrow('Cannot subtract non-Quantity value');
      });
    });

    describe('multiply', () => {
      it('should multiply by positive factor', () => {
        const result = qty1.multiply(3n);
        expect(result.toNumber()).toBe(3000);
      });

      it('should throw error for non-BigInt factor', () => {
        expect(() => qty1.multiply(3)).toThrow('Factor must be BigInt');
      });

      it('should throw error for non-positive factor', () => {
        expect(() => qty1.multiply(0n)).toThrow('Factor must be positive');
        expect(() => qty1.multiply(-2n)).toThrow('Factor must be positive');
      });
    });
  });

  describe('comparison methods', () => {
    const qty1 = Quantity.fromNumber(1000);
    const qty2 = Quantity.fromNumber(500);
    const qty3 = Quantity.fromNumber(1000);

    describe('isGreaterThan', () => {
      it('should compare correctly', () => {
        expect(qty1.isGreaterThan(qty2)).toBe(true);
        expect(qty2.isGreaterThan(qty1)).toBe(false);
        expect(qty1.isGreaterThan(qty3)).toBe(false);
      });

      it('should throw error for non-Quantity input', () => {
        expect(() => qty1.isGreaterThan(500)).toThrow('Cannot compare with non-Quantity value');
      });
    });

    describe('isGreaterOrEqualTo', () => {
      it('should compare correctly', () => {
        expect(qty1.isGreaterOrEqualTo(qty2)).toBe(true);
        expect(qty2.isGreaterOrEqualTo(qty1)).toBe(false);
        expect(qty1.isGreaterOrEqualTo(qty3)).toBe(true);
      });

      it('should throw error for non-Quantity input', () => {
        expect(() => qty1.isGreaterOrEqualTo(500)).toThrow('Cannot compare with non-Quantity value');
      });
    });

    describe('equals', () => {
      it('should check equality correctly', () => {
        expect(qty1.equals(qty3)).toBe(true);
        expect(qty1.equals(qty2)).toBe(false);
        expect(qty1.equals(null)).toBe(false);
        expect(qty1.equals('not quantity')).toBe(false);
      });
    });
  });

  describe('toString', () => {
    it('should return string representation', () => {
      const quantity = Quantity.fromNumber(1000);
      expect(quantity.toString()).toBe('Quantity(1000)');
    });
  });
});