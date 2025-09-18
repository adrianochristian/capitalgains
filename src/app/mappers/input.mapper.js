import { Operation } from '../../domain/entities/operation.js';
export class InputMapper {
  mapOperations(rawOperations) {
    return rawOperations.map((raw) => this.mapOperation(raw));
  }
  mapOperation(rawOperation) {
    const type = String(rawOperation.operation).toLowerCase();
    const unitPrice = Number(rawOperation['unit-cost']);
    const quantity = Number(rawOperation.quantity);
    return new Operation({ type, unitPrice, quantity });
  }
  parseAndMapOperations(jsonInput) {
    const parsed = JSON.parse(jsonInput.trim());
    return this.mapOperations(parsed);
  }
}
