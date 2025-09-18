import { Operation } from '../../src/domain/entities/operation.js';
import { OperationType } from '../../src/domain/values/operation-type.js';
import { Money } from '../../src/domain/values/money.js';
import { Quantity } from '../../src/domain/values/quantity.js';

describe('Operation entity', () => {
  it('constructor validations', () => {
    expect(() => new Operation({ type: /** @type any */(null), unitPrice: Money.zero(), quantity: Quantity.fromNumber(1) }))
      .toThrow('Operation type must be an OperationType instance');
    expect(() => new Operation({ type: OperationType.fromString('buy'), unitPrice: /** @type any */(0), quantity: Quantity.fromNumber(1) }))
      .toThrow('Unit price must be a Money instance');
    expect(() => new Operation({ type: OperationType.fromString('buy'), unitPrice: Money.zero(), quantity: /** @type any */(1) }))
      .toThrow('Quantity must be a Quantity instance');
  });

  it('getters, trade value, withChanges, equals, toString', () => {
    const op = new Operation({
      type: OperationType.fromString('buy'),
      unitPrice: Money.fromNumber(10),
      quantity: Quantity.fromNumber(2),
    });
    expect(op.getType().isBuy()).toBe(true);
    expect(op.getUnitPrice().toNumber()).toBe(10);
    expect(op.getQuantity().toNumber()).toBe(2);
    expect(op.getTradeValue().toNumber()).toBe(20);
    const changed = op.withChanges({ unitPrice: Money.fromNumber(15) });
    expect(changed.getUnitPrice().toNumber()).toBe(15);
    expect(op.equals(changed)).toBe(false);
    const changedType = op.withChanges({ type: OperationType.fromString('sell') });
    expect(changedType.getType().isSell()).toBe(true);
    const changedQty = op.withChanges({ quantity: Quantity.fromNumber(3) });
    expect(changedQty.getQuantity().toNumber()).toBe(3);
    expect(op.equals(op)).toBe(true);
    expect(typeof op.toString()).toBe('string');
  });
});
