import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AuthGuard } from './auth.guard';
import { RoleGuard } from './role.guard';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'USER_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.AUTH_SERVICE_HOST || 'localhost',
          port: parseInt(process.env.AUTH_SERVICE_PORT || '5002', 10),
        },
      },
    ]),
  ],
  providers: [AuthGuard, RoleGuard],
  exports: [AuthGuard, RoleGuard, ClientsModule],
})
export class BackendSharedGuardsModule {}
