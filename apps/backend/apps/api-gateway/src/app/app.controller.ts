import { Controller, Get, Inject } from '@nestjs/common';
import { AppService } from './app.service';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    @Inject(process.env.USER_SERVICE_NAME || 'USER_SERVICE')
    private readonly userService: ClientProxy
  ) {}

  @Get()
  getData() {
    return this.appService.getData();
  }

 

  //test user service
  @Get('user-check')
  async userCheck() {
    return await firstValueFrom(this.userService.send('user.check-health', {}));
  }
}
