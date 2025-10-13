import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShiftTemplateService } from './shift-templates.service';
import { ShiftTemplateController } from './shift-templates.controller';
import { ShiftTemplate } from '@backend/shared-domain';

@Module({
  imports: [
    TypeOrmModule.forFeature([ShiftTemplate])
  ],
  controllers: [ShiftTemplateController],
  providers: [ShiftTemplateService],
  exports: [ShiftTemplateService]
})
export class ShiftTemplatesModule {}
