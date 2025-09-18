import { CapitalGainsEngine } from '../domain/services/capital-gains-engine.js';
import { InputMapper } from './mappers/input.mapper.js';
import { OutputMapper } from './mappers/output.mapper.js';
export class RunSimulationUseCase {
  #inputMapper;

  #outputMapper;

  constructor({ inputMapper = new InputMapper(), outputMapper = new OutputMapper() } = {}) {
    this.#inputMapper = inputMapper;
    this.#outputMapper = outputMapper;
  }

  execute(inputLines) {
    const results = inputLines.map((line) => this.executeSingleSimulation(line));
    return this.#outputMapper.mapMultipleSimulations(results);
  }
  executeSingleSimulation(inputLine) {
    const operations = this.#inputMapper.parseAndMapOperations(inputLine);
    const engine = new CapitalGainsEngine();
    return engine.run(operations);
  }
}
