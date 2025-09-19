import { Operation } from '../../../src/domain/entities/operation.js';

describe('Operation', () => {
  test('getters and trade value', () => {
    const op = new Operation({ type: 'buy', unitPrice: 10, quantity: 3 });
    expect(op.getType()).toBe('buy');
    expect(op.getUnitPrice()).toBe(10);
    expect(op.getQuantity()).toBe(3);
    expect(op.getTradeValue()).toBe(30);
  });

  test('type helpers', () => {
    const buy = new Operation({ type: 'buy', unitPrice: 1, quantity: 1 });
    const sell = new Operation({ type: 'sell', unitPrice: 1, quantity: 1 });
    expect(buy.isBuy()).toBe(true);
    expect(buy.isSell()).toBe(false);
    expect(sell.isBuy()).toBe(false);
    expect(sell.isSell()).toBe(true);
  });
});

