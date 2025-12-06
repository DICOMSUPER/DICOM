import { Controller, Get, Logger } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { AppService } from './app.service';

@Controller()
export class AppController {
  private readonly logger = new Logger('UserService');

  constructor(private readonly appService: AppService) {}

  @Get()
  getData() {
    return this.appService.getData();
  }

  @Get('health')
  healthCheck() {
    this.logger.log('Health check requested');
    return {
      status: 'ok',
      message: 'UserService is running',
      timestamp: new Date().toISOString(),
    };
  }

  @MessagePattern('UserService.HealthCheck')
  async checkHealth() {
    return {
      status: 'ok',
      message: 'UserService is running',
      timestamp: new Date().toISOString(),
    };
  }
}
