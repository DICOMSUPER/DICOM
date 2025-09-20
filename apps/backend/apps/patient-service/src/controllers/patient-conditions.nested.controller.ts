import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { PatientConditionService } from '../services/patient-condition.service';
import { CreateConditionDto } from '../dtos/condition.dto';
import { PatientCondition } from '../entities/patient-condition.entity';

@Controller('patients/:patientId/conditions')
export class PatientConditionsNestedController {
  constructor(private readonly conditionService: PatientConditionService) {}

  @Post()
  async create(
    @Param('patientId') patientId: string,
    @Body() dto: Omit<CreateConditionDto, 'patientId'>,
  ): Promise<PatientCondition> {
    const payload: CreateConditionDto = { ...dto, patientId } as CreateConditionDto;
    return this.conditionService.create(payload);
  }

  @Get()
  findAll(@Param('patientId') patientId: string): Promise<PatientCondition[]> {
    return this.conditionService.findAll(patientId);
  }
}


