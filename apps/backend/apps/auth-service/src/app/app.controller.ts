import { Controller, Get, Logger } from '@nestjs/common';
import { AppService } from './app.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { handleErrorFromMicroservices } from '@backend/shared-utils';
@Controller()
export class AppController {
  private readonly logger = new Logger('AuthService');
  constructor(private readonly appService: AppService) {}

  @Get()
  getData() {
    return this.appService.getData();
  }

  @MessagePattern('auth.verify-token')
  async verifyAccessToken(@Payload() data: { token: string }): Promise<any> {
    this.logger.log('Using pattern: auth.verify-token ');
    try {
      //verify token & return userId & role and other data
      return { userId: -1, role: 'Test-data' };
    } catch (error) {
      handleErrorFromMicroservices(
        error,
        'Failed to verify token',
        'AuthService'
      );
    }
  }

  @MessagePattern('auth.check-health')
  async checkHealth() {
    return { message: 'AuthService is running' };
  }

  @MessagePattern('auth.login')
  async login(
    @Payload() data: { email: string; password: string }
  ): Promise<{ accessToken: string; refreshToken: string }> {
    //adjust in guards for signed data
    return { accessToken: '', refreshToken: '' };
  }
}
