import { Global, Module } from '@nestjs/common';
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
        try {
          const redisUrl = `rediss://:${configService.get('REDIS_PASSWORD')}@${configService.get('REDIS_HOST')}:${configService.get('REDIS_PORT')}`;
          console.log('🔌 Connecting to Redis via KeyvRedis:', redisUrl);

          // Tạo adapter
          const redisStore = new KeyvRedis(redisUrl);

          // Bắt lỗi của adapter (để không crash server)
          redisStore.on('error', (err: any) => {
            console.error('⚠️ Redis store error (non-fatal):', err.message);
          });

          // Tạo Keyv instance
          const keyv = new Keyv({
            store: redisStore,
            namespace: '',
          });

          // Bắt lỗi của Keyv
          keyv.on('error', (err) => {
            console.error('⚠️ Keyv Redis connection error:', err.message);
          });

          console.log('✅ Redis Keyv connected successfully');

          return keyv;
        } catch (error) {
          console.error('❌ Failed to create Keyv instance:', error);
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
