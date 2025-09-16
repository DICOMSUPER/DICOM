import { Controller, Get, Logger } from '@nestjs/common';
import { AppService } from './app.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { handleErrorFromMicroservices } from '@backend/shared-utils';

@Controller()
export class AppController {
  private readonly logger = new Logger('AuthService');
  constructor(private readonly appService: AppService) {}

  @MessagePattern('auth.check-health') 
  async checkHealth() {
    return { message: 'AuthService is running' };
  }

  @MessagePattern('auth.get-all-users')
  async getAllUsers() {
    return this.appService.getAllUsers();
  }
}