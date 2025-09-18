import { TaxSimulator } from '../domain/services/simulator.js';
import { InputMapper } from './mappers/input.mapper.js';
import { OutputMapper } from './mappers/output.mapper.js';
import { Err } from '../domain/results/result.js';
import { DomainErrors } from '../domain/errors/errors.js';
export class RunSimulationUseCase {
  #inputMapper;

  #outputMapper;

  constructor({ inputMapper = new InputMapper(), outputMapper = new OutputMapper() } = {}) {
    this.#inputMapper = inputMapper;
    this.#outputMapper = outputMapper;
  }

  execute(inputLines) {
    if (!Array.isArray(inputLines) || inputLines.length === 0) {
      const error = Array.isArray(inputLines)
        ? DomainErrors.emptyInput()
        : DomainErrors.internalError('Input lines must be an array');
      return [this.#outputMapper.mapError(error)];
    }

    const results = inputLines.map((line, index) => this.executeSingleSimulation(line, index));
    return this.#outputMapper.mapMultipleSimulations(results);
  }

  executeSingleSimulation(inputLine, lineIndex = 0) {
    const operationsResult = this.#inputMapper.parseAndMapOperations(inputLine);
    if (operationsResult.isErr()) {
      return operationsResult;
    }

    const operations = operationsResult.getValue();

    const simulator = new TaxSimulator();
    return simulator.processOperations(operations);
  }
}
