import { Money } from '../values/money.js';
import { DomainErrors } from '../errors/errors.js';
import { Ok, Err } from '../results/result.js';
export class OperationProcessor {
  processBuy(operation, portfolio) {
    try {
      const tradeValue = operation.getTradeValue();
      const newPortfolio = portfolio.addPosition(operation.getQuantity(), operation.getUnitPrice());
      const grossProfit = Money.zero();
      return Ok.of({ portfolio: newPortfolio, tradeValue, grossProfit });
    } catch (error) {
      return Err.of(DomainErrors.internalError(error.message, { operation: operation.toString() }));
    }
  }

  processSell(operation, portfolio, index) {
    try {
      if (!portfolio.hasPosition()) {
        return Err.of(DomainErrors.sellExceedsPosition(
          operation.getQuantity().toNumber(),
          0,
          index
        ));
      }

      if (operation.getQuantity().isGreaterThan(portfolio.getQuantity())) {
        return Err.of(DomainErrors.sellExceedsPosition(
          operation.getQuantity().toNumber(),
          portfolio.getQuantity().toNumber(),
          index
        ));
      }

      const costBasis = portfolio.getCostBasis(operation.getQuantity());
      const tradeValue = operation.getTradeValue();
      const grossProfit = tradeValue.subtract(costBasis);

      const newPortfolio = portfolio.removePosition(operation.getQuantity());

      return Ok.of({ portfolio: newPortfolio, tradeValue, grossProfit });
    } catch (error) {
      return Err.of(DomainErrors.internalError(error.message, { index }));
    }
  }

}
