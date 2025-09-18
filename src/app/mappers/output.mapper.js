export class OutputMapper {
  mapResults(taxResults) {
    const outputArray = taxResults.map(r => this.mapSingleResult(r));
    return JSON.stringify(outputArray);
  }
  mapSingleResult(result) {
    return { tax: this.formatTaxAmount(result.getTax()) };
  }
  formatTaxAmount(taxAmount) {
    if (!Number.isFinite(taxAmount)) return 0;
    return Math.round(taxAmount * 100) / 100;
  }
  mapMultipleSimulations(simulationResults) {
    return simulationResults.map(resultsForLine => this.mapResults(resultsForLine));
  }
}
