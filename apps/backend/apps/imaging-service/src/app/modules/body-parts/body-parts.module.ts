import { Module } from '@nestjs/common';
import { BodyPartsController } from './body-parts.controller';
import { BodyPartsService } from './body-parts.service';
import { BodyPartsRepository } from './body-parts.repository';

@Module({
  controllers: [BodyPartsController],
  providers: [BodyPartsService, BodyPartsRepository],
})
export class BodyPartsModule {}
