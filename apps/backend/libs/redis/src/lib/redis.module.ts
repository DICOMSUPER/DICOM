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
      useFactory: (configService: ConfigService) => {
        try {
          const redisUrl = `rediss://:${configService.get('REDIS_PASSWORD')}@${configService.get('REDIS_HOST')}:${configService.get('REDIS_PORT')}`;
          console.log('Creating Keyv with Redis URL:', redisUrl);
          const keyv = new Keyv({
            store: new KeyvRedis(redisUrl),
            namespace: '',
            // useKeyPrefix: true

          });
          return keyv;
        } catch (error) {
          console.error('Failed to create Keyv instance:', error);
          throw error;
        }
      },
      inject: [ConfigService],
    },
    RedisService,
  ],
  exports: [RedisService],
})
export class BackendRedisModule {}