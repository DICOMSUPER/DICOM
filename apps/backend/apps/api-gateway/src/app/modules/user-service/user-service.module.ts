import { Module } from '@nestjs/common';
import { UserServiceClientModule } from '@backend/shared-client';
import { SharedInterceptorModule } from '@backend/shared-interceptor';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    UserServiceClientModule,
    SharedInterceptorModule,
    UserModule,
  ],
  exports: [UserServiceClientModule, UserModule],
})
export class UserServiceModule {}