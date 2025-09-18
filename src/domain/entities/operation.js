import { OperationType } from '../values/operation-type.js';
import { Money } from '../values/money.js';
import { Quantity } from '../values/quantity.js';
export class Operation {
  #type;
  #unitPrice;
  #quantity;
  constructor({ type, unitPrice, quantity }) {
    if (!(type instanceof OperationType)) {
      throw new Error('Operation type must be an OperationType instance');
    }
    if (!(unitPrice instanceof Money)) {
      throw new Error('Unit price must be a Money instance');
    }
    if (!(quantity instanceof Quantity)) {
      throw new Error('Quantity must be a Quantity instance');
    }

    this.#type = type;
    this.#unitPrice = unitPrice;
    this.#quantity = quantity;
  }

  getType() {
    return this.#type;
  }
  getUnitPrice() {
    return this.#unitPrice;
  }
  getQuantity() {
    return this.#quantity;
  }
  getTradeValue() {
    return this.#unitPrice.multiply(this.#quantity.getValue());
  }
  isBuy() {
    return this.#type.isBuy();
  }
  isSell() {
    return this.#type.isSell();
  }
  withChanges({ type, unitPrice, quantity }) {
    return new Operation({
      type: type ?? this.#type,
      unitPrice: unitPrice ?? this.#unitPrice,
      quantity: quantity ?? this.#quantity
    });
  }
  equals(other) {
    return other instanceof Operation &&
           this.#type.equals(other.#type) &&
           this.#unitPrice.equals(other.#unitPrice) &&
           this.#quantity.equals(other.#quantity);
  }
  toString() {
    return `Operation(${this.#type.getValue()} ${this.#quantity.toNumber()} @ ${this.#unitPrice.toNumber()})`;
  }
}
