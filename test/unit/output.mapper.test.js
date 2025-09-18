import { OutputMapper } from '../../src/app/mappers/output.mapper.js';
import { DomainErrors, DomainError } from '../../src/domain/errors/errors.js';
import { Money } from '../../src/domain/values/money.js';

class StubTaxResult {
  #tax;
  constructor(amount) { this.#tax = Money.fromNumber(amount); }
  getTax() { return this.#tax; }
}

describe('OutputMapper', () => {
  let mapper;
  beforeEach(() => { mapper = new OutputMapper(); });

  it('maps result list to JSON (success)', () => {
    const json = mapper.mapResults([new StubTaxResult(0), new StubTaxResult(100.5)]);
    expect(JSON.parse(json)).toEqual([{ tax: 0 }, { tax: 100.5 }]);
  });

  it('handles non-array results as error', () => {
    const json = mapper.mapResults(null);
    const obj = JSON.parse(json);
    expect(obj[0].error.code).toBe('INTERNAL_ERROR');
  });

  it('maps domain error', () => {
    const err = DomainErrors.invalidJSON('x', 'y');
    const json = mapper.mapError(err);
    const obj = JSON.parse(json);
    expect(obj[0].error.code).toBe('INVALID_JSON');
  });

  it('maps generic error', () => {
    const json = mapper.mapError(new Error('generic'));
    const obj = JSON.parse(json);
    expect(obj[0].error.code).toBe('INTERNAL_ERROR');
  });

  it('mapMultipleSimulations handles Ok and Err', () => {
    const okLike = { isOk: () => true, getValue: () => [new StubTaxResult(7)] };
    const err = DomainErrors.emptyInput();
    const errLike = { isOk: () => false, getError: () => err };
    const lines = mapper.mapMultipleSimulations([okLike, errLike]);
    expect(JSON.parse(lines[0])).toEqual([{ tax: 7 }]);
    const e = JSON.parse(lines[1]);
    expect(e[0].error.code).toBe('EMPTY_INPUT');
  });

  it('mapErrorObject handles falsy error', () => {
    const anyMapper = mapper;
    const obj = anyMapper.mapErrorObject(undefined);
    expect(obj.error.code).toBe('INTERNAL_ERROR');
  });

  it('formatTaxAmount guards non-finite', () => {
    expect(mapper.formatTaxAmount(Number.NaN)).toBe(0);
    expect(mapper.formatTaxAmount(Infinity)).toBe(0);
  });

  it('mapSingleResult catches errors from result object', () => {
    const bad = { getTax: () => { throw new Error('bad'); } };
    const obj = mapper.mapSingleResult(bad);
    expect(obj.error.code).toBe('INTERNAL_ERROR');
  });

  it('mapMultipleSimulations with non-array returns error line', () => {
    const lines = mapper.mapMultipleSimulations(null);
    expect(JSON.parse(lines[0])[0].error.code).toBe('INTERNAL_ERROR');
  });
});
