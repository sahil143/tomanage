/**
 * Custom error classes for TickTick SDK
 */

export class TickTickError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TickTickError';
    Object.setPrototypeOf(this, TickTickError.prototype);
  }
}

export class TickTickApiError extends TickTickError {
  public readonly status: number;
  public readonly statusText: string;
  public readonly errorCode?: string;
  public readonly response?: unknown;

  constructor(
    message: string,
    status: number,
    statusText: string,
    errorCode?: string,
    response?: unknown
  ) {
    super(message);
    this.name = 'TickTickApiError';
    this.status = status;
    this.statusText = statusText;
    this.errorCode = errorCode;
    this.response = response;
    Object.setPrototypeOf(this, TickTickApiError.prototype);
  }
}

export class TickTickAuthError extends TickTickError {
  constructor(message: string) {
    super(message);
    this.name = 'TickTickAuthError';
    Object.setPrototypeOf(this, TickTickAuthError.prototype);
  }
}

export class TickTickNetworkError extends TickTickError {
  public readonly cause?: Error;

  constructor(message: string, cause?: Error) {
    super(message);
    this.name = 'TickTickNetworkError';
    this.cause = cause;
    Object.setPrototypeOf(this, TickTickNetworkError.prototype);
  }
}

export class TickTickTimeoutError extends TickTickError {
  constructor(message: string = 'Request timeout') {
    super(message);
    this.name = 'TickTickTimeoutError';
    Object.setPrototypeOf(this, TickTickTimeoutError.prototype);
  }
}
