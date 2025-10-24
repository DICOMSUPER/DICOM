import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { getClient } from '@backend/shared-utils';

@Module({
  imports: [
    ClientsModule.register([
      getClient(
        process.env.SYSTEM_SERVICE_NAME || 'SYSTEM_SERVICE',
        Number(process.env.SYSTEM_SERVICE_TRANSPORT) || Transport.TCP,
        process.env.SYSTEM_SERVICE_HOST || 'localhost',
        Number(process.env.SYSTEM_SERVICE_PORT) || 5005
      ),
    ]),
  ],
  exports: [ClientsModule],
})
export class SystemServiceClientModule {}
