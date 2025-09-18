export class OperationProcessor {
  processBuy(operation, portfolio) {
    const tradeValue = operation.getTradeValue();
    const newPortfolio = portfolio.addPosition(operation.getQuantity(), operation.getUnitPrice());
    const grossProfit = 0;
    return { portfolio: newPortfolio, tradeValue, grossProfit };
  }

  processSell(operation, portfolio, index) {
    const costBasis = portfolio.getCostBasis(operation.getQuantity());
    const tradeValue = operation.getTradeValue();
    const grossProfit = tradeValue - costBasis;
    const newPortfolio = portfolio.removePosition(operation.getQuantity());
    return { portfolio: newPortfolio, tradeValue, grossProfit };
  }

}
