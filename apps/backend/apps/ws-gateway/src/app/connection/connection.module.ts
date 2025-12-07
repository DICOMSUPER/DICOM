import { Module } from '@nestjs/common';
import { ConnectionGateway } from './connection.gateway';
import { JwtModule } from '@nestjs/jwt';
import { UserServiceClientModule } from '@backend/shared-client';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
    }),
    UserServiceClientModule,
  ],
  providers: [ConnectionGateway],
  exports: [ConnectionGateway],
})
export class ConnectionModule {}
