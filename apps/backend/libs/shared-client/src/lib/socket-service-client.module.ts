import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { getClient } from '@backend/shared-utils';

@Module({
  imports: [
    ClientsModule.register([
      getClient(
        process.env.WEBSOCKET_SERVICE_NAME || 'WEBSOCKET_SERVICE',
        Number(process.env.WEBSOCKET_SERVICE_TRANSPORT) || Transport.TCP,
        process.env.WEBSOCKET_SERVICE_HOST || 'localhost',
        Number(process.env.WEBSOCKET_SERVICE_PORT) || 5006
      ),
    ]),
  ],
  exports: [ClientsModule],
})
export class SocketServiceClientModule {}
