import { OperationType } from '../../domain/values/operation-type.js';
import { Money } from '../../domain/values/money.js';
import { Quantity } from '../../domain/values/quantity.js';
import { Operation } from '../../domain/entities/operation.js';
import { Ok, Err } from '../../domain/results/result.js';
import { DomainErrors } from '../../domain/errors/errors.js';
export class InputMapper {
  mapOperations(rawOperations) {
    if (!Array.isArray(rawOperations)) {
      return Err.of(DomainErrors.internalError('Operations must be an array'));
    }

    if (rawOperations.length === 0) {
      return Err.of(DomainErrors.emptyInput());
    }

    const operations = [];
    for (let i = 0; i < rawOperations.length; i++) {
      const rawOperation = rawOperations[i];
      const result = this.mapOperation(rawOperation, i);
      
      if (result.isErr()) {
        return result;
      }
      
      operations.push(result.getValue());
    }

    return Ok.of(operations);
  }

  mapOperation(rawOperation, index) {
    if (!rawOperation || typeof rawOperation !== 'object') {
      return Err.of(DomainErrors.internalError('Operation must be an object', { index }));
    }

    const requiredFields = ['operation', 'unit-cost', 'quantity'];
    for (const field of requiredFields) {
      if (!(field in rawOperation)) {
        return Err.of(DomainErrors.missingField(field, index));
      }
    }

    const typeResult = this.mapOperationType(rawOperation.operation, index);
    if (typeResult.isErr()) {
      return typeResult;
    }

    const unitCostResult = this.mapUnitCost(rawOperation['unit-cost'], index);
    if (unitCostResult.isErr()) {
      return unitCostResult;
    }

    const quantityResult = this.mapQuantity(rawOperation.quantity, index);
    if (quantityResult.isErr()) {
      return quantityResult;
    }

    const operation = new Operation({
      type: typeResult.getValue(),
      unitPrice: unitCostResult.getValue(),
      quantity: quantityResult.getValue()
    });
    return Ok.of(operation);
  }

  mapOperationType(rawType, index) {
    if (typeof rawType !== 'string') {
      return Err.of(DomainErrors.invalidOperationType(rawType, index));
    }

    try {
      const operationType = OperationType.fromString(rawType);
      return Ok.of(operationType);
    } catch (error) {
      return Err.of(DomainErrors.invalidOperationType(rawType, index));
    }
  }

  mapUnitCost(rawUnitCost, index) {
    if (typeof rawUnitCost !== 'number') {
      return Err.of(DomainErrors.nonFiniteUnitCost(rawUnitCost, index));
    }

    if (!Number.isFinite(rawUnitCost)) {
      return Err.of(DomainErrors.nonFiniteUnitCost(rawUnitCost, index));
    }

    if (rawUnitCost < 0) {
      return Err.of(DomainErrors.negativeUnitCost(rawUnitCost, index));
    }

    const money = Money.fromNumber(rawUnitCost);
    return Ok.of(money);
  }

  mapQuantity(rawQuantity, index) {
    if (typeof rawQuantity !== 'number') {
      return Err.of(DomainErrors.negativeOrZeroQuantity(rawQuantity, index));
    }

    if (!Number.isFinite(rawQuantity)) {
      return Err.of(DomainErrors.negativeOrZeroQuantity(rawQuantity, index));
    }

    if (rawQuantity <= 0) {
      return Err.of(DomainErrors.negativeOrZeroQuantity(rawQuantity, index));
    }

    const quantity = Quantity.fromNumber(rawQuantity);
    return Ok.of(quantity);
  }

  parseJSON(jsonInput) {
    if (typeof jsonInput !== 'string') {
      return Err.of(DomainErrors.invalidJSON('', 'Input must be a string'));
    }

    const trimmed = jsonInput.trim();
    if (trimmed === '') {
      return Err.of(DomainErrors.emptyInput());
    }

    try {
      const parsed = JSON.parse(trimmed);
      return Ok.of(parsed);
    } catch (error) {
      return Err.of(DomainErrors.invalidJSON(trimmed, error.message));
    }
  }

  parseAndMapOperations(jsonInput) {
    const parseResult = this.parseJSON(jsonInput);
    if (parseResult.isErr()) {
      return parseResult;
    }

    return this.mapOperations(parseResult.getValue());
  }
}
