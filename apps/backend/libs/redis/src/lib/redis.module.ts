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
          const redisUrl = `rediss://:${configService.get('REDIS_PASSWORD')}@${host}:${port}`;
          logger.log(`Connecting to Redis via KeyvRedis: ${masked}`);

          // Tạo adapter
          const redisStore = new KeyvRedis(redisUrl);

          // Bắt lỗi của adapter (để không crash server)
          redisStore.on('error', (err: any) => {
            logger.warn(`Redis store error (non-fatal): ${err.message}`);
          });

          // Tạo Keyv instance
          const keyv = new Keyv({
            store: redisStore,
            namespace: '',
          });

          // Bắt lỗi của Keyv
          keyv.on('error', (err) => {
            logger.warn(`Keyv Redis connection error: ${err.message}`);
          });

          logger.log('Redis Keyv connected successfully');

          return keyv;
        } catch (error) {
          logger.error('Failed to create Keyv instance', error as Error);
          // Không throw lỗi để app vẫn chạy (Redis fail không nên crash server)
          return new Keyv(); // tạo cache in-memory tạm
        }
      },
      inject: [ConfigService],
    },
    RedisService,
  ],
  exports: [RedisService],
})
export class BackendRedisModule {}
