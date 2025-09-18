import { OperationType } from '../../src/domain/values/operation-type.js';

describe('OperationType', () => {
  it('fromString is case-insensitive and validates', () => {
    expect(OperationType.fromString('buy').isBuy()).toBe(true);
    expect(OperationType.fromString('SELL').isSell()).toBe(true);
    expect(() => OperationType.fromString(/** @type any */(123))).toThrow('Operation type must be a string');
    expect(() => OperationType.fromString('x')).toThrow("Invalid operation type: x. Must be 'buy' or 'sell'");
  });

  it('equals and toJSON', () => {
    const a = OperationType.fromString('buy');
    const b = OperationType.fromString('BUY');
    expect(a.equals(b)).toBe(true);
    expect(a.toJSON()).toBe('BUY');
    expect(a.toString()).toBe('BUY');
  });

  it('constructor throws for invalid constant', () => {
    expect(() => new OperationType(/** @type any */('X'))).toThrow('Invalid operation type: X. Must be BUY or SELL');
  });
});
