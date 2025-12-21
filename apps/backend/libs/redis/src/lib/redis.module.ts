import { Global, Module, Logger } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisService } from './redis.service';
import Keyv from 'keyv';
import KeyvRedis from '@keyv/redis';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'REDIS_INSTANCE',
      useFactory: async (configService: ConfigService) => {
        const logger = new Logger('BackendRedisModule');
        try {
          const host = configService.get('REDIS_HOST');
          const port = configService.get('REDIS_PORT');
          const masked = `rediss://:****@${host}:${port}`;
          const redisUrl = `rediss://:${configService.get(
            'REDIS_PASSWORD'
          )}@${host}:${port}`;

          logger.log(`Connecting to Redis via KeyvRedis: ${masked}`);

          const redisStore = new KeyvRedis({
            url: redisUrl,
            pingInterval: 10000,
          });

          redisStore.on('error', (err: any) => {
            logger.warn(`Redis store error (non-fatal): ${err.message}`);
          });

          const keyv = new Keyv({
            store: redisStore,
            namespace: '',
          });

          keyv.on('error', (err) => {
            logger.warn(`Keyv Redis connection error: ${err.message}`);
          });

          logger.log('Redis Keyv connected successfully');

          return keyv;
        } catch (error) {
          logger.error('Failed to create Keyv instance', error as Error);
          return new Keyv();
        }
      },
      inject: [ConfigService],
    },
    // Add a separate provider for the raw Redis client
    {
      provide: 'REDIS_CLIENT',
      useFactory: (keyv: Keyv) => {
        const logger = new Logger('BackendRedisModule');
        try {
          // Extract the underlying ioredis client from Keyv
          const store = (keyv as any).opts?.store;
          const client = store?.client;

          if (client) {
            logger.log('Successfully extracted Redis client for injection');
            return client;
          } else {
            logger.warn('Could not extract Redis client from Keyv');
            return null;
          }
        } catch (error) {
          logger.error(
            'Error extracting Redis client:',
            (error as Error).message
          );
          return null;
        }
      },
      inject: ['REDIS_INSTANCE'],
    },
    RedisService,
  ],
  exports: [RedisService, 'REDIS_INSTANCE', 'REDIS_CLIENT'],
})
export class BackendRedisModule {}
