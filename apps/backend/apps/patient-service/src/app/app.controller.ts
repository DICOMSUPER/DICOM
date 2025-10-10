import { Controller, Get, HttpStatus, Logger } from '@nestjs/common';
import { AppService } from './app.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ThrowMicroserviceException } from '@backend/shared-utils';
import { PATIENT_SERVICE } from '../constant/microservice.constant';

@Controller()
export class AppController {
  private logger = new Logger(PATIENT_SERVICE);
  constructor(private readonly appService: AppService) {}

  @Get()
  getData() {
    return this.appService.getData();
  }

  @MessagePattern(`${PATIENT_SERVICE}.HealthCheck`)
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    this.logger.log(`Using pattern: ${PATIENT_SERVICE}.HealthCheck`);
    try {
      return await this.appService.healthCheck();
    } catch (error) {
      throw ThrowMicroserviceException(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Health check failed',
        PATIENT_SERVICE
      );
    }
  }
}