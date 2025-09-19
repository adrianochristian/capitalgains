export class Operation {
  #type;
  #unitPrice;
  #quantity;
  constructor({ type, unitPrice, quantity }) {
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
    return this.#unitPrice * this.#quantity;
  }
  isBuy() {
    return this.#type === 'buy';
  }
  isSell() {
    return this.#type === 'sell';
  }
}
