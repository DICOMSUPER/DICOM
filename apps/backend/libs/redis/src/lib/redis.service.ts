import { Inject, Injectable, Logger, Optional } from '@nestjs/common';
import Keyv from 'keyv';

@Injectable()
export class RedisService {
  private readonly logger = new Logger(RedisService.name);
  private isConnected = true;

  constructor(
    @Inject('REDIS_INSTANCE') private readonly redis: Keyv,
    @Optional() @Inject('REDIS_CLIENT') private readonly redisClient: any
  ) {
    this.setupErrorHandlers();
    this.logClientInfo();
  }

  private logClientInfo(): void {
    if (this.redisClient) {
      this.logger.log('Redis client injected successfully');
      this.logger.log(
        `Redis client type: ${this.redisClient.constructor.name}`
      );

      // Detect Redis library
      if (typeof this.redisClient.scanStream === 'function') {
        this.logger.log('✓ Detected: ioredis (scanStream available)');
      } else if (typeof this.redisClient.scanIterator === 'function') {
        this.logger.log('✓ Detected: node-redis v4+ (scanIterator available)');
      } else if (typeof this.redisClient.scan === 'function') {
        this.logger.log('✓ Detected: Redis client with manual SCAN');
      } else {
        this.logger.warn('✗ No SCAN method found on Redis client');
      }
    } else {
      this.logger.warn(
        'Redis client not injected - pattern deletion will not work'
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
      const value = await this.redis.get<string>(key);
      if (!value) {
        this.logger.debug(`Cache MISS: ${key}`);
        return undefined;
      }

      this.logger.debug(`Cache HIT: ${key}`);
      try {
        return JSON.parse(value) as T;
      } catch {
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

    if (!this.redisClient) {
      this.logger.error(
        'Redis client not available - cannot perform pattern deletion'
      );
      return;
    }

    try {
      this.logger.debug(`Deleting keys from Redis starting with: ${prefix}`);

      // Get the namespace from Keyv
      const namespace = (this.redis as any).opts?.namespace;
      const fullPrefix = namespace ? `${namespace}:${prefix}` : prefix;

      this.logger.debug(`Full search pattern: ${fullPrefix}*`);

      // @keyv/redis uses ioredis, which supports scanStream
      if (typeof this.redisClient.scanStream === 'function') {
        this.logger.debug('Using scanStream method (ioredis)');
        await this.deleteWithScanStream(fullPrefix);
      } else if (typeof this.redisClient.scan === 'function') {
        this.logger.debug('Using manual SCAN method');
        await this.deleteWithManualScan(fullPrefix);
      } else {
        this.logger.error('No supported SCAN method found on Redis client');
      }
    } catch (error) {
      this.handleError(`deleteKeyStartingWith(${prefix})`, error as Error);
    }
  }

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
        try {
          if (keysToDelete.length > 0) {
            this.logger.log(
              `Deleting ${keysToDelete.length} keys matching pattern: ${pattern}*`
            );

            // Delete in batches of 100
            for (let i = 0; i < keysToDelete.length; i += 100) {
              const batch = keysToDelete.slice(i, i + 100);
              await this.redisClient.del(...batch);
            }

            this.logger.log(`Successfully deleted ${keysToDelete.length} keys`);
          } else {
            this.logger.debug(`No keys found matching pattern: ${pattern}*`);
          }
          resolve();
        } catch (error) {
          reject(error);
        }
      });

      stream.on('error', reject);
    });
  }

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

      // Handle different response formats
      let newCursor: string;
      let keys: string[];

      if (Array.isArray(reply)) {
        // ioredis format: [cursor, keys]
        newCursor = reply[0];
        keys = reply[1] || [];
      } else if (typeof reply === 'object' && reply !== null) {
        // node-redis v4+ format: {cursor, keys}
        newCursor = reply.cursor;
        keys = reply.keys || [];
      } else {
        this.logger.error(
          `Unexpected SCAN reply format: ${JSON.stringify(reply)}`
        );
        break;
      }

      cursor = newCursor;

      if (Array.isArray(keys) && keys.length > 0) {
        keysToDelete.push(...keys);
      }
    } while (cursor !== '0');

    if (keysToDelete.length > 0) {
      this.logger.log(
        `Deleting ${keysToDelete.length} keys matching pattern: ${pattern}*`
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

      this.logger.log(`Successfully deleted ${keysToDelete.length} keys`);
    } else {
      this.logger.debug(`No keys found matching pattern: ${pattern}*`);
    }
  }

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

  // Utility method to check if pattern deletion is available
  async canDeleteByPattern(): Promise<boolean> {
    return this.redisClient !== null && this.redisClient !== undefined;
  }
}
