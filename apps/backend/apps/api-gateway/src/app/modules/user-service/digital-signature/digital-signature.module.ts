import { Module } from '@nestjs/common';
import { SharedInterceptorModule } from '@backend/shared-interceptor';
import {
  UserServiceClientModule,
} from '@backend/shared-client';
import { DigitalSignatureController } from './digital-signature.controller';

@Module({
  imports: [
    UserServiceClientModule,
    SharedInterceptorModule,
  ],
  controllers: [DigitalSignatureController],
  exports: [UserServiceClientModule],
})
export class DigitalSignatureModule {}
