import { Inject, Injectable, Logger } from '@nestjs/common';
import Keyv from 'keyv';

@Injectable()
export class RedisService {
  private readonly logger = new Logger(RedisService.name);
  private isConnected = true;

  constructor(@Inject('REDIS_INSTANCE') private readonly redis: Keyv) {
    this.setupErrorHandlers();
  }

  private setupErrorHandlers(): void {
    // Handle connection errors
    this.redis.on('error', (err) => {
      this.logger.error('Redis connection error:', err.message);
      this.isConnected = false;
    });

    // Handle successful reconnection
    this.redis.on('connect', () => {
      this.logger.log('Redis connection established');
      this.isConnected = true;
    });
  }

  private handleError(operation: string, error: Error): void {
    this.logger.error(
      `Redis ${operation} failed: ${error.message}`,
      error.stack
    );
    // Don't throw - let app continue without cache
  }

  async get<T>(key: string): Promise<T | undefined> {
    if (!this.isConnected) {
      this.logger.warn(`Redis disconnected, skipping GET: ${key}`);
      return undefined;
    }

    try {
      this.logger.log(`Getting from Redis: ${key}`); // Changed from debug
      const value = await this.redis.get<string>(key);
      if (!value) {
        this.logger.log(`Cache MISS: ${key}`); // Add this
        return undefined;
      }

      this.logger.log(`Cache HIT: ${key}`); // Add this
      try {
        return JSON.parse(value) as T;
      } catch (parseError) {
        this.logger.warn(
          `Failed to parse cache value for key ${key}: ${
            (parseError as Error).message
          }`
        );
        return value as T;
      }
    } catch (error) {
      this.handleError(`get(${key})`, error as Error);
      return undefined; // Graceful degradation
    }
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    if (!this.isConnected) {
      this.logger.warn(`Redis disconnected, skipping SET: ${key}`);
      return;
    }

    try {
      this.logger.debug(`Storing in Redis: ${key} (ttl=${ttl ?? 'default'})`);
      await this.redis.set(key, JSON.stringify(value), ttl);
    } catch (error) {
      this.handleError(`set(${key})`, error as Error);
      // Don't throw - cache miss is acceptable
    }
  }

  async delete(key: string): Promise<void> {
    if (!this.isConnected) {
      this.logger.warn(`Redis disconnected, skipping DELETE: ${key}`);
      return;
    }

    try {
      this.logger.debug(`Deleting from Redis: ${key}`);
      await this.redis.delete(key);
    } catch (error) {
      this.handleError(`delete(${key})`, error as Error);
    }
  }

  async deleteKeyStartingWith(prefix: string): Promise<void> {
    if (!this.isConnected) {
      this.logger.warn(
        `Redis disconnected, skipping DELETE pattern: ${prefix}`
      );
      return;
    }

    try {
      this.logger.debug(`Deleting keys from Redis starting with: ${prefix}`);

      const iteratorFn = (this.redis as any).iterator;
      if (typeof iteratorFn !== 'function') {
        this.logger.warn(
          'Redis instance does not expose an iterator function; skipping deleteKeyStartingWith.'
        );
        return;
      }

      const iterator = iteratorFn.call(this.redis, undefined);
      const keysToDelete: string[] = [];

      // Collect keys first to avoid iterator issues
      for await (const key of iterator) {
        if (typeof key === 'string' && key.startsWith(prefix)) {
          keysToDelete.push(key);
        }
      }

      // Delete in batch
      await Promise.allSettled(
        keysToDelete.map((key) => {
          this.logger.debug(`Deleting key: ${key}`);
          return this.redis.delete(key);
        })
      );
    } catch (error) {
      this.handleError(`deleteKeyStartingWith(${prefix})`, error as Error);
    }
  }

  // Health check method
  async isHealthy(): Promise<boolean> {
    try {
      const testKey = '__health_check__';
      await this.redis.set(testKey, 'ok', 5);
      const result = await this.redis.get(testKey);
      await this.redis.delete(testKey);
      return result === 'ok';
    } catch (error) {
      this.logger.error('Redis health check failed:', (error as Error).message);
      return false;
    }
  }
}
