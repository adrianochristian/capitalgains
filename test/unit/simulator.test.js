import { TaxSimulator } from '../../src/domain/services/simulator.js';
import { Operation } from '../../src/domain/entities/operation.js';
import { Portfolio } from '../../src/domain/entities/portfolio.js';
import { OperationType } from '../../src/domain/values/operation-type.js';
import { Money } from '../../src/domain/values/money.js';
import { Quantity } from '../../src/domain/values/quantity.js';

describe('TaxSimulator', () => {
  let simulator;

  beforeEach(() => {
    simulator = new TaxSimulator();
  });

  describe('constructor', () => {
    it('should create simulator with empty portfolio by default', () => {
      const portfolio = simulator.getPortfolio();
      expect(portfolio.hasPosition()).toBe(false);
      expect(portfolio.getAccumulatedLoss().isZero()).toBe(true);
    });

    it('should accept custom initial portfolio', () => {
      const customPortfolio = new Portfolio({
        quantity: Quantity.fromNumber(100),
        averageCost: Money.fromNumber(10),
        accumulatedLoss: Money.fromNumber(50)
      });
      
      const customSimulator = new TaxSimulator({ initialPortfolio: customPortfolio });
      const portfolio = customSimulator.getPortfolio();
      
      expect(portfolio.hasPosition()).toBe(true);
      expect(portfolio.getQuantity().toNumber()).toBe(100);
      expect(portfolio.getAverageCost().toNumber()).toBe(10);
      expect(portfolio.getAccumulatedLoss().toNumber()).toBe(50);
    });
  });

  describe('processOperations - buy operations', () => {
    it('should handle first buy operation', () => {
      const buyOp = new Operation({
        type: OperationType.fromString('buy'),
        unitPrice: Money.fromNumber(10.00),
        quantity: Quantity.fromNumber(1000),
      });

      const result = simulator.processOperations([buyOp]);
      
      expect(result.isOk()).toBe(true);
      const results = result.getValue();
      expect(results).toHaveLength(1);
      expect(results[0].getTax().isZero()).toBe(true);
      
      const portfolio = simulator.getPortfolio();
      expect(portfolio.hasPosition()).toBe(true);
      expect(portfolio.getQuantity().toNumber()).toBe(1000);
      expect(portfolio.getAverageCost().toNumber()).toBe(10.00);
    });

    it('should calculate weighted average cost for multiple buys', () => {
      const buyOp1 = new Operation({
        type: OperationType.fromString('buy'),
        unitPrice: Money.fromNumber(10.00),
        quantity: Quantity.fromNumber(100),
      });

      const buyOp2 = new Operation({
        type: OperationType.fromString('buy'),
        unitPrice: Money.fromNumber(25.00),
        quantity: Quantity.fromNumber(100),
      });

      const result = simulator.processOperations([buyOp1, buyOp2]);
      
      expect(result.isOk()).toBe(true);
      const portfolio = simulator.getPortfolio();
      expect(portfolio.getQuantity().toNumber()).toBe(200);
      expect(portfolio.getAverageCost().toNumber()).toBe(17.50);
    });
  });

  describe('processOperations - sell operations', () => {
    beforeEach(() => {
      const buyOp = new Operation({
        type: OperationType.fromString('buy'),
        unitPrice: Money.fromNumber(10.00),
        quantity: Quantity.fromNumber(1000),
      });
      simulator.processOperations([buyOp]);
    });

    it('should handle profitable sell within exemption threshold', () => {
      const sellOp = new Operation({
        type: OperationType.fromString('sell'),
        unitPrice: Money.fromNumber(15.00),
        quantity: Quantity.fromNumber(100),
      });

      const result = simulator.processOperations([sellOp]);
      
      expect(result.isOk()).toBe(true);
      const results = result.getValue();
      expect(results[0].getTax().isZero()).toBe(true);
    });

    it('should calculate tax on profitable sell above exemption threshold', () => {
      const sellOp = new Operation({
        type: OperationType.fromString('sell'),
        unitPrice: Money.fromNumber(25.00),
        quantity: Quantity.fromNumber(1000),
      });

      const result = simulator.processOperations([sellOp]);
      
      expect(result.isOk()).toBe(true);
      const results = result.getValue();
      expect(results[0].getTax().toNumber()).toBe(3000);
    });

    it('should accumulate loss and not generate tax', () => {
      const sellOp = new Operation({
        type: OperationType.fromString('sell'),
        unitPrice: Money.fromNumber(5.00),
        quantity: Quantity.fromNumber(100),
      });

      const result = simulator.processOperations([sellOp]);
      
      expect(result.isOk()).toBe(true);
      const results = result.getValue();
      expect(results[0].getTax().isZero()).toBe(true);
      
      const portfolio = simulator.getPortfolio();
      expect(portfolio.getAccumulatedLoss().toNumber()).toBe(500); // Loss of 500
    });

    it('should compensate accumulated losses with future profits', () => {
      const buyInitial = new Operation({
        type: OperationType.fromString('buy'),
        unitPrice: Money.fromNumber(10.00),
        quantity: Quantity.fromNumber(100),
      });

      const sellLoss = new Operation({
        type: OperationType.fromString('sell'),
        unitPrice: Money.fromNumber(5.00),
        quantity: Quantity.fromNumber(100),
      });

      const buyMore = new Operation({
        type: OperationType.fromString('buy'),
        unitPrice: Money.fromNumber(10.00),
        quantity: Quantity.fromNumber(100),
      });

      const sellProfit = new Operation({
        type: OperationType.fromString('sell'),
        unitPrice: Money.fromNumber(250.00),
        quantity: Quantity.fromNumber(100),
      });

      const result = simulator.processOperations([buyInitial, sellLoss, buyMore, sellProfit]);
      
      expect(result.isOk()).toBe(true);
      const results = result.getValue();
      
      expect(results[0].getTax().isZero()).toBe(true);
      expect(results[1].getTax().isZero()).toBe(true);
      expect(results[2].getTax().isZero()).toBe(true);
      
      expect(results[3].getTax().toNumber()).toBe(4700);
    });

    it('should error when trying to sell more than owned', () => {
      const sellOp = new Operation({
        type: OperationType.fromString('sell'),
        unitPrice: Money.fromNumber(15.00),
        quantity: Quantity.fromNumber(2000),
      });

      const result = simulator.processOperations([sellOp]);
      
      expect(result.isErr()).toBe(true);
      const error = result.getError();
      expect(error.getCode()).toBe('SELL_EXCEEDS_POSITION');
    });

    it('should error when trying to sell from empty portfolio', () => {
      const emptySimulator = new TaxSimulator();
      const sellOp = new Operation({
        type: OperationType.fromString('sell'),
        unitPrice: Money.fromNumber(15.00),
        quantity: Quantity.fromNumber(100),
      });

      const result = emptySimulator.processOperations([sellOp]);
      
      expect(result.isErr()).toBe(true);
      const error = result.getError();
      expect(error.getCode()).toBe('SELL_EXCEEDS_POSITION');
    });
  });

  describe('reset', () => {
    it('should reset simulator to empty state', () => {
      const buyOp = new Operation({
        type: OperationType.fromString('buy'),
        unitPrice: Money.fromNumber(10.00),
        quantity: Quantity.fromNumber(1000),
      });

      simulator.processOperations([buyOp]);
      expect(simulator.getPortfolio().hasPosition()).toBe(true);
      
      simulator.reset();
      expect(simulator.getPortfolio().hasPosition()).toBe(false);
      expect(simulator.getPortfolio().getAccumulatedLoss().isZero()).toBe(true);
    });
  });

  describe('clone', () => {
    it('should create a copy with same state', () => {
      const buyOp = new Operation({
        type: OperationType.fromString('buy'),
        unitPrice: Money.fromNumber(10.00),
        quantity: Quantity.fromNumber(1000),
      });

      simulator.processOperations([buyOp]);
      const cloned = simulator.clone();
      
      expect(cloned.getPortfolio().equals(simulator.getPortfolio())).toBe(true);
      
      cloned.reset();
      expect(cloned.getPortfolio().hasPosition()).toBe(false);
      expect(simulator.getPortfolio().hasPosition()).toBe(true);
    });
  });
});
