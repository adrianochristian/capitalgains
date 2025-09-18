import { OperationProcessor } from '../../src/domain/services/operation-processor.js';
import { Portfolio } from '../../src/domain/entities/portfolio.js';
import { Operation } from '../../src/domain/entities/operation.js';
import { OperationType } from '../../src/domain/values/operation-type.js';
import { Money } from '../../src/domain/values/money.js';
import { Quantity } from '../../src/domain/values/quantity.js';

describe('OperationProcessor', () => {
  let processor;
  let portfolio;
  beforeEach(() => {
    processor = new OperationProcessor();
    portfolio = Portfolio.empty();
  });

  it('processes buy operation', () => {
    const op = new Operation({
      type: OperationType.fromString('buy'),
      unitPrice: Money.fromNumber(10),
      quantity: Quantity.fromNumber(2),
    });
    const res = processor.processBuy(op, portfolio);
    expect(res.isOk()).toBe(true);
    const { tradeValue, grossProfit, portfolio: newPortfolio } = res.getValue();
    expect(tradeValue.toNumber()).toBe(20);
    expect(grossProfit.toNumber()).toBe(0);
    expect(newPortfolio.getQuantity().toNumber()).toBe(2);
  });

  it('errors selling from empty portfolio', () => {
    const sell = new Operation({
      type: OperationType.fromString('sell'),
      unitPrice: Money.fromNumber(10),
      quantity: Quantity.fromNumber(1),
    });
    const res = processor.processSell(sell, portfolio, 0);
    expect(res.isErr()).toBe(true);
    expect(res.getError().getCode()).toBe('SELL_EXCEEDS_POSITION');
  });

  it('errors selling more than position', () => {
    const buy = new Operation({
      type: OperationType.fromString('buy'),
      unitPrice: Money.fromNumber(10),
      quantity: Quantity.fromNumber(1),
    });
    const p1 = processor.processBuy(buy, portfolio).getValue().portfolio;
    const sellTooMuch = new Operation({
      type: OperationType.fromString('sell'),
      unitPrice: Money.fromNumber(10),
      quantity: Quantity.fromNumber(2),
    });
    const res = processor.processSell(sellTooMuch, p1, 0);
    expect(res.isErr()).toBe(true);
    expect(res.getError().getCode()).toBe('SELL_EXCEEDS_POSITION');
  });

  it('processes sell with profit and updates portfolio', () => {
    const buy = new Operation({
      type: OperationType.fromString('buy'),
      unitPrice: Money.fromNumber(10),
      quantity: Quantity.fromNumber(2),
    });
    const p1 = processor.processBuy(buy, portfolio).getValue().portfolio;
    const sell = new Operation({
      type: OperationType.fromString('sell'),
      unitPrice: Money.fromNumber(15),
      quantity: Quantity.fromNumber(1),
    });
    const res = processor.processSell(sell, p1, 0);
    expect(res.isOk()).toBe(true);
    const { tradeValue, grossProfit, portfolio: p2 } = res.getValue();
    expect(tradeValue.toNumber()).toBe(15);
    expect(grossProfit.toNumber()).toBe(5);
    expect(p2.getQuantity().toNumber()).toBe(1);
  });

  it('catch path in processBuy (internal exception)', () => {
    const badOp = { getTradeValue: () => { throw new Error('x'); }, getQuantity: () => Quantity.fromNumber(1), getUnitPrice: () => Money.fromNumber(1) };
    const res = processor.processBuy((badOp), portfolio);
    expect(res.isErr()).toBe(true);
    expect(res.getError().getCode()).toBe('INTERNAL_ERROR');
  });

  it('catch path in processSell (internal exception)', () => {
    const fakePortfolio = {
      hasPosition: () => true,
      getQuantity: () => Quantity.fromNumber(1),
      getCostBasis: () => { throw new Error('boom'); },
      removePosition: () => { throw new Error('unreached'); },
    };
    const sell = new Operation({ type: OperationType.fromString('sell'), unitPrice: Money.fromNumber(10), quantity: Quantity.fromNumber(1) });
    const res = processor.processSell(sell, (fakePortfolio), 1);
    expect(res.isErr()).toBe(true);
    expect(res.getError().getCode()).toBe('INTERNAL_ERROR');
  });

});
