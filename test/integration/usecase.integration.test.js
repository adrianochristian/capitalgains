import { ProcessTransactionsUseCase } from '../../src/app/process-transactions.usecase.js';

describe('Integration: ProcessTransactionsUseCase', () => {
  test('processes cases/operations.txt exactly as expected', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const usecase = new ProcessTransactionsUseCase();

    const casesPath = path.join(process.cwd(), 'cases', 'operations.txt');
    const input = fs.readFileSync(casesPath, 'utf8');
    const lines = input.split('\n').filter((l) => l.trim() !== '');

    const outputs = usecase.execute(lines);
    expect(outputs).toEqual([
      '[{"tax":0},{"tax":0},{"tax":0}]',
      '[{"tax":0},{"tax":10000},{"tax":0}]',
      '[{"tax":0},{"tax":0},{"tax":1000}]',
      '[{"tax":0},{"tax":0},{"tax":0}]',
      '[{"tax":0},{"tax":0},{"tax":0},{"tax":10000}]',
      '[{"tax":0},{"tax":0},{"tax":0},{"tax":0},{"tax":3000}]',
      '[{"tax":0},{"tax":0},{"tax":0},{"tax":0},{"tax":3000},{"tax":0},{"tax":0},{"tax":3700},{"tax":0}]',
      '[{"tax":0},{"tax":80000},{"tax":0},{"tax":60000}]',
      '[{"tax":0},{"tax":0},{"tax":0},{"tax":0},{"tax":0},{"tax":0},{"tax":1000},{"tax":2400}]'
    ]);
  });
});

