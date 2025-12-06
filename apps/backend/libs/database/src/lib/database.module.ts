import { DynamicModule, Module, Logger } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PaginationModule } from './pagination/pagination.module';
import { DataSource, Logger as TypeOrmLogger } from 'typeorm';

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
          useFactory: (configService: ConfigService) => {
            const logger = new Logger(`TypeOrmModule [${prefixUpper}]`);
            
            const host = configService.get(`${prefixUpper}_DB_HOST`, 'localhost');
            const port = configService.get<number>(`${prefixUpper}_DB_PORT`, 5432);
            const username = configService.get(
              `${prefixUpper}_DB_USERNAME`,
              'postgres'
            );
            const password = configService.get(
              `${prefixUpper}_DB_PASSWORD`,
              'postgres'
            );
            const database = configService.get(
              `${prefixUpper}_DB_NAME`,
              defaultDbName || `${prefix.toLowerCase()}_service`
            );
            const connectionTimeout = configService.get<number>(
              `${prefixUpper}_DB_CONNECTION_TIMEOUT`,
              2000
            );

            // Log connection attempt with details
            logger.log(
              `Attempting to connect to database: host=${host} port=${port} database=${database} username=${username} timeout=${connectionTimeout}ms`
            );

            const config = {
              type: 'postgres' as const,
              host,
              port,
              username,
              password,
              database,
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
            
              // Connection pool configuration to prevent exhaustion
              extra: {
                max: configService.get<number>(
                  `${prefixUpper}_DB_MAX_CONNECTIONS`,
                  10
                ), // Maximum number of connections in the pool
                min: configService.get<number>(
                  `${prefixUpper}_DB_MIN_CONNECTIONS`,
                  5
                ), // Minimum number of connections in the pool
                idleTimeoutMillis: configService.get<number>(
                  `${prefixUpper}_DB_IDLE_TIMEOUT`,
                  30000
                ), // Close idle connections after 30 seconds
                connectionTimeoutMillis: connectionTimeout, // Wait for connection from the pool
              },
            };

            // Create a custom logger that includes connection details in error messages
            const connectionInfo = `[${prefixUpper}] host=${host} port=${port} database=${database} username=${username}`;
            
            class ConnectionAwareLogger implements TypeOrmLogger {
              logQuery(query: string, parameters?: any[]) {
                // Optional: log queries if needed
              }
              
              logQueryError(error: string, query: string, parameters?: any[]) {
                logger.error(`${connectionInfo} - Query Error: ${error}`);
              }
              
              logQuerySlow(time: number, query: string, parameters?: any[]) {
                logger.warn(`${connectionInfo} - Slow Query (${time}ms): ${query}`);
              }
              
              logSchemaBuild(message: string) {
                logger.log(`${connectionInfo} - ${message}`);
              }
              
              logMigration(message: string) {
                logger.log(`${connectionInfo} - ${message}`);
              }
              
              log(level: 'log' | 'info' | 'warn', message: any) {
                if (level === 'warn') {
                  logger.warn(`${connectionInfo} - ${message}`);
                } else {
                  logger.log(`${connectionInfo} - ${message}`);
                }
              }
            }

            return {
              ...config,
              // Use custom logger if logging is enabled
              logger: configService.get<boolean>(`${prefixUpper}_DB_LOGGING`, false) 
                ? new ConnectionAwareLogger()
                : undefined,
            };
          },
        }),
      ],
      providers: [
        {
          provide: `${prefixUpper}_DB_CONNECT_LOGGER`,
          inject: [DataSource, ConfigService],
          useFactory: async (
            dataSource: DataSource,
            configService: ConfigService
          ) => {
            const logger = new Logger(`${prefixUpper} Database`);
            const shouldLog = configService.get<boolean>(
              `${prefixUpper}_DB_LOG_ON_CONNECT`,
              true
            );
            if (!shouldLog) {
              return true;
            }
            
            // Get connection details before try block so they're available in catch
            const host = configService.get<string>(
              `${prefixUpper}_DB_HOST`,
              'localhost'
            );
            const port = configService.get<number>(
              `${prefixUpper}_DB_PORT`,
              5432
            );
            const database = configService.get<string>(
              `${prefixUpper}_DB_NAME`,
              defaultDbName || `${prefix.toLowerCase()}_service`
            );
            const username = configService.get<string>(
              `${prefixUpper}_DB_USERNAME`,
              'postgres'
            );
            
            try {
              const loggingEnabled = configService.get<boolean>(
                `${prefixUpper}_DB_LOGGING`,
                false
              );
              const syncEnabled = configService.get<boolean>(
                `${prefixUpper}_DB_SYNC`,
                true
              );
              const sslRejectUnauthorized = {
                rejectUnauthorized: false
              }; // matches ssl: { rejectUnauthorized: false }

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
              const error = err as Error;
              const connectionDetails = [
                `host=${host}`,
                `port=${port}`,
                `database=${database}`,
                `username=${username}`,
              ].join(' ');
              
              logger.error(
                `Database connection failed for: ${connectionDetails}`,
                error.stack || error.message || error
              );
              
              // Re-throw with enhanced message
              const enhancedError = new Error(
                `Failed to connect to database (${connectionDetails}): ${error.message}`
              );
              enhancedError.stack = error.stack;
              throw enhancedError;
            }
            return true;
          },
        },
      ],
    };
  }
}
