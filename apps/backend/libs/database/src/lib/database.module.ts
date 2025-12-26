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

            const host = configService.get(
              `${prefixUpper}_DB_HOST`,
              'localhost'
            );
            const port = configService.get<number>(
              `${prefixUpper}_DB_PORT`,
              5432
            );
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
              20000
            );

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
              timezone: 'UTC+7',

              synchronize: configService.get<boolean>(
                `${prefixUpper}_DB_SYNC`,
                true
              ),
              logging: configService.get<boolean>(
                `${prefixUpper}_DB_LOGGING`,
                false
              ),
              autoLoadEntities: true,
              ssl: configService.get<boolean>(`${prefixUpper}_DB_SSL`, true)
                ? { rejectUnauthorized: false }
                : false,

              extra: {
                max: configService.get<number>(
                  `${prefixUpper}_DB_MAX_CONNECTIONS`,
                  20
                ),
                min: configService.get<number>(
                  `${prefixUpper}_DB_MIN_CONNECTIONS`,
                  3
                ),
                idleTimeoutMillis: configService.get<number>(
                  `${prefixUpper}_DB_IDLE_TIMEOUT`,
                  30000
                ),
                connectionTimeoutMillis: connectionTimeout,
              },
            };

            const maskedUsername = username
              ? `${username.substring(0, 2)}***`
              : 'unknown';
            const connectionInfo = `[${prefixUpper}] host=${host} port=${port} database=${database} username=${maskedUsername}`;

            class ConnectionAwareLogger implements TypeOrmLogger {
              logQuery(query: string, parameters?: any[]) {
                // Log UPDATE queries to help debug createdAt issues
                if (query.toUpperCase().includes('UPDATE')) {
                  logger.debug(`${connectionInfo} - UPDATE Query: ${query}`);
                  if (parameters && parameters.length > 0) {
                    logger.debug(`${connectionInfo} - Parameters: ${JSON.stringify(parameters)}`);
                  }
                }
              }

              logQueryError(error: string, query: string, parameters?: any[]) {
                logger.error(`${connectionInfo} - Query Error: ${error}`);
              }

              logQuerySlow(time: number, query: string, parameters?: any[]) {
                logger.warn(
                  `${connectionInfo} - Slow Query (${time}ms): ${query}`
                );
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

            const finalConfig = {
              ...config,

              logger: configService.get<boolean>(
                `${prefixUpper}_DB_LOGGING`,
                false
              )
                ? new ConnectionAwareLogger()
                : undefined,
            };

            return finalConfig;
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

            const maxRetries = configService.get<number>(
              `${prefixUpper}_DB_RETRY_ATTEMPTS`,
              5
            );
            const retryDelay = configService.get<number>(
              `${prefixUpper}_DB_RETRY_DELAY`,
              2000
            );

            let retryCount = 0;
            let lastError: Error | null = null;

            while (retryCount <= maxRetries) {
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
                  rejectUnauthorized: false,
                };

                const start = Date.now();

                if (!dataSource.isInitialized) {
                  const maxWaitTime = 30000;
                  const checkInterval = 100;
                  const startWait = Date.now();

                  while (!dataSource.isInitialized) {
                    if (Date.now() - startWait > maxWaitTime) {
                      try {
                        await dataSource.initialize();
                      } catch (initError) {
                        throw new Error(
                          `Database initialization failed: ${
                            (initError as Error).message
                          }`
                        );
                      }
                      break;
                    }
                    await new Promise((resolve) =>
                      setTimeout(resolve, checkInterval)
                    );
                  }
                }

                const ms = Date.now() - start;

                const maskedUser = username
                  ? `${username.substring(0, 2)}***`
                  : 'unknown';
                const message = [
                  'Connected:',
                  `  host=${host} port=${port} db=${database}`,
                  `  user=${maskedUser}`,
                  `  ssl=require(rejectUnauthorized=${sslRejectUnauthorized.rejectUnauthorized})`,
                  `  logging=${loggingEnabled} sync=${syncEnabled}`,
                  `  time=${ms}ms`,
                  retryCount > 0 ? `  attempts=${retryCount + 1}` : '',
                ]
                  .filter(Boolean)
                  .join('\n');
                logger.log(message);
                break;
              } catch (err) {
                lastError = err as Error;
                retryCount++;

                const isConnectionError =
                  lastError?.message?.includes('connection timeout') ||
                  lastError?.message?.includes('Connection terminated') ||
                  lastError?.message?.includes('ECONNREFUSED') ||
                  lastError?.message?.includes('ETIMEDOUT') ||
                  (lastError as any)?.code === 'ECONNREFUSED' ||
                  (lastError as any)?.code === 'ETIMEDOUT';

                if (isConnectionError && retryCount <= maxRetries) {
                  const delay = Math.min(retryDelay * retryCount, 10000);
                  logger.warn(
                    `⚠️ Database connection error (attempt ${retryCount}/${
                      maxRetries + 1
                    }). Retrying in ${delay}ms...`,
                    lastError?.message || lastError
                  );
                  await new Promise((resolve) => setTimeout(resolve, delay));
                  continue;
                }

                const maskedUsername = username
                  ? `${username.substring(0, 2)}***`
                  : 'unknown';
                const connectionDetails = [
                  `host=${host}`,
                  `port=${port}`,
                  `database=${database}`,
                  `username=${maskedUsername}`,
                ].join(' ');

                logger.error(
                  `Database connection failed for: ${connectionDetails} (attempt ${retryCount}/${
                    maxRetries + 1
                  })`,
                  lastError?.stack || lastError?.message || lastError
                );

                if (retryCount > maxRetries) {
                  const enhancedError = new Error(
                    `Failed to connect to database after ${
                      maxRetries + 1
                    } attempts (${connectionDetails}): ${lastError?.message}`
                  );
                  enhancedError.stack = lastError?.stack;
                  throw enhancedError;
                }

                throw lastError;
              }
            }

            return true;
          },
        },
      ],
    };
  }
}
