export class Portfolio {
  #quantity;
  #averageCost;
  #accumulatedLoss;
  constructor({ quantity = null, averageCost = 0, accumulatedLoss = 0 }) {
    this.#quantity = quantity;
    this.#averageCost = averageCost;
    this.#accumulatedLoss = accumulatedLoss;
  }
  static empty() {
    return new Portfolio({
      quantity: null,
      averageCost: 0,
      accumulatedLoss: 0
    });
  }

  getQuantity() {
    return this.#quantity;
  }

  getAverageCost() {
    return this.#averageCost;
  }

  getAccumulatedLoss() {
    return this.#accumulatedLoss;
  }

  hasPosition() {
    return this.#quantity !== null;
  }

  getTotalValue() {
    if (!this.hasPosition()) {
      return 0;
    }
    return this.#averageCost * this.#quantity;
  }

  addPosition(addedQuantity, unitPrice) {
    if (!this.hasPosition()) {
      return new Portfolio({
        quantity: addedQuantity,
        averageCost: unitPrice,
        accumulatedLoss: this.#accumulatedLoss
      });
    }

    const currentValue = this.getTotalValue();
    const addedValue = unitPrice * addedQuantity;
    const totalValue = currentValue + addedValue;
    const newQuantity = this.#quantity + addedQuantity;
    const newAverageCost = totalValue / newQuantity;

    return new Portfolio({
      quantity: newQuantity,
      averageCost: newAverageCost,
      accumulatedLoss: this.#accumulatedLoss
    });
  }

  removePosition(soldQuantity) {
    if (soldQuantity === this.#quantity) {
      return new Portfolio({
        quantity: null,
        averageCost: 0,
        accumulatedLoss: this.#accumulatedLoss
      });
    }

    const newQuantity = this.#quantity - soldQuantity;
    return new Portfolio({
      quantity: newQuantity,
      averageCost: this.#averageCost,
      accumulatedLoss: this.#accumulatedLoss
    });
  }

  getCostBasis(quantity) {
    return this.#averageCost * quantity;
  }

  addLoss(loss) {
    return new Portfolio({
      quantity: this.#quantity,
      averageCost: this.#averageCost,
      accumulatedLoss: this.#accumulatedLoss + loss
    });
  }

  compensateLoss(compensation) {
    if (this.#accumulatedLoss === 0) {
      return { portfolio: this, compensated: 0 };
    }
    if (compensation <= this.#accumulatedLoss) {
      return {
        portfolio: new Portfolio({
          quantity: this.#quantity,
          averageCost: this.#averageCost,
          accumulatedLoss: this.#accumulatedLoss - compensation
        }),
        compensated: compensation
      };
    }
    return {
      portfolio: new Portfolio({
        quantity: this.#quantity,
        averageCost: this.#averageCost,
        accumulatedLoss: 0
      }),
      compensated: this.#accumulatedLoss
    };
  }

  withChanges({ quantity, averageCost, accumulatedLoss }) {
    return new Portfolio({
      quantity: quantity !== undefined ? quantity : this.#quantity,
      averageCost: averageCost ?? this.#averageCost,
      accumulatedLoss: accumulatedLoss ?? this.#accumulatedLoss
    });
  }

  equals(other) {
    if (!(other instanceof Portfolio)) return false;
    const qtyEq = this.#quantity === other.#quantity;
    return qtyEq && this.#averageCost === other.#averageCost && this.#accumulatedLoss === other.#accumulatedLoss;
  }

  toString() {
    const qty = this.#quantity ?? 'empty';
    return `Portfolio(${qty} @ ${this.#averageCost}, loss: ${this.#accumulatedLoss})`;
  }
}
