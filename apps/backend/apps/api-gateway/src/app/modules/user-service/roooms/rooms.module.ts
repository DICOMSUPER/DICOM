import { Module } from '@nestjs/common';
import { SharedInterceptorModule } from '@backend/shared-interceptor';
import { UserServiceClientModule } from '@backend/shared-client';
import { RoomsController } from './rooms.controller';

@Module({
  imports: [
    UserServiceClientModule,
    SharedInterceptorModule
  
  ],
  controllers: [RoomsController],
  exports: [UserServiceClientModule],
})
export class RoomsModule {}
