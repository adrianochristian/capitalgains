export class OutputMapper {
  toOutputLine(taxResults) {
    const outputArray = taxResults.map(r => ({ tax: r.getTax() }));
    const safeNumberReplacer = (_key, value) => {
      if (typeof value === 'number') {
        if (!Number.isFinite(value) || Object.is(value, -0)) return 0;
        return value;
      }
      return value;
    };
    return JSON.stringify(outputArray, safeNumberReplacer);
  }
  mapMultipleLines(resultsByLine) {
    return resultsByLine.map(resultsForLine => this.toOutputLine(resultsForLine));
  }
}
