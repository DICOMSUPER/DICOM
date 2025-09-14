import { Controller, Get, Post, Body, Inject, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger('AuthController');

  constructor(
    @Inject('AuthService') private readonly authClient: ClientProxy,
  ) {}

  @Get('users')
  async getAllUsers() {
    try {
      const result = await firstValueFrom(
        this.authClient.send('auth.get-all-users', {})
      );
      return result;
    } catch (error) {
      this.logger.error('Error getting all users:', error);
      throw error;
    }
  }
}