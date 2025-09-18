export const ErrorCodes = {
  MISSING_FIELD: 'MISSING_FIELD',
  INVALID_OPERATION_TYPE: 'INVALID_OPERATION_TYPE',
  NON_FINITE_UNIT_COST: 'NON_FINITE_UNIT_COST',
  NEGATIVE_OR_ZERO_QUANTITY: 'NEGATIVE_OR_ZERO_QUANTITY',
  NEGATIVE_UNIT_COST: 'NEGATIVE_UNIT_COST',
  UNSUPPORTED_ASSET_KIND: 'UNSUPPORTED_ASSET_KIND',
  SELL_EXCEEDS_POSITION: 'SELL_EXCEEDS_POSITION',
  INVALID_PORTFOLIO_STATE: 'INVALID_PORTFOLIO_STATE',
  INVALID_JSON: 'INVALID_JSON',
  EMPTY_INPUT: 'EMPTY_INPUT',
  INTERNAL_ERROR: 'INTERNAL_ERROR'
};

export class DomainError extends Error {
  #code;
  #details;
  constructor(code, message, details = {}) {
    super(message);
    this.name = 'DomainError';
    this.#code = code;
    this.#details = { ...details };
    Error.captureStackTrace?.(this, DomainError);
  }

  getCode() {
    return this.#code;
  }
  getDetails() {
    return { ...this.#details };
  }
  hasCode(code) {
    return this.#code === code;
  }
  withDetails(additionalDetails) {
    return new DomainError(
      this.#code,
      this.message,
      { ...this.#details, ...additionalDetails }
    );
  }
  toJSON() {
    return {
      code: this.#code,
      message: this.message,
      details: this.#details
    };
  }
  toString() {
    return `${this.#code}: ${this.message} (${JSON.stringify(this.#details)})`;
  }
}
export const DomainErrors = {
  missingField(fieldName, index) {
    const details = { field: fieldName, index };
    
    return new DomainError(
      ErrorCodes.MISSING_FIELD,
      `Required field '${fieldName}' is missing`,
      details
    );
  },

  invalidOperationType(value, index) {
    const details = { value, validTypes: ['buy', 'sell'], index };
    
    return new DomainError(
      ErrorCodes.INVALID_OPERATION_TYPE,
      `Invalid operation type: ${value}. Must be 'buy' or 'sell'`,
      details
    );
  },

  nonFiniteUnitCost(value, index) {
    const details = { value, index };
    
    return new DomainError(
      ErrorCodes.NON_FINITE_UNIT_COST,
      `Unit cost must be a finite number: ${value}`,
      details
    );
  },

  negativeOrZeroQuantity(value, index) {
    const details = { value, index };
    
    return new DomainError(
      ErrorCodes.NEGATIVE_OR_ZERO_QUANTITY,
      `Quantity must be positive: ${value}`,
      details
    );
  },

  negativeUnitCost(value, index) {
    const details = { value, index };
    
    return new DomainError(
      ErrorCodes.NEGATIVE_UNIT_COST,
      `Unit cost cannot be negative: ${value}`,
      details
    );
  },

  sellExceedsPosition(requested, available, index) {
    const details = { requested, available, index };
    
    return new DomainError(
      ErrorCodes.SELL_EXCEEDS_POSITION,
      `Cannot sell ${requested} units. Only ${available} units available`,
      details
    );
  },

  unsupportedAssetKind(value, index) {
    const details = { value, supportedKinds: ['stock', 'etf', 'bdr'], index };
    
    return new DomainError(
      ErrorCodes.UNSUPPORTED_ASSET_KIND,
      `Unsupported asset kind: ${value}. Must be one of: stock, etf, bdr`,
      details
    );
  },

  invalidJSON(input, parseError) {
    return new DomainError(
      ErrorCodes.INVALID_JSON,
      `Invalid JSON input: ${parseError}`,
      { input: input.substring(0, 100), parseError }
    );
  },
  emptyInput() {
    return new DomainError(
      ErrorCodes.EMPTY_INPUT,
      'Input cannot be empty',
      {}
    );
  },
  internalError(message, details = {}) {
    return new DomainError(
      ErrorCodes.INTERNAL_ERROR,
      `Internal error: ${message}`,
      details
    );
  }
};
