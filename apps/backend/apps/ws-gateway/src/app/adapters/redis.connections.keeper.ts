import { Redis } from 'ioredis';
import { Inject, Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
@Injectable()
export class RedisConnectionsKeeper implements OnModuleDestroy {
  private clients: Redis[] = [];

  constructor(@Inject(ConfigService) private readonly config: ConfigService) {}

  async onModuleDestroy(): Promise<void> {
    for (const client of this.clients) {
      await client.quit();
    }
  }

  createConnect(): Redis {
    const client = new Redis({
      host: this.config.get('REDIS_HOST'),
      port: this.config.get('REDIS_PORT'),
      db: this.config.get('REDIS_DB'),
      password: this.config.get('REDIS_PASSWORD'),
      tls:{
        rejectUnauthorized: false,
      }
    });
    client.on('error', (err) => {
      console.log(`redis client error ${`${err.message}`}`);
    });
    this.clients.push(client);

    return client;
  }
}
