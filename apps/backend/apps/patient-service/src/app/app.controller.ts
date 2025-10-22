import { Controller, Get, HttpStatus, Logger } from '@nestjs/common';
import { AppService } from './app.service';
import { MessagePattern } from '@nestjs/microservices';
import { ThrowMicroserviceException } from '@backend/shared-utils';
import { ConfigService } from '@nestjs/config';
import { PATIENT_SERVICE } from '../constant/microservice.constant';

@Controller()
export class AppController {
  private logger = new Logger(PATIENT_SERVICE);
  constructor(
    private readonly appService: AppService,
    private readonly configService: ConfigService
  ) {}

  @Get()
  getData() {
    return this.appService.getData();
  }

  checkDatabaseConfig() {
    const dbName = this.configService.get<string>('DATABASE_NAME');
    if (!dbName) {
      throw ThrowMicroserviceException(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Database configuration error',
        PATIENT_SERVICE
      );
    }
  }

  @MessagePattern(`${PATIENT_SERVICE}.HealthCheck`)
  async healthCheck(): Promise<{ status: string; message: string; timestamp: string }> {
    this.logger.log(`Using pattern: ${PATIENT_SERVICE}.HealthCheck`);
    return {
      status: 'ok',
      message: 'PatientService is running',
      timestamp: new Date().toISOString(),
    };
  }
}