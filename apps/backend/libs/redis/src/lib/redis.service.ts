import { Inject, Injectable, Logger } from '@nestjs/common';
import Keyv from 'keyv';

@Injectable()
export class RedisService {
  private readonly logger = new Logger(RedisService.name);

  constructor(@Inject('REDIS_INSTANCE') private readonly redis: Keyv) {}

  async get<T>(key: string): Promise<T | undefined> {
    this.logger.debug(`Getting from Redis: ${key}`);
    const value = await this.redis.get<string>(key);
    if (!value) return undefined;

    try {
      return JSON.parse(value) as T;
    } catch (error) {
      this.logger.warn(
        `Failed to parse cache value for key ${key}: ${
          (error as Error).message
        }`
      );
      return value as T;
    }
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    this.logger.debug(`Storing in Redis: ${key} (ttl=${ttl ?? 'default'})`);
    await this.redis.set(key, JSON.stringify(value), ttl);
  }

  async delete(key: string): Promise<void> {
    this.logger.debug(`Deleting from Redis: ${key}`);
    await this.redis.delete(key);
  }

  async deleteKeyStartingWith(prefix: string): Promise<void> {
    this.logger.debug(`Deleting keys from Redis starting with: ${prefix}`);

    // iterator may be undefined or require an argument according to the Keyv types,
    // so guard and call it explicitly with an argument via a safe any-cast.
    const iteratorFn = (this.redis as any).iterator;
    if (typeof iteratorFn !== 'function') {
      this.logger.warn(
        'Redis instance does not expose an iterator function; skipping deleteKeyStartingWith.'
      );
      return;
    }

    const iterator = iteratorFn.call(this.redis, undefined);
    for await (const key of iterator) {
      if (typeof key === 'string' && key.startsWith(prefix)) {
        this.logger.debug(`Deleting key: ${key}`);
        await this.redis.delete(key);
      }
    }
  }
}
