import { Inject, Injectable, Logger } from '@nestjs/common';
import Keyv from 'keyv';

@Injectable()
export class RedisService {
  private readonly logger = new Logger(RedisService.name);
  private isConnected = true;
  private redisClient: any; // Underlying Redis client

  constructor(@Inject('REDIS_INSTANCE') private readonly redis: Keyv) {
    this.setupErrorHandlers();
    this.extractRedisClient();
  }

  private extractRedisClient(): void {
    // Try different paths to access the underlying Redis client
    try {
      // For @keyv/redis adapter
      this.redisClient = (this.redis as any).opts?.store?.redis;

      // Alternative paths
      if (!this.redisClient) {
        this.redisClient = (this.redis as any).opts?.store?.client;
      }
      if (!this.redisClient) {
        this.redisClient = (this.redis as any).redis;
      }
      if (!this.redisClient) {
        this.redisClient = (this.redis as any).opts?.store;
      }

      if (this.redisClient) {
        this.logger.log('Successfully extracted underlying Redis client');
      } else {
        this.logger.warn(
          'Could not extract Redis client - pattern deletion will not work'
        );
      }
    } catch (error) {
      this.logger.error(
        'Error extracting Redis client:',
        (error as Error).message
      );
    }
  }

  private setupErrorHandlers(): void {
    this.redis.on('error', (err) => {
      this.logger.error('Redis connection error:', err.message);
      this.isConnected = false;
    });

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
  }

  async get<T>(key: string): Promise<T | undefined> {
    if (!this.isConnected) {
      this.logger.warn(`Redis disconnected, skipping GET: ${key}`);
      return undefined;
    }

    try {
      this.logger.log(`Getting from Redis: ${key}`);
      const value = await this.redis.get<string>(key);
      if (!value) {
        this.logger.log(`Cache MISS: ${key}`);
        return undefined;
      }

      this.logger.log(`Cache HIT: ${key}`);
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
      return undefined;
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

      // Get the namespace from Keyv if it exists
      const namespace = (this.redis as any).opts?.namespace;
      const fullPrefix = namespace ? `${namespace}:${prefix}` : prefix;

      if (
        this.redisClient &&
        typeof this.redisClient.scanStream === 'function'
      ) {
        // Method 1: Use scanStream (ioredis)
        await this.deleteWithScanStream(fullPrefix);
      } else if (
        this.redisClient &&
        typeof this.redisClient.scanIterator === 'function'
      ) {
        // Method 2: Use scanIterator (node-redis v4+)
        await this.deleteWithScanIterator(fullPrefix);
      } else if (
        this.redisClient &&
        typeof this.redisClient.scan === 'function'
      ) {
        // Method 3: Use manual SCAN loop
        await this.deleteWithManualScan(fullPrefix);
      } else {
        // Fallback: Try to use Keyv's iterator (probably won't work based on your error)
        this.logger.warn(
          'No Redis client available for pattern deletion, attempting Keyv iterator fallback'
        );
        await this.deleteWithKeyvIterator(prefix);
      }
    } catch (error) {
      this.handleError(`deleteKeyStartingWith(${prefix})`, error as Error);
    }
  }

  // Method 1: ioredis scanStream
  private async deleteWithScanStream(pattern: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const stream = this.redisClient.scanStream({
        match: `${pattern}*`,
        count: 100,
      });

      const keysToDelete: string[] = [];

      stream.on('data', (keys: string[]) => {
        keysToDelete.push(...keys);
      });

      stream.on('end', async () => {
        if (keysToDelete.length > 0) {
          this.logger.debug(
            `Deleting ${keysToDelete.length} keys matching pattern: ${pattern}`
          );
          // Delete in batches of 100
          for (let i = 0; i < keysToDelete.length; i += 100) {
            const batch = keysToDelete.slice(i, i + 100);
            await this.redisClient.del(...batch);
          }
        } else {
          this.logger.debug(`No keys found matching pattern: ${pattern}`);
        }
        resolve();
      });

      stream.on('error', reject);
    });
  }

  // Method 2: node-redis v4+ scanIterator
  private async deleteWithScanIterator(pattern: string): Promise<void> {
    const keysToDelete: string[] = [];

    for await (const key of this.redisClient.scanIterator({
      MATCH: `${pattern}*`,
      COUNT: 100,
    })) {
      keysToDelete.push(key);
    }

    if (keysToDelete.length > 0) {
      this.logger.debug(
        `Deleting ${keysToDelete.length} keys matching pattern: ${pattern}`
      );
      // Delete in batches
      for (let i = 0; i < keysToDelete.length; i += 100) {
        const batch = keysToDelete.slice(i, i + 100);
        await this.redisClient.del(batch);
      }
    } else {
      this.logger.debug(`No keys found matching pattern: ${pattern}`);
    }
  }

  // Method 3: Manual SCAN loop
  private async deleteWithManualScan(pattern: string): Promise<void> {
    let cursor = '0';
    const keysToDelete: string[] = [];

    do {
      const reply = await this.redisClient.scan(
        cursor,
        'MATCH',
        `${pattern}*`,
        'COUNT',
        100
      );
      cursor = reply[0];
      const keys = reply[1];
      keysToDelete.push(...keys);
    } while (cursor !== '0');

    if (keysToDelete.length > 0) {
      this.logger.debug(
        `Deleting ${keysToDelete.length} keys matching pattern: ${pattern}`
      );
      // Delete in batches
      for (let i = 0; i < keysToDelete.length; i += 100) {
        const batch = keysToDelete.slice(i, i + 100);
        if (batch.length === 1) {
          await this.redisClient.del(batch[0]);
        } else {
          await this.redisClient.del(...batch);
        }
      }
    } else {
      this.logger.debug(`No keys found matching pattern: ${pattern}`);
    }
  }

  // Fallback: Keyv iterator (likely won't work)
  private async deleteWithKeyvIterator(prefix: string): Promise<void> {
    const iteratorFn = (this.redis as any).iterator;
    if (typeof iteratorFn !== 'function') {
      this.logger.error(
        'Keyv iterator not available and no Redis client found - pattern deletion failed'
      );
      return;
    }

    const iterator = iteratorFn.call(this.redis, undefined);
    const keysToDelete: string[] = [];

    for await (const key of iterator) {
      if (typeof key === 'string' && key.startsWith(prefix)) {
        keysToDelete.push(key);
      }
    }

    if (keysToDelete.length > 0) {
      await Promise.all(keysToDelete.map((key) => this.redis.delete(key)));
      this.logger.debug(
        `Deleted ${keysToDelete.length} keys using Keyv iterator`
      );
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
