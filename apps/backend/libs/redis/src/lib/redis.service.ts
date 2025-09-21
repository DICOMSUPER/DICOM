import { Inject, Injectable } from '@nestjs/common';
import Keyv from 'keyv';

@Injectable()
export class RedisService {
  constructor(@Inject('REDIS_INSTANCE') private readonly redis: Keyv) {}

  async get<T>(key: string): Promise<T | undefined> {
    console.log(`Getting from Redis: ${key}`);
    const value = await this.redis.get<string>(key);
    if (!value) return undefined;

    try {
      return JSON.parse(value) as T; 
    } catch (error) {
      console.error('Failed to parse cache value:', error);
      return value as T; 
    }
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    console.log(`Storing in Redis: ${key} =>`, JSON.stringify(value));
    await this.redis.set(key, JSON.stringify(value), ttl);
  }

  async delete(key: string): Promise<void> {
    console.log(`Deleting from Redis: ${key}`);
    await this.redis.delete(key);
  }
}