import { Controller, Get, Post, Body, Inject, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger('AuthController');

  constructor(
    @Inject('AuthService') private readonly authClient: ClientProxy,
  ) {}

  
  
}