export class Quantity {
  #value;
  constructor(value) {
    if (typeof value !== 'bigint') {
      throw new Error('Quantity value must be a BigInt');
    }
    if (value <= 0n) {
      throw new Error('Quantity must be positive');
    }
    this.#value = value;
  }
  static fromNumber(value) {
    if (!Number.isFinite(value)) {
      throw new Error('Quantity value must be finite');
    }
    if (value <= 0) {
      throw new Error('Quantity must be positive');
    }
    
    const intValue = Math.floor(value);
    if (intValue <= 0) {
      throw new Error('Quantity must be positive after conversion to integer');
    }
    
    return new Quantity(BigInt(intValue));
  }
  getValue() {
    return this.#value;
  }
  toNumber() {
    return Number(this.#value);
  }
  add(other) {
    if (!(other instanceof Quantity)) {
      throw new Error('Cannot add non-Quantity value');
    }
    return new Quantity(this.#value + other.#value);
  }
  subtract(other) {
    if (!(other instanceof Quantity)) {
      throw new Error('Cannot subtract non-Quantity value');
    }
    const result = this.#value - other.#value;
    if (result <= 0n) {
      throw new Error('Quantity subtraction result must be positive');
    }
    return new Quantity(result);
  }
  multiply(factor) {
    if (typeof factor !== 'bigint') {
      throw new Error('Factor must be BigInt');
    }
    if (factor <= 0n) {
      throw new Error('Factor must be positive');
    }
    return new Quantity(this.#value * factor);
  }
  isGreaterThan(other) {
    if (!(other instanceof Quantity)) {
      throw new Error('Cannot compare with non-Quantity value');
    }
    return this.#value > other.#value;
  }
  isGreaterOrEqualTo(other) {
    if (!(other instanceof Quantity)) {
      throw new Error('Cannot compare with non-Quantity value');
    }
    return this.#value >= other.#value;
  }
  equals(other) {
    return other instanceof Quantity && this.#value === other.#value;
  }
  toString() {
    return `Quantity(${this.toNumber()})`;
  }
}
