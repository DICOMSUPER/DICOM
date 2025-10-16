import { Controller, Get, Inject, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { Roles } from '@backend/shared-enums';
import { Public } from '@backend/shared-decorators';
import { Role } from '@backend/shared-decorators';
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

  @Get('test-role1')
  @Role(Roles.RECEPTION_STAFF)
  async getByReceiption() {
    return true;
  }
}
