import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShiftTemplatesService } from './shift-templates.service';
import { ShiftTemplatesController } from './shift-templates.controller';
import { ShiftTemplate } from './entities/shift-template.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ShiftTemplate])],
  controllers: [ShiftTemplatesController],
  providers: [ShiftTemplatesService],
})
export class ShiftTemplatesModule {}
