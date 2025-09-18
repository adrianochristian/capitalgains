import { Portfolio } from '../../src/domain/entities/portfolio.js';
import { Money } from '../../src/domain/values/money.js';
import { Quantity } from '../../src/domain/values/quantity.js';

describe('Portfolio', () => {
  it('constructor validations', () => {
    expect(() => new Portfolio({ quantity: /** @type any */(1), averageCost: Money.zero(), accumulatedLoss: Money.zero() })).toThrow('Quantity must be a Quantity instance or null');
    expect(() => new Portfolio({ quantity: null, averageCost: /** @type any */(0), accumulatedLoss: Money.zero() })).toThrow('Average cost must be a Money instance');
    expect(() => new Portfolio({ quantity: null, averageCost: Money.zero(), accumulatedLoss: /** @type any */(0) })).toThrow('Accumulated loss must be a Money instance');
    expect(() => new Portfolio({ quantity: null, averageCost: Money.fromNumber(1), accumulatedLoss: Money.zero() })).toThrow('Average cost must be zero when quantity is null');
  });

  it('getters and total value', () => {
    const p = Portfolio.empty();
    expect(p.hasPosition()).toBe(false);
    expect(p.getTotalValue().toNumber()).toBe(0);
    const p2 = p.addPosition(Quantity.fromNumber(2), Money.fromNumber(5));
    expect(p2.getTotalValue().toNumber()).toBe(10);
  });

  it('addPosition first buy and weighted average', () => {
    const p0 = Portfolio.empty();
    const p1 = p0.addPosition(Quantity.fromNumber(100), Money.fromNumber(10));
    expect(p1.getQuantity().toNumber()).toBe(100);
    expect(p1.getAverageCost().toNumber()).toBe(10);
    const p2 = p1.addPosition(Quantity.fromNumber(100), Money.fromNumber(25));
    expect(p2.getQuantity().toNumber()).toBe(200);
    expect(p2.getAverageCost().toNumber()).toBe(17.5);
  });

  it('addPosition validations', () => {
    const p = Portfolio.empty();
    expect(() => p.addPosition(/** @type any */(1), Money.fromNumber(1))).toThrow('Added quantity must be a Quantity instance');
    expect(() => p.addPosition(Quantity.fromNumber(1), /** @type any */(1))).toThrow('Unit price must be a Money instance');
  });

  it('removePosition validations and cases', () => {
    const p = Portfolio.empty().addPosition(Quantity.fromNumber(10), Money.fromNumber(5));
    expect(() => p.removePosition(/** @type any */(1))).toThrow('Sold quantity must be a Quantity instance');
    expect(() => Portfolio.empty().removePosition(Quantity.fromNumber(1))).toThrow('Cannot sell from empty position');
    expect(() => p.removePosition(Quantity.fromNumber(11))).toThrow('Cannot sell more than current position');
    const p2 = p.removePosition(Quantity.fromNumber(10));
    expect(p2.hasPosition()).toBe(false);
    const p3 = Portfolio.empty().addPosition(Quantity.fromNumber(10), Money.fromNumber(5)).removePosition(Quantity.fromNumber(3));
    expect(p3.getQuantity().toNumber()).toBe(7);
    expect(p3.getAverageCost().toNumber()).toBe(5);
  });

  it('getCostBasis validations and value', () => {
    const p = Portfolio.empty().addPosition(Quantity.fromNumber(10), Money.fromNumber(5));
    expect(() => p.getCostBasis(/** @type any */(1))).toThrow('Quantity must be a Quantity instance');
    expect(() => Portfolio.empty().getCostBasis(Quantity.fromNumber(1))).toThrow('Cannot calculate cost basis for empty position');
    expect(() => p.getCostBasis(Quantity.fromNumber(11))).toThrow('Quantity exceeds current position');
    expect(p.getCostBasis(Quantity.fromNumber(3)).toNumber()).toBe(15);
  });

  it('addLoss and compensateLoss branches', () => {
    const p = Portfolio.empty().addPosition(Quantity.fromNumber(10), Money.fromNumber(5));
    expect(() => p.addLoss(/** @type any */(1))).toThrow('Loss must be a Money instance');
    const p2 = p.addLoss(Money.fromNumber(100));
    // no compensation when loss is zero
    const r0 = Portfolio.empty().compensateLoss(Money.fromNumber(10));
    expect(r0.compensated.toNumber()).toBe(0);
    // full compensation within available losses
    const rc = p2.compensateLoss(Money.fromNumber(60));
    expect(rc.compensated.toNumber()).toBe(60);
    // partial compensation: use all available
    const rp = rc.portfolio.compensateLoss(Money.fromNumber(1000));
    expect(rp.compensated.toNumber()).toBe(40);
    expect(() => p.compensateLoss(/** @type any */(1))).toThrow('Compensation must be a Money instance');
  });

  it('withChanges and equals', () => {
    const p = Portfolio.empty().addPosition(Quantity.fromNumber(1), Money.fromNumber(1));
    const q = p.withChanges({ accumulatedLoss: Money.fromNumber(2) });
    expect(q.getAccumulatedLoss().toNumber()).toBe(2);
    expect(p.equals(p)).toBe(true);
    // compare different portfolio
    const r = Portfolio.empty();
    expect(p.equals(r)).toBe(false);
    expect(p.equals(/** @type any */({}))).toBe(false);
  });

  it('withChanges can set quantity to null (explicit branch)', () => {
    const p = Portfolio.empty().addPosition(Quantity.fromNumber(2), Money.fromNumber(3));
    const s = p.withChanges({ quantity: null, averageCost: Money.zero() });
    expect(s.hasPosition()).toBe(false);
    expect(s.getAverageCost().toNumber()).toBe(0);
  });

  it('equals handles both-null quantities', () => {
    const a = Portfolio.empty();
    const b = new Portfolio({});
    expect(a.equals(b)).toBe(true);
  });
});
