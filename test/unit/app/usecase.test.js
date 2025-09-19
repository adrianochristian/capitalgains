import { ProcessTransactionsUseCase } from '../../../src/app/process-transactions.usecase.js';

describe('ProcessTransactionsUseCase', () => {
  test('processes a single line of real operations', () => {
    const usecase = new ProcessTransactionsUseCase();
    const line = '[{"operation":"buy","unit-cost":10.00,"quantity":10000},{"operation":"sell","unit-cost":20.00,"quantity":5000}]';
    const outputs = usecase.execute([line]);
    expect(outputs).toEqual(['[{"tax":0},{"tax":10000}]']);
  });

  test('processes multiple lines independently', () => {
    const usecase = new ProcessTransactionsUseCase();
    const l1 = '[{"operation":"buy","unit-cost":10.00,"quantity":1000}]';
    const l2 = '[{"operation":"buy","unit-cost":10.00,"quantity":10000},{"operation":"sell","unit-cost":20.00,"quantity":5000}]';
    const outputs = usecase.execute([l1, l2]);
    expect(outputs).toEqual(['[{"tax":0}]', '[{"tax":0},{"tax":10000}]']);
  });
});

