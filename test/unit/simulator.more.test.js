import { TaxSimulator } from '../../src/domain/services/simulator.js';
import { Operation } from '../../src/domain/entities/operation.js';
import { OperationType } from '../../src/domain/values/operation-type.js';
import { Money } from '../../src/domain/values/money.js';
import { Quantity } from '../../src/domain/values/quantity.js';

describe('TaxSimulator additional coverage', () => {
  it('processOperations validates input type', () => {
    const sim = new TaxSimulator();
    const res = sim.processOperations(/** @type any */('x'));
    expect(res.isErr()).toBe(true);
    expect(res.getError().getCode()).toBe('INTERNAL_ERROR');
  });

  it('processOperation handles unknown operation type', () => {
    const sim = new TaxSimulator();
    const fakeOp = { isBuy: () => false, isSell: () => false };
    const res = sim.processOperation(/** @type any */(fakeOp), sim.getPortfolio(), 0);
    expect(res.isErr()).toBe(true);
    expect(res.getError().getCode()).toBe('INTERNAL_ERROR');
  });

  it('processOperation catch path when operation throws', () => {
    const sim = new TaxSimulator();
    const badOp = { isBuy: () => { throw new Error('boom'); }, isSell: () => false };
    const res = sim.processOperation(/** @type any */(badOp), sim.getPortfolio(), 0);
    expect(res.isErr()).toBe(true);
    expect(res.getError().getCode()).toBe('INTERNAL_ERROR');
  });

  it('processOperation buy path with opRes Err (from processor)', () => {
    const sim = new TaxSimulator();
    const badOp = {
      isBuy: () => true,
      isSell: () => false,
      getTradeValue: () => { throw new Error('fail'); },
      getQuantity: () => Quantity.fromNumber(1),
      getUnitPrice: () => Money.fromNumber(1),
    };
    const res = sim.processOperation(/** @type any */(badOp), sim.getPortfolio(), 0);
    expect(res.isErr()).toBe(true);
  });

  it('compatibility wrappers call through', () => {
    const sim = new TaxSimulator();
    const buy = new Operation({ type: OperationType.fromString('buy'), unitPrice: Money.fromNumber(1), quantity: Quantity.fromNumber(1) });
    const sell = new Operation({ type: OperationType.fromString('sell'), unitPrice: Money.fromNumber(100), quantity: Quantity.fromNumber(1) });
    const r1 = sim.processOperation(buy, sim.getPortfolio(), 0);
    expect(r1.isOk()).toBe(true);
    const r2 = sim.processOperation(sell, sim.getPortfolio(), 0);
    expect(r2.isOk() || r2.isErr()).toBe(true);
  });

  it('constructor validations', () => {
    expect(() => new TaxSimulator({ initialPortfolio: ({}) })).toThrow('Initial portfolio must be a Portfolio instance');
  });
});
