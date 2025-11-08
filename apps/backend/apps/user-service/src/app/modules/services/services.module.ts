import { Module } from '@nestjs/common';

import { BackendEntitiesModule } from '@backend/entities';
import { Services } from '@backend/shared-domain';
import { ServicesController } from './services.controller';
import { ServicesRepository } from './services.repository';
import { ServicesService } from './services.service';

@Module({
  imports: [BackendEntitiesModule.forFeature([Services])],
  controllers: [ServicesController],
  providers: [ServicesService, ServicesRepository],
  exports: [BackendEntitiesModule, ServicesRepository],
})
export class ServicesModule {}
