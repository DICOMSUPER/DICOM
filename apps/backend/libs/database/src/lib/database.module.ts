import { DynamicModule, Module, Logger } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PaginationModule } from './pagination/pagination.module';
import { DataSource } from 'typeorm';

interface DatabaseModuleOptions {
  prefix: string;
  defaultDbName?: string;
}

@Module({
  imports: [PaginationModule],
})
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
            ssl: { rejectUnauthorized: false },
             extra: {
    max: 20,
    min: 2,
    idleTimeoutMillis: 30000,
  },
          }),
        }),
      ],
      providers: [
        {
          provide: `${prefixUpper}_DB_CONNECT_LOGGER`,
          inject: [DataSource, ConfigService],
          useFactory: async (dataSource: DataSource, configService: ConfigService) => {
            const logger = new Logger(`${prefixUpper} Database`);
            const shouldLog = configService.get<boolean>(
              `${prefixUpper}_DB_LOG_ON_CONNECT`,
              true
            );
            if (!shouldLog) {
              return true;
            }
            try {
              const host = configService.get<string>(`${prefixUpper}_DB_HOST`, 'localhost');
              const port = configService.get<number>(`${prefixUpper}_DB_PORT`, 5432);
              const database = configService.get<string>(
                `${prefixUpper}_DB_NAME`,
                defaultDbName || `${prefix.toLowerCase()}_service`
              );
              const username = configService.get<string>(`${prefixUpper}_DB_USERNAME`, 'postgres');
              const loggingEnabled = configService.get<boolean>(`${prefixUpper}_DB_LOGGING`, false);
              const syncEnabled = configService.get<boolean>(`${prefixUpper}_DB_SYNC`, true);
              const sslRejectUnauthorized = false; // matches ssl: { rejectUnauthorized: false }

              const start = Date.now();
              if (!dataSource.isInitialized) {
                await dataSource.initialize();
              }
              const ms = Date.now() - start;
              const maskedUser = username ? `${username}` : 'unknown';
              const message = [
                'Connected:',
                `  host=${host} port=${port} db=${database}`,
                `  user=${maskedUser}`,
                `  ssl=require(rejectUnauthorized=${sslRejectUnauthorized})`,
                `  logging=${loggingEnabled} sync=${syncEnabled}`,
                `  time=${ms}ms`,
              ].join('\n');
              logger.log(message);
            } catch (err) {
              logger.error('Database connection failed', err as Error);
            }
            return true;
          },
        },
      ],
    };
  }
}
