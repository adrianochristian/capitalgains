import { Portfolio } from '../../../src/domain/entities/portfolio.js';

describe('Portfolio', () => {
  test('empty portfolio', () => {
    const p = Portfolio.empty();
    expect(p.getQuantity()).toBe(0);
    expect(p.getAverageCost()).toBe(0);
    expect(p.getAccumulatedLoss()).toBe(0);
    expect(p.hasPosition()).toBe(false);
    expect(p.getTotalValue()).toBe(0);
  });

  test('constructor defaults and explicit values', () => {
    const pDefault = new Portfolio({});
    expect(pDefault.getQuantity()).toBe(0);
    expect(pDefault.getAverageCost()).toBe(0);
    expect(pDefault.getAccumulatedLoss()).toBe(0);

    const pCustom = new Portfolio({ quantity: 3, averageCost: 2, accumulatedLoss: 5 });
    expect(pCustom.getQuantity()).toBe(3);
    expect(pCustom.getAverageCost()).toBe(2);
    expect(pCustom.getAccumulatedLoss()).toBe(5);
    expect(pCustom.hasPosition()).toBe(true);
  });

  test('addPosition initializes when empty', () => {
    const p = Portfolio.empty();
    const p2 = p.addPosition(10, 5);
    expect(p2.getQuantity()).toBe(10);
    expect(p2.getAverageCost()).toBe(5);
    expect(p2.getAccumulatedLoss()).toBe(0);
  });

  test('addPosition recalculates weighted average cost', () => {
    const p = Portfolio.empty().addPosition(10, 10); // value 100
    const p2 = p.addPosition(10, 20); // add value 200 => total 300 / qty 20 => avg 15
    expect(p2.getQuantity()).toBe(20);
    expect(p2.getAverageCost()).toBe(15);
  });

  test('removePosition full sell resets quantity and averageCost', () => {
    const p = Portfolio.empty().addPosition(10, 10);
    const p2 = p.removePosition(10);
    expect(p2.getQuantity()).toBe(0);
    expect(p2.getAverageCost()).toBe(0);
    expect(p2.getAccumulatedLoss()).toBe(0);
    expect(p2.hasPosition()).toBe(false);
  });

  test('removePosition partial sell keeps averageCost', () => {
    const p = Portfolio.empty().addPosition(10, 10);
    const p2 = p.removePosition(4);
    expect(p2.getQuantity()).toBe(6);
    expect(p2.getAverageCost()).toBe(10);
  });

  test('removePosition throws when selling above position', () => {
    const p = Portfolio.empty().addPosition(5, 10);
    expect(() => p.removePosition(6)).toThrow('Cannot sell 6 units: available 5');
  });

  test('getCostBasis returns proportional cost', () => {
    const p = Portfolio.empty().addPosition(10, 7);
    expect(p.getCostBasis(3)).toBe(21);
  });

  test('addLoss increments accumulated loss', () => {
    const p = Portfolio.empty().addPosition(1, 1);
    const p2 = p.addLoss(13);
    expect(p2.getAccumulatedLoss()).toBe(13);
  });

  test('compensateLoss handles zero, partial, and full compensation', () => {
    const p0 = Portfolio.empty().addPosition(1, 1);
    const r0 = p0.compensateLoss(10);
    expect(r0.compensated).toBe(0);
    expect(r0.portfolio.getAccumulatedLoss()).toBe(0);

    const p1 = p0.addLoss(20);
    const r1 = p1.compensateLoss(5);
    expect(r1.compensated).toBe(5);
    expect(r1.portfolio.getAccumulatedLoss()).toBe(15);

    const r2 = r1.portfolio.compensateLoss(30);
    expect(r2.compensated).toBe(15);
    expect(r2.portfolio.getAccumulatedLoss()).toBe(0);
  });
});

