import { Money } from '../values/money.js';
import { Quantity } from '../values/quantity.js';

export class Portfolio {
  #quantity;
  #averageCost;
  #accumulatedLoss;

  constructor({ quantity = null, averageCost = Money.zero(), accumulatedLoss = Money.zero() }) {
    if (quantity !== null && !(quantity instanceof Quantity)) {
      throw new Error('Quantity must be a Quantity instance or null');
    }
    if (!(averageCost instanceof Money)) {
      throw new Error('Average cost must be a Money instance');
    }
    if (!(accumulatedLoss instanceof Money)) {
      throw new Error('Accumulated loss must be a Money instance');
    }
    if (quantity === null && !averageCost.isZero()) {
      throw new Error('Average cost must be zero when quantity is null');
    }

    this.#quantity = quantity;
    this.#averageCost = averageCost;
    this.#accumulatedLoss = accumulatedLoss;
  }

  static empty() {
    return new Portfolio({
      quantity: null,
      averageCost: Money.zero(),
      accumulatedLoss: Money.zero()
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
      return Money.zero();
    }
    return this.#averageCost.multiply(this.#quantity.getValue());
  }

  addPosition(addedQuantity, unitPrice) {
    if (!(addedQuantity instanceof Quantity)) {
      throw new Error('Added quantity must be a Quantity instance');
    }
    if (!(unitPrice instanceof Money)) {
      throw new Error('Unit price must be a Money instance');
    }

    if (!this.hasPosition()) {
      return new Portfolio({
        quantity: addedQuantity,
        averageCost: unitPrice,
        accumulatedLoss: this.#accumulatedLoss
      });
    }

    const currentValue = this.getTotalValue();
    const addedValue = unitPrice.multiply(addedQuantity.getValue());
    const totalValue = currentValue.add(addedValue);
    const newQuantity = this.#quantity.add(addedQuantity);
    const newAverageCost = totalValue.divide(newQuantity.getValue());

    return new Portfolio({
      quantity: newQuantity,
      averageCost: newAverageCost,
      accumulatedLoss: this.#accumulatedLoss
    });
  }

  removePosition(soldQuantity) {
    if (!(soldQuantity instanceof Quantity)) {
      throw new Error('Sold quantity must be a Quantity instance');
    }
    if (!this.hasPosition()) {
      throw new Error('Cannot sell from empty position');
    }
    if (soldQuantity.isGreaterThan(this.#quantity)) {
      throw new Error('Cannot sell more than current position');
    }

    if (soldQuantity.equals(this.#quantity)) {
      return new Portfolio({
        quantity: null,
        averageCost: Money.zero(),
        accumulatedLoss: this.#accumulatedLoss
      });
    }

    const newQuantity = this.#quantity.subtract(soldQuantity);
    return new Portfolio({
      quantity: newQuantity,
      averageCost: this.#averageCost,
      accumulatedLoss: this.#accumulatedLoss
    });
  }

  getCostBasis(quantity) {
    if (!(quantity instanceof Quantity)) {
      throw new Error('Quantity must be a Quantity instance');
    }
    if (!this.hasPosition()) {
      throw new Error('Cannot calculate cost basis for empty position');
    }
    if (quantity.isGreaterThan(this.#quantity)) {
      throw new Error('Quantity exceeds current position');
    }
    return this.#averageCost.multiply(quantity.getValue());
  }

  addLoss(loss) {
    if (!(loss instanceof Money)) {
      throw new Error('Loss must be a Money instance');
    }
    return new Portfolio({
      quantity: this.#quantity,
      averageCost: this.#averageCost,
      accumulatedLoss: this.#accumulatedLoss.add(loss)
    });
  }

  compensateLoss(compensation) {
    if (!(compensation instanceof Money)) {
      throw new Error('Compensation must be a Money instance');
    }
    if (this.#accumulatedLoss.isZero()) {
      return { portfolio: this, compensated: Money.zero() };
    }
    if (compensation.isLessOrEqualTo(this.#accumulatedLoss)) {
      return {
        portfolio: new Portfolio({
          quantity: this.#quantity,
          averageCost: this.#averageCost,
          accumulatedLoss: this.#accumulatedLoss.subtract(compensation)
        }),
        compensated: compensation
      };
    }
    return {
      portfolio: new Portfolio({
        quantity: this.#quantity,
        averageCost: this.#averageCost,
        accumulatedLoss: Money.zero()
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
    if (!(other instanceof Portfolio)) {
      return false;
    }
    const bothNull = this.#quantity === null && other.#quantity === null;
    const bothHave = this.#quantity !== null && other.#quantity !== null;
    const qtyEq = bothNull || (bothHave && this.#quantity.equals(other.#quantity));
    return qtyEq && this.#averageCost.equals(other.#averageCost) && this.#accumulatedLoss.equals(other.#accumulatedLoss);
  }

  toString() {
    const qty = this.#quantity ? this.#quantity.toString() : 'empty';
    return `Portfolio(${qty} @ ${this.#averageCost}, loss: ${this.#accumulatedLoss})`;
  }
}
