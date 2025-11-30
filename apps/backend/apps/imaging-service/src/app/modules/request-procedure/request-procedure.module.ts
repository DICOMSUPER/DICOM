import { Module } from '@nestjs/common';

import { BackendEntitiesModule } from '@backend/database';
import { ImagingOrder, RequestProcedure } from '@backend/shared-domain';
import { RequestProcedureController } from './request-procedure.controller';
import { RequestProcedureRepository } from './request-procedure.repository';
import { RequestProcedureService } from './request-procedure.service';

@Module({
  imports: [BackendEntitiesModule.forFeature([RequestProcedure, ImagingOrder])],
  controllers: [RequestProcedureController],
  providers: [RequestProcedureService, RequestProcedureRepository],
  exports: [BackendEntitiesModule, RequestProcedureRepository],
})
export class RequestProcedureModule {}
