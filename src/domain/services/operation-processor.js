export class OperationProcessor {
  processBuy(operation, portfolio) {
    const newPortfolio = portfolio.addPosition(operation.getQuantity(), operation.getUnitPrice());
    return { portfolio: newPortfolio };
  }

  processSell(operation, portfolio) {
    const costBasis = portfolio.getCostBasis(operation.getQuantity());
    const tradeValue = operation.getTradeValue();
    const grossProfit = tradeValue - costBasis;
    const newPortfolio = portfolio.removePosition(operation.getQuantity());
    return { portfolio: newPortfolio, tradeValue, grossProfit };
  }

}
