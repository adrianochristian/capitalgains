export class OutputMapper {
  constructor() {}
  mapResults(taxResults) {
    if (!Array.isArray(taxResults)) {
      return this.mapError(new Error('Results must be an array'));
    }

    const outputArray = taxResults.map(result => this.mapSingleResult(result));
    return JSON.stringify(outputArray);
  }

  mapSingleResult(result) {
    try {
      return {
        tax: this.formatTaxAmount(result.getTax().toNumber())
      };
    } catch (error) {
      return this.mapErrorObject(error);
    }
  }
  mapError(domainError) {
    const errorObject = this.mapErrorObject(domainError);
    return JSON.stringify([errorObject]);
  }
  mapErrorObject(error) {
    if (error && typeof error.toJSON === 'function') {
      return { error: error.toJSON() };
    } else {
      return {
        error: {
          code: 'INTERNAL_ERROR',
          message: error?.message || 'Unknown error occurred',
          details: {}
        }
      };
    }
  }
  formatTaxAmount(taxAmount) {
    if (!Number.isFinite(taxAmount)) {
      return 0;
    }
    return Math.round(taxAmount * 100) / 100;
  }
  mapMultipleSimulations(simulationResults) {
    if (!Array.isArray(simulationResults)) {
      return [this.mapError(new Error('Simulation results must be an array'))];
    }

    return simulationResults.map(result => {
      if (result.isOk()) {
        return this.mapResults(result.getValue());
      } else {
        return this.mapError(result.getError());
      }
    });
  }

}
