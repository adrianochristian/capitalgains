import { InputMapper } from '../../../src/app/mappers/input.mapper.js';
import { OutputMapper } from '../../../src/app/mappers/output.mapper.js';
import { Operation } from '../../../src/domain/entities/operation.js';

describe('InputMapper', () => {
  test('parseLineToOperations maps to Operation[]', () => {
    const mapper = new InputMapper();
    const line = '[{"operation":"buy","unit-cost":10.5,"quantity":2},{"operation":"sell","unit-cost":10.5,"quantity":1}]';
    const ops = mapper.parseLineToOperations(line);
    expect(Array.isArray(ops)).toBe(true);
    expect(ops[0]).toBeInstanceOf(Operation);
    expect(ops[0].getType()).toBe('buy');
    expect(ops[0].getUnitPrice()).toBe(10.5);
    expect(ops[0].getQuantity()).toBe(2);
    expect(ops[1].isSell()).toBe(true);
  });
});

describe('OutputMapper', () => {
  test('toOutputLine serializes list of tax assessments', () => {
    const mapper = new OutputMapper();
    const fake = (v) => ({ getTax: () => v });
    const json = mapper.toOutputLine([fake(0), fake(10.1234)]);
    expect(json).toBe('[{"tax":0},{"tax":10.1234}]');
  });

  test('toOutputLine normalizes -0 and non-finite numbers', () => {
    const mapper = new OutputMapper();
    const fake = (v) => ({ getTax: () => v });
    const json = mapper.toOutputLine([fake(-0), fake(NaN), fake(Infinity), fake(-Infinity)]);
    expect(json).toBe('[{"tax":0},{"tax":0},{"tax":0},{"tax":0}]');
  });

  test('mapMultipleLines maps each line output', () => {
    const mapper = new OutputMapper();
    const fake = (v) => ({ getTax: () => v });
    const lines = mapper.mapMultipleLines([[fake(1)], [fake(2)]]);
    expect(lines).toEqual(['[{"tax":1}]', '[{"tax":2}]']);
  });
});

