import { Controller, Get, Inject } from '@nestjs/common';
import { AppService } from './app.service';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    // @Inject(process.env.AUTH_SERVICE_NAME || 'AuthService')
    // private readonly authService: ClientProxy,
    @Inject(process.env.USER_SERVICE_NAME || 'UserService')
    private readonly userService: ClientProxy
  ) {}

  @Get()
  getData() {
    return this.appService.getData();
  }

  //test auth service
  // @Get('auth-check')
  // async authCheck() {
  //   return await firstValueFrom(this.authService.send('auth.check-health', {}));
  // }

  //test user service
  @Get('user-check')
  async userCheck() {
    return await firstValueFrom(this.userService.send('user.check-health', {}));
  }
}
