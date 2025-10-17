import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { SharedInterceptorModule } from '@backend/shared-interceptor';
import { UserServiceClientModule } from '@backend/shared-client';


@Module({
  imports: [
    UserServiceClientModule,
    SharedInterceptorModule,

  ],
  controllers: [UserController],
  exports: [UserServiceClientModule],
})
export class UserModule {}
