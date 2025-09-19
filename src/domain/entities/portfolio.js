export class Portfolio {
  #quantity;
  #averageCost;
  #accumulatedLoss;
  constructor({ quantity = 0, averageCost = 0, accumulatedLoss = 0 }) {
    this.#quantity = quantity;
    this.#averageCost = averageCost;
    this.#accumulatedLoss = accumulatedLoss;
  }
  static empty() {
    return new Portfolio({
      quantity: 0,
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
    return this.#quantity > 0;
  }

  getTotalValue() {
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
    if (!this.hasPosition() || soldQuantity > this.#quantity) {
      throw new Error(`Cannot sell ${soldQuantity} units: available ${this.#quantity}`);
    }
    if (soldQuantity === this.#quantity) {
      return new Portfolio({
        quantity: 0,
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

  
}
