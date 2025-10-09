import { Controller, Get } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { AppService } from './app.service';
import { HealthCheckResponseDto } from '@backend/shared-domain';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getData() {
    return this.appService.getData();
  }

  @MessagePattern('PatientService.HealthCheck')
  checkHealth(): HealthCheckResponseDto {
    return new HealthCheckResponseDto('PatientService');
  }
}
