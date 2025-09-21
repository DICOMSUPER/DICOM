import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { PatientConditionService } from '../services/patient-condition.service';
import { CreateConditionDto, UpdateConditionDto } from '../dtos/condition.dto';
import { PatientCondition } from '../entities/patient-condition.entity';

@Controller('patient-conditions')
export class PatientConditionController {
  constructor(private readonly conditionService: PatientConditionService) {}

  @Post()
  create(@Body() dto: CreateConditionDto): Promise<PatientCondition> {
    return this.conditionService.create(dto);
  }

  @Get()
  findAll(@Query('patientId') patientId?: string): Promise<PatientCondition[]> {
    return this.conditionService.findAll(patientId);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<PatientCondition> {
    return this.conditionService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateConditionDto,
  ): Promise<PatientCondition> {
    return this.conditionService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.conditionService.remove(id);
  }
}


