#!/usr/bin/env node

import { RunSimulationUseCase } from '../../app/run-simulation.usecase.js';
import { ReadlineUtils } from './readline.js';
import { OutputMapper } from '../../app/mappers/output.mapper.js';

export class CapitalGainsCLI {
  #useCase;
  #readline;

  constructor() {
    const outputMapper = new OutputMapper();
    this.#useCase = new RunSimulationUseCase({ outputMapper });
    this.#readline = new ReadlineUtils();
  }

  async run() {
    try {
      const isInteractive = process.stdin.isTTY && process.argv.length === 2;
      
      if (isInteractive) {
        await this.runInteractiveMode();
      } else {
        await this.runBatchMode();
      }
    } catch (error) {
      this.handleFatalError(error);
      process.exit(1);
    }
  }

  async runInteractiveMode() {
    await this.#readline.readLinesWithCallback((line) => {
      this.processLine(line);
    });
  }

  async runBatchMode() {
    const lines = await this.#readline.readAllLines();
    
    if (lines.length === 0) {
      return;
    }

    const outputs = this.#useCase.execute(lines);
    for (const output of outputs) {
      this.writeOutput(output);
    }
  }

  processLine(line) {
    try {
      const outputs = this.#useCase.execute([line]);
      if (outputs.length > 0) {
        this.writeOutput(outputs[0]);
      }
    } catch (error) {
      this.handleProcessingError(error, line);
    }
  }

  writeOutput(output) {
    process.stdout.write(output + '\n');
  }

  writeError(message) {
    process.stderr.write(`Error: ${message}\n`);
  }

  handleProcessingError(error, line) {
    this.writeError(`Failed to process line: ${line}`);
    this.writeError(error.message);
    
    const errorResponse = JSON.stringify([{
      error: {
        code: 'INTERNAL_ERROR',
        message: error.message,
        details: {}
      }
    }]);
    this.writeOutput(errorResponse);
  }

  handleFatalError(error) {
    this.writeError('Fatal application error occurred');
    this.writeError(error.message);
    
    if (process.env.NODE_ENV === 'development') {
      this.writeError(error.stack);
    }
  }

  setupSignalHandlers() {
    const handleShutdown = (signal) => {
      this.writeError(`Received ${signal}, shutting down gracefully...`);
      process.exit(0);
    };

    process.on('SIGINT', handleShutdown);
    process.on('SIGTERM', handleShutdown);
  }
  validateEnvironment() {
    const nodeVersion = process.version;
    const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
    
    if (majorVersion < 20) {
      this.writeError(`Node.js version ${nodeVersion} is not supported. Please use Node.js 20 or later.`);
      return false;
    }
    
    return true;
  }
  static async main() {
    const application = new CapitalGainsCLI();
    
    if (!application.validateEnvironment()) {
      process.exit(1);
    }
    
    application.setupSignalHandlers();
    
    await application.run();
  }
}
