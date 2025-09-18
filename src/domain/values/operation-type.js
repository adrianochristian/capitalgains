export class OperationType {
  static BUY = 'BUY';
  static SELL = 'SELL';

  #type;

  constructor(type) {
    if (type !== OperationType.BUY && type !== OperationType.SELL) {
      throw new Error(`Invalid operation type: ${type}. Must be BUY or SELL`);
    }
    this.#type = type;
  }

  static fromString(value) {
    if (typeof value !== 'string') {
      throw new Error('Operation type must be a string');
    }
    
    const normalized = value.toLowerCase();
    switch (normalized) {
      case 'buy':
        return new OperationType(OperationType.BUY);
      case 'sell':
        return new OperationType(OperationType.SELL);
      default:
        throw new Error(`Invalid operation type: ${value}. Must be 'buy' or 'sell'`);
    }
  }

  getValue() {
    return this.#type;
  }

  isBuy() {
    return this.#type === OperationType.BUY;
  }

  isSell() {
    return this.#type === OperationType.SELL;
  }

  equals(other) {
    return other instanceof OperationType && this.#type === other.#type;
  }

  toString() {
    return this.#type;
  }

  toJSON() {
    return this.#type;
  }
}
