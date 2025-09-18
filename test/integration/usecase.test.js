import { RunSimulationUseCase } from '../../src/app/run-simulation.usecase.js';

describe('RunSimulationUseCase Integration Tests', () => {
  let useCase;

  beforeEach(() => {
    useCase = new RunSimulationUseCase();
  });

  describe('basic operations', () => {
    it('should handle simple buy operation', () => {
      const input = ['[{"operation":"buy","unit-cost":10.00,"quantity":1000}]'];
      const outputs = useCase.execute(input);
      
      expect(outputs).toHaveLength(1);
      const result = JSON.parse(outputs[0]);
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({ tax: 0 });
    });

    it('should handle buy then sell with profit (below threshold)', () => {
      const input = [
        '[{"operation":"buy","unit-cost":10.00,"quantity":1000},{"operation":"sell","unit-cost":15.00,"quantity":500}]'
      ];
      const outputs = useCase.execute(input);
      
      expect(outputs).toHaveLength(1);
      const result = JSON.parse(outputs[0]);
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ tax: 0 });
      expect(result[1]).toEqual({ tax: 0 });
    });

    it('should handle buy then sell with profit (above threshold)', () => {
      const input = [
        '[{"operation":"buy","unit-cost":10.00,"quantity":1000},{"operation":"sell","unit-cost":25.00,"quantity":1000}]'
      ];
      const outputs = useCase.execute(input);
      
      expect(outputs).toHaveLength(1);
      const result = JSON.parse(outputs[0]);
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ tax: 0 });
      expect(result[1]).toEqual({ tax: 3000 });
    });

    it('should handle loss and subsequent profit with compensation', () => {
      const input = [
        '[{"operation":"buy","unit-cost":20.00,"quantity":10000},{"operation":"sell","unit-cost":10.00,"quantity":5000},{"operation":"sell","unit-cost":20.00,"quantity":2000}]'
      ];
      const outputs = useCase.execute(input);
      
      expect(outputs).toHaveLength(1);
      const result = JSON.parse(outputs[0]);
      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({ tax: 0 });
      expect(result[1]).toEqual({ tax: 0 });
      expect(result[2]).toEqual({ tax: 0 });
    });
  });

  describe('multiple independent simulations', () => {
    it('should handle multiple input lines independently', () => {
      const input = [
        '[{"operation":"buy","unit-cost":10.00,"quantity":1000}]',
        '[{"operation":"buy","unit-cost":20.00,"quantity":500}]'
      ];
      const outputs = useCase.execute(input);
      
      expect(outputs).toHaveLength(2);
      
      const result1 = JSON.parse(outputs[0]);
      expect(result1).toEqual([{ tax: 0 }]);
      
      const result2 = JSON.parse(outputs[1]);
      expect(result2).toEqual([{ tax: 0 }]);
    });

    it('should isolate portfolio state between simulations', () => {
      const input = [
        '[{"operation":"buy","unit-cost":10.00,"quantity":1000}]',
        '[{"operation":"sell","unit-cost":15.00,"quantity":500}]'
      ];
      const outputs = useCase.execute(input);
      
      expect(outputs).toHaveLength(2);
      
      const result1 = JSON.parse(outputs[0]);
      expect(result1).toEqual([{ tax: 0 }]);
      
      const result2 = JSON.parse(outputs[1]);
      expect(result2).toHaveLength(1);
      expect(result2[0].error).toBeTruthy();
      expect(result2[0].error.code).toBe('SELL_EXCEEDS_POSITION');
    });
  });

  describe('error handling', () => {
    it('should handle invalid JSON input', () => {
      const input = ['invalid json'];
      const outputs = useCase.execute(input);
      
      expect(outputs).toHaveLength(1);
      const result = JSON.parse(outputs[0]);
      expect(result).toHaveLength(1);
      expect(result[0].error).toBeTruthy();
      expect(result[0].error.code).toBe('INVALID_JSON');
    });

    it('should handle missing required fields', () => {
      const input = ['[{"operation":"buy","unit-cost":10.00}]'];
      const outputs = useCase.execute(input);
      
      expect(outputs).toHaveLength(1);
      const result = JSON.parse(outputs[0]);
      expect(result).toHaveLength(1);
      expect(result[0].error).toBeTruthy();
      expect(result[0].error.code).toBe('MISSING_FIELD');
      expect(result[0].error.details.field).toBe('quantity');
    });

    it('should handle invalid operation type', () => {
      const input = ['[{"operation":"invalid","unit-cost":10.00,"quantity":1000}]'];
      const outputs = useCase.execute(input);
      
      expect(outputs).toHaveLength(1);
      const result = JSON.parse(outputs[0]);
      expect(result).toHaveLength(1);
      expect(result[0].error).toBeTruthy();
      expect(result[0].error.code).toBe('INVALID_OPERATION_TYPE');
    });

    it('should handle negative quantity', () => {
      const input = ['[{"operation":"buy","unit-cost":10.00,"quantity":-1000}]'];
      const outputs = useCase.execute(input);
      
      expect(outputs).toHaveLength(1);
      const result = JSON.parse(outputs[0]);
      expect(result).toHaveLength(1);
      expect(result[0].error).toBeTruthy();
      expect(result[0].error.code).toBe('NEGATIVE_OR_ZERO_QUANTITY');
    });

    it('should handle non-finite unit cost', () => {
      const input = ['[{"operation":"buy","unit-cost":null,"quantity":1000}]'];
      const outputs = useCase.execute(input);
      
      expect(outputs).toHaveLength(1);
      const result = JSON.parse(outputs[0]);
      expect(result).toHaveLength(1);
      expect(result[0].error).toBeTruthy();
      expect(result[0].error.code).toBe('NON_FINITE_UNIT_COST');
    });

    it('should handle selling more than owned', () => {
      const input = [
        '[{"operation":"buy","unit-cost":10.00,"quantity":1000},{"operation":"sell","unit-cost":15.00,"quantity":2000}]'
      ];
      const outputs = useCase.execute(input);
      
      expect(outputs).toHaveLength(1);
      const result = JSON.parse(outputs[0]);
      expect(result).toHaveLength(1);
      expect(result[0].error).toBeTruthy();
      expect(result[0].error.code).toBe('SELL_EXCEEDS_POSITION');
      expect(result[0].error.details.requested).toBe(2000);
      expect(result[0].error.details.available).toBe(1000);
    });

    it('should handle empty input array', () => {
      const outputs = useCase.execute([]);
      
      expect(outputs).toHaveLength(1);
      const result = JSON.parse(outputs[0]);
      expect(result).toHaveLength(1);
      expect(result[0].error).toBeTruthy();
      expect(result[0].error.code).toBe('EMPTY_INPUT');
    });
  });

  describe('complex scenarios', () => {
    it('should handle the provided test case 1', () => {
      const input = [
        '[{"operation":"buy","unit-cost":10.00,"quantity":10000},{"operation":"sell","unit-cost":2.00,"quantity":5000},{"operation":"sell","unit-cost":20.00,"quantity":2000},{"operation":"sell","unit-cost":20.00,"quantity":2000},{"operation":"sell","unit-cost":25.00,"quantity":1000}]'
      ];
      const outputs = useCase.execute(input);
      
      expect(outputs).toHaveLength(1);
      const result = JSON.parse(outputs[0]);
      expect(result).toHaveLength(5);
      
      expect(result[0]).toEqual({ tax: 0 });
      expect(result[1]).toEqual({ tax: 0 });
      expect(result[2]).toEqual({ tax: 0 });
      expect(result[3]).toEqual({ tax: 0 });
      expect(result[4]).toEqual({ tax: 3000 });
    });

    it('should handle weighted average cost calculation correctly', () => {
      const input = [
        '[{"operation":"buy","unit-cost":10.00,"quantity":100},{"operation":"buy","unit-cost":25.00,"quantity":100},{"operation":"sell","unit-cost":15.00,"quantity":50}]'
      ];
      const outputs = useCase.execute(input);
      
      expect(outputs).toHaveLength(1);
      const result = JSON.parse(outputs[0]);
      expect(result).toHaveLength(3);
      
      expect(result[0]).toEqual({ tax: 0 });
      expect(result[1]).toEqual({ tax: 0 });
      expect(result[2]).toEqual({ tax: 0 });
    });
  });
});
