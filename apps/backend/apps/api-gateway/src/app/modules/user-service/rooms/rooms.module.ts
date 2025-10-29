import { Module } from '@nestjs/common';
import { SharedInterceptorModule } from '@backend/shared-interceptor';
import {
  PatientServiceClientModule,
  UserServiceClientModule,
} from '@backend/shared-client';
import { RoomsController } from './rooms.controller';

@Module({
  imports: [
    UserServiceClientModule,
    SharedInterceptorModule,
    PatientServiceClientModule,
  ],
  controllers: [RoomsController],
  exports: [UserServiceClientModule],
})
export class RoomsModule {}
