import { DomainError, DomainErrors, ErrorCodes } from '../../src/domain/errors/errors.js';

describe('DomainError and factories', () => {
  it('basic DomainError behavior', () => {
    const e = new DomainError(ErrorCodes.INTERNAL_ERROR, 'msg', { a: 1 });
    expect(e.getCode()).toBe('INTERNAL_ERROR');
    expect(e.getDetails()).toEqual({ a: 1 });
    expect(e.hasCode(ErrorCodes.INTERNAL_ERROR)).toBe(true);
    const e2 = e.withDetails({ b: 2 });
    expect(e2.getDetails()).toEqual({ a: 1, b: 2 });
    expect(e2.toJSON().code).toBe('INTERNAL_ERROR');
    expect(e2.toString()).toContain('INTERNAL_ERROR');
  });

  it('factory functions include index when provided', () => {
    const m = DomainErrors.missingField('f', 7);
    expect(m.getCode()).toBe(ErrorCodes.MISSING_FIELD);
    expect(m.getDetails().index).toBe(7);
  });

  it('factory functions without index (branch else)', () => {
    expect(DomainErrors.missingField('f').getDetails().index).toBeUndefined();
    expect(DomainErrors.invalidOperationType('x').getDetails().index).toBeUndefined();
    expect(DomainErrors.nonFiniteUnitCost('x').getDetails().index).toBeUndefined();
    expect(DomainErrors.negativeOrZeroQuantity(0).getDetails().index).toBeUndefined();
    expect(DomainErrors.negativeUnitCost(-1).getDetails().index).toBeUndefined();
    expect(DomainErrors.sellExceedsPosition(1, 0).getDetails().index).toBeUndefined();
    expect(DomainErrors.unsupportedAssetKind('bdr').getDetails().index).toBeUndefined();
  });

  it('cover branch when Error.captureStackTrace is not present', () => {
    const original = Error.captureStackTrace;
    delete Error.captureStackTrace;
    const e = new DomainError(ErrorCodes.INTERNAL_ERROR, 'x');
    expect(e.getCode()).toBe('INTERNAL_ERROR');
    Error.captureStackTrace = original;
  });

  it('factories produce expected codes', () => {
    expect(DomainErrors.invalidOperationType('x').getCode()).toBe(ErrorCodes.INVALID_OPERATION_TYPE);
    expect(DomainErrors.nonFiniteUnitCost('x').getCode()).toBe(ErrorCodes.NON_FINITE_UNIT_COST);
    expect(DomainErrors.negativeOrZeroQuantity(0).getCode()).toBe(ErrorCodes.NEGATIVE_OR_ZERO_QUANTITY);
    expect(DomainErrors.negativeUnitCost(-1).getCode()).toBe(ErrorCodes.NEGATIVE_UNIT_COST);
    expect(DomainErrors.sellExceedsPosition(1, 0).getCode()).toBe(ErrorCodes.SELL_EXCEEDS_POSITION);
    expect(DomainErrors.unsupportedAssetKind('bdr').getCode()).toBe(ErrorCodes.UNSUPPORTED_ASSET_KIND);
    expect(DomainErrors.invalidJSON('x', 'y').getCode()).toBe(ErrorCodes.INVALID_JSON);
    expect(DomainErrors.emptyInput().getCode()).toBe(ErrorCodes.EMPTY_INPUT);
    expect(DomainErrors.internalError('x').getCode()).toBe(ErrorCodes.INTERNAL_ERROR);
  });
});
