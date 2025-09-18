import { RunSimulationUseCase } from '../../src/app/run-simulation.usecase.js';

describe('RunSimulationUseCase - edge inputs', () => {
  it('returns error JSON when inputLines is not an array', () => {
    const useCase = new RunSimulationUseCase();
    const outputs = useCase.execute(('not array'));
    expect(outputs).toHaveLength(1);
    const out = JSON.parse(outputs[0]);
    expect(out[0].error.code).toBe('INTERNAL_ERROR');
  });

  it('returns error JSON when inputLines is empty array', () => {
    const useCase = new RunSimulationUseCase();
    const outputs = useCase.execute([]);
    expect(outputs).toHaveLength(1);
    const out = JSON.parse(outputs[0]);
    expect(out[0].error.code).toBe('EMPTY_INPUT');
  });
});
