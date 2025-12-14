/**
 * Fetch-based HTTP client for TickTick API
 * Replaces axios with native fetch for zero dependencies
 */

import {
  HttpRequestConfig,
  HttpResponse,
  ApiErrorResponse,
} from '../types/api';
import {
  TickTickApiError,
  TickTickNetworkError,
  TickTickTimeoutError,
} from '../types/errors';

export class HttpClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;
  private defaultTimeout: number;
  private getToken?: () => Promise<string | null>;

  constructor(
    baseURL: string,
    defaultTimeout: number = 30000,
    getToken?: () => Promise<string | null>
  ) {
    this.baseURL = baseURL;
    this.defaultTimeout = defaultTimeout;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
    this.getToken = getToken;
  }

  /**
   * Make an HTTP request
   */
  async request<T = unknown>(config: HttpRequestConfig): Promise<HttpResponse<T>> {
    const {
      method,
      url,
      headers = {},
      body,
      timeout = this.defaultTimeout,
    } = config;

    const fullUrl = url.startsWith('http') ? url : `${this.baseURL}${url}`;

    // Prepare headers
    const requestHeaders: Record<string, string> = {
      ...this.defaultHeaders,
      ...headers,
    };

    // Add auth token if available
    if (this.getToken) {
      const token = await this.getToken();
      if (token) {
        requestHeaders['Authorization'] = `Bearer ${token}`;
      }
    }

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(fullUrl, {
        method,
        headers: requestHeaders,
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Parse response
      const responseHeaders = this.parseHeaders(response.headers);
      const contentType = response.headers.get('content-type');
      const isJson = contentType?.includes('application/json');

      let data: T;
      if (isJson) {
        data = (await response.json()) as T;
      } else {
        data = (await response.text()) as unknown as T;
      }

      // Handle error responses
      if (!response.ok) {
        const errorResponse = data as unknown as ApiErrorResponse;
        const errorMessage =
          errorResponse.errorMessage ||
          errorResponse.message ||
          errorResponse.error_description ||
          errorResponse.error ||
          `HTTP ${response.status}: ${response.statusText}`;

        throw new TickTickApiError(
          errorMessage,
          response.status,
          response.statusText,
          errorResponse.errorCode,
          data
        );
      }

      return {
        data,
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
      };
    } catch (error) {
      clearTimeout(timeoutId);

      // Handle abort (timeout)
      if (error instanceof Error && error.name === 'AbortError') {
        throw new TickTickTimeoutError(`Request timeout after ${timeout}ms`);
      }

      // Re-throw API errors
      if (error instanceof TickTickApiError) {
        throw error;
      }

      // Handle network errors
      throw new TickTickNetworkError(
        `Network request failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * GET request
   */
  async get<T = unknown>(
    url: string,
    headers?: Record<string, string>,
    timeout?: number
  ): Promise<HttpResponse<T>> {
    return this.request<T>({
      method: 'GET',
      url,
      headers,
      timeout,
    });
  }

  /**
   * POST request
   */
  async post<T = unknown>(
    url: string,
    body?: unknown,
    headers?: Record<string, string>,
    timeout?: number
  ): Promise<HttpResponse<T>> {
    return this.request<T>({
      method: 'POST',
      url,
      body,
      headers,
      timeout,
    });
  }

  /**
   * PUT request
   */
  async put<T = unknown>(
    url: string,
    body?: unknown,
    headers?: Record<string, string>,
    timeout?: number
  ): Promise<HttpResponse<T>> {
    return this.request<T>({
      method: 'PUT',
      url,
      body,
      headers,
      timeout,
    });
  }

  /**
   * DELETE request
   */
  async delete<T = unknown>(
    url: string,
    headers?: Record<string, string>,
    timeout?: number
  ): Promise<HttpResponse<T>> {
    return this.request<T>({
      method: 'DELETE',
      url,
      headers,
      timeout,
    });
  }

  /**
   * PATCH request
   */
  async patch<T = unknown>(
    url: string,
    body?: unknown,
    headers?: Record<string, string>,
    timeout?: number
  ): Promise<HttpResponse<T>> {
    return this.request<T>({
      method: 'PATCH',
      url,
      body,
      headers,
      timeout,
    });
  }

  /**
   * Parse headers from Response
   */
  private parseHeaders(headers: Headers): Record<string, string> {
    const result: Record<string, string> = {};
    headers.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  }
}
