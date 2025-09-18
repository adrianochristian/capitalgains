export class Money {
  #cents;
  constructor(cents) {
    if (typeof cents !== 'bigint') {
      throw new Error('Money cents must be a BigInt');
    }
    this.#cents = cents;
  }
  static fromNumber(value) {
    if (!Number.isFinite(value)) {
      throw new Error('Money value must be finite');
    }
    
    const cents = Math.floor(value * 100 + 0.5);
    return new Money(BigInt(cents));
  }
  static zero() {
    return new Money(0n);
  }
  getCents() {
    return this.#cents;
  }
  toNumber() {
    return Number(this.#cents) / 100;
  }
  add(other) {
    if (!(other instanceof Money)) {
      throw new Error('Cannot add non-Money value');
    }
    return new Money(this.#cents + other.#cents);
  }
  subtract(other) {
    if (!(other instanceof Money)) {
      throw new Error('Cannot subtract non-Money value');
    }
    return new Money(this.#cents - other.#cents);
  }
  multiply(quantity) {
    if (typeof quantity !== 'bigint') {
      throw new Error('Quantity must be BigInt');
    }
    return new Money(this.#cents * quantity);
  }
  divide(quantity) {
    if (typeof quantity !== 'bigint') {
      throw new Error('Quantity must be BigInt');
    }
    if (quantity === 0n) {
      throw new Error('Cannot divide by zero');
    }
    
    const quotient = this.#cents / quantity;
    const remainder = this.#cents % quantity;
    const halfDivisor = quantity / 2n;
    
    if (remainder > halfDivisor) {
      return new Money(quotient + 1n);
    }
    return new Money(quotient);
  }
  isGreaterThan(other) {
    if (!(other instanceof Money)) {
      throw new Error('Cannot compare with non-Money value');
    }
    return this.#cents > other.#cents;
  }
  isLessOrEqualTo(other) {
    if (!(other instanceof Money)) {
      throw new Error('Cannot compare with non-Money value');
    }
    return this.#cents <= other.#cents;
  }
  equals(other) {
    return other instanceof Money && this.#cents === other.#cents;
  }
  isPositive() {
    return this.#cents > 0n;
  }
  isZero() {
    return this.#cents === 0n;
  }
  abs() {
    return new Money(this.#cents < 0n ? -this.#cents : this.#cents);
  }
  toString() {
    return `Money(${this.toNumber()})`;
  }
}
