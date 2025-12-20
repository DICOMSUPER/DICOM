import {
  ClientProxyFactory,
  Transport,
  ClientProxy,
} from '@nestjs/microservices';

/**
 * Test utilities for user-service E2E tests
 */

export interface TestClientConfig {
  host: string;
  port: number;
}

/**
 * Create a TCP client for connecting to user-service
 */
export function createTestClient(config?: Partial<TestClientConfig>): ClientProxy {
  const host = config?.host ?? process.env.HOST ?? 'localhost';
  const port = config?.port ?? (process.env.PORT ? Number(process.env.PORT) : 5002);

  return ClientProxyFactory.create({
    transport: Transport.TCP,
    options: {
      host,
      port,
    },
  });
}

/**
 * Extract error message from RPC exception
 */
export function getErrorMessage(error: any): string {
  return error?.message || error?.response?.message || JSON.stringify(error);
}

/**
 * Generate unique test identifiers
 */
export function generateTestId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(7)}`;
}

/**
 * Generate test email
 */
export function generateTestEmail(prefix = 'test'): string {
  return `${prefix}_${Date.now()}@test.com`;
}

/**
 * Generate test date string (ISO format)
 */
export function generateFutureDate(daysFromNow: number): string {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString().split('T')[0];
}

/**
 * Wait for a specified duration
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry a function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  initialDelay = 1000
): Promise<T> {
  let lastError: Error | undefined;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (i < maxRetries - 1) {
        await sleep(initialDelay * Math.pow(2, i));
      }
    }
  }
  
  throw lastError;
}
