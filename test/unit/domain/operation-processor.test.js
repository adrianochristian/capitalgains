import { Operation } from '../../../src/domain/entities/operation.js';
import { Portfolio } from '../../../src/domain/entities/portfolio.js';
import { OperationProcessor } from '../../../src/domain/services/operation-processor.js';

describe('OperationProcessor', () => {
  test('processBuy updates portfolio only', () => {
    const processor = new OperationProcessor();
    const portfolio = Portfolio.empty();
    const op = new Operation({ type: 'buy', unitPrice: 10, quantity: 5 });
    const { portfolio: p2 } = processor.processBuy(op, portfolio);
    expect(p2.getQuantity()).toBe(5);
    expect(p2.getAverageCost()).toBe(10);
  });

  test('processSell returns tradeValue and grossProfit and updates portfolio', () => {
    const processor = new OperationProcessor();
    const portfolio = Portfolio.empty().addPosition(10, 10); // avg 10
    const op = new Operation({ type: 'sell', unitPrice: 15, quantity: 4 });
    const { portfolio: p2, tradeValue, grossProfit } = processor.processSell(op, portfolio);
    expect(tradeValue).toBe(60); // 15 * 4
    expect(grossProfit).toBe(20); // (15-10) * 4
    expect(p2.getQuantity()).toBe(6);
    expect(p2.getAverageCost()).toBe(10);
  });
});

