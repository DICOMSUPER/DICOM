import { Module } from '@nestjs/common';

import { BodyPartRepository } from './body-part.repository';
import { BodyPart } from '@backend/shared-domain';
import { BackendEntitiesModule } from '@backend/database';
import { BodyPartService } from './body-part.service';
import { BodyPartController } from './body-part.controller';

@Module({
  imports: [BackendEntitiesModule.forFeature([BodyPart])],
  controllers: [BodyPartController],
  providers: [BodyPartService, BodyPartRepository],
  exports: [BackendEntitiesModule, BodyPartRepository],
})
export class BodyPartModule {}
