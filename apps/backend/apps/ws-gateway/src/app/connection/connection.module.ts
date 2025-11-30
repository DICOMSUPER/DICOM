import { Module } from '@nestjs/common';
import { ConnectionGateway } from './connection.gateway';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '24h' },
    }),
  ],
  providers: [ConnectionGateway],
  exports: [ConnectionGateway],
})
export class ConnectionModule {}
