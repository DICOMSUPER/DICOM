import { DynamicModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

interface DatabaseModuleOptions {
  prefix: string;
  defaultDbName?: string;
}

@Module({})
export class DatabaseModule {
  static forService(options: DatabaseModuleOptions): DynamicModule {
    const { prefix, defaultDbName } = options;
    const prefixUpper = prefix.toUpperCase();

    return {
      module: DatabaseModule,
      imports: [
        TypeOrmModule.forRootAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: (configService: ConfigService) => ({
            type: 'postgres',
            host: configService.get(`${prefixUpper}_DB_HOST`, 'localhost'),
            port: configService.get<number>(`${prefixUpper}_DB_PORT`, 5432),
            username: configService.get(
              `${prefixUpper}_DB_USERNAME`,
              'postgres'
            ),
            password: configService.get(
              `${prefixUpper}_DB_PASSWORD`,
              'postgres'
            ),
            database: configService.get(
              `${prefixUpper}_DB_NAME`,
              defaultDbName || `${prefix.toLowerCase()}_service`
            ),
            // entities: [__dirname + '/../**/*.entity{.ts,.js}'],
            synchronize: configService.get<boolean>(    
              `${prefixUpper}_DB_SYNC`,
              true
            ),
            logging: configService.get<boolean>(
              `${prefixUpper}_DB_LOGGING`,
              false
            ),
            autoLoadEntities: true,
          }),
        }),
      ],
    };
  }
}
