import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { PatientConditionService } from './patient-conditions.service';
import { CreatePatientConditionDto } from './dto/create-patient-condition.dto';
import { UpdatePatientConditionDto } from './dto/update-patient-condition.dto';
import { PatientConditionResponseDto } from './dto/patient-condition-response.dto';
import { RepositoryPaginationDto } from '@backend/database';
import { PaginatedResponseDto } from '@backend/shared-domain';

@Controller()
export class PatientConditionController {
  constructor(private readonly patientConditionService: PatientConditionService) {}

  @MessagePattern('PatientService.PatientCondition.Create')
  async create(createPatientConditionDto: CreatePatientConditionDto): Promise<PatientConditionResponseDto> {
    return await this.patientConditionService.create(createPatientConditionDto);
  }

  @MessagePattern('PatientService.PatientCondition.FindMany')
  async findMany(data: { paginationDto: RepositoryPaginationDto }): Promise<PaginatedResponseDto<PatientConditionResponseDto>> {
    return await this.patientConditionService.findMany(data.paginationDto);
  }



  @MessagePattern('PatientService.PatientCondition.FindOne')
  async findOne(data: { id: string }): Promise<PatientConditionResponseDto> {
    return await this.patientConditionService.findOne(data.id);
  }

  @MessagePattern('PatientService.PatientCondition.Update')
  async update(data: { id: string; updatePatientConditionDto: UpdatePatientConditionDto }): Promise<PatientConditionResponseDto> {
    return await this.patientConditionService.update(data.id, data.updatePatientConditionDto);
  }

  @MessagePattern('PatientService.PatientCondition.Delete')
  async remove(data: { id: string }): Promise<void> {
    return await this.patientConditionService.remove(data.id);
  }
}
