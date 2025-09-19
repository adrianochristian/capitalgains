import { CapitalGainsEngine } from '../domain/services/capital-gains-engine.js';
import { InputMapper } from './mappers/input.mapper.js';
import { OutputMapper } from './mappers/output.mapper.js';
export class ProcessTransactionsUseCase {
  #inputMapper;

  #outputMapper;

  constructor({ inputMapper = new InputMapper(), outputMapper = new OutputMapper() } = {}) {
    this.#inputMapper = inputMapper;
    this.#outputMapper = outputMapper;
  }

  execute(inputLines) {
    const results = inputLines.map((line) => this.processSingleLine(line));
    return this.#outputMapper.mapMultipleLines(results);
  }
  processSingleLine(inputLine) {
    const operations = this.#inputMapper.parseLineToOperations(inputLine);
    const engine = new CapitalGainsEngine();
    return engine.run(operations);
  }
}
