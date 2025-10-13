import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShiftTemplatesService } from './shift-templates.service';
import { ShiftTemplatesController } from './shift-templates.controller';
import { ShiftTemplateRepository } from '@backend/shared-domain';
import { ShiftTemplate } from '@backend/shared-domain';

@Module({
  imports: [
    TypeOrmModule.forFeature([ShiftTemplate])
  ],
  controllers: [ShiftTemplatesController],
  providers: [ShiftTemplatesService, ShiftTemplateRepository],
  exports: [ShiftTemplatesService, ShiftTemplateRepository]
})
export class ShiftTemplatesModule {}
