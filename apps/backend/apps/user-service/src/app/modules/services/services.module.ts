import { Module } from '@nestjs/common';

import { BackendEntitiesModule } from '@backend/entities';
import { ServiceRoom, Services } from '@backend/shared-domain';
import { ServicesController } from './services.controller';
import { ServicesRepository } from './services.repository';
import { ServicesService } from './services.service';
import { ServiceRoomsModule } from '../service-rooms/service-rooms.module';

@Module({
  imports: [BackendEntitiesModule.forFeature([Services, ServiceRoom]),
  ServiceRoomsModule
],
  controllers: [ServicesController],
  providers: [ServicesService, ServicesRepository],
  exports: [BackendEntitiesModule, ServicesRepository],
})
export class ServicesModule {}
