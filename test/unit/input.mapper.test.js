import { InputMapper } from '../../src/app/mappers/input.mapper.js';

describe('InputMapper', () => {
  let mapper;
  beforeEach(() => { mapper = new InputMapper(); });

  it('parseJSON validates input type and empty', () => {
    const r1 = mapper.parseJSON(/** @type any */(123));
    expect(r1.isErr()).toBe(true);
    const r2 = mapper.parseJSON('');
    expect(r2.isErr()).toBe(true);
  });

  it('parseJSON handles invalid JSON', () => {
    const r = mapper.parseJSON('not json');
    expect(r.isErr()).toBe(true);
  });

  it('parseJSON ok path', () => {
    const r = mapper.parseJSON('[1,2]');
    expect(r.isOk()).toBe(true);
  });

  it('mapOperations validates array and empty', () => {
    const r1 = mapper.mapOperations(/** @type any */(null));
    expect(r1.isErr()).toBe(true);
    const r2 = mapper.mapOperations([]);
    expect(r2.isErr()).toBe(true);
  });

  it('mapOperation checks required fields', () => {
    const r = mapper.mapOperation({ operation: 'buy', 'unit-cost': 10.0 }, 0);
    expect(r.isErr()).toBe(true);
  });

  it('mapOperation rejects non-object', () => {
    const r = mapper.mapOperation(/** @type any */(null), 0);
    expect(r.isErr()).toBe(true);
  });

  it('mapOperationType rejects non-string', () => {
    const r = mapper.mapOperationType(/** @type any */(123), 0);
    expect(r.isErr()).toBe(true);
  });

  it('mapOperation validates operation type', () => {
    const obj = { operation: 'invalid', 'unit-cost': 10.0, quantity: 1 };
    const r = mapper.mapOperation(obj, 0);
    expect(r.isErr()).toBe(true);
  });

  it('mapUnitCost validations', () => {
    expect(mapper.mapUnitCost(/** @type any */('NaN'), 0).isErr()).toBe(true);
    expect(mapper.mapUnitCost(Number.NaN, 0).isErr()).toBe(true);
    expect(mapper.mapUnitCost(-1, 0).isErr()).toBe(true);
    expect(mapper.mapUnitCost(1, 0).isOk()).toBe(true);
  });

  it('mapQuantity validations', () => {
    expect(mapper.mapQuantity(/** @type any */('1'), 0).isErr()).toBe(true);
    expect(mapper.mapQuantity(Number.NaN, 0).isErr()).toBe(true);
    expect(mapper.mapQuantity(0, 0).isErr()).toBe(true);
    expect(mapper.mapQuantity(1, 0).isOk()).toBe(true);
  });

  it('parseAndMapOperations integrates parse and map', () => {
    const line = '[{"operation":"buy","unit-cost":10.00,"quantity":1}]';
    const r = mapper.parseAndMapOperations(line);
    expect(r.isOk()).toBe(true);
  });
});
