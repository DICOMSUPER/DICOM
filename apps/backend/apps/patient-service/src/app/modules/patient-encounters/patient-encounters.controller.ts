import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { PatientEncounterService } from './patient-encounters.service';
import { CreatePatientEncounterDto } from './dto/create-patient-encounter.dto';
import { UpdatePatientEncounterDto } from './dto/update-patient-encounter.dto';
import type { PatientEncounterResponseDto, PaginatedResponseDto } from '@backend/shared-domain';
import { RepositoryPaginationDto } from '@backend/database';

@Controller()
export class PatientEncounterController {

  constructor(private readonly patientEncounterService: PatientEncounterService) {}

  // Microservice Message Patterns
  @MessagePattern('PatientService.Encounter.Create')
  async create(createPatientEncounterDto: CreatePatientEncounterDto): Promise<PatientEncounterResponseDto> {
    return await this.patientEncounterService.create(createPatientEncounterDto);
  }

  @MessagePattern('PatientService.Encounter.FindMany')
  async findMany(data: { paginationDto: RepositoryPaginationDto }): Promise<PaginatedResponseDto<PatientEncounterResponseDto>> {
    return await this.patientEncounterService.findMany(data.paginationDto);
  }



  @MessagePattern('PatientService.Encounter.FindOne')
  async findOne(data: { id: string }): Promise<PatientEncounterResponseDto> {
    return await this.patientEncounterService.findOne(data.id);
  }

  @MessagePattern('PatientService.Encounter.Update')
  async update(data: { id: string; updatePatientEncounterDto: UpdatePatientEncounterDto }): Promise<PatientEncounterResponseDto> {
    return await this.patientEncounterService.update(data.id, data.updatePatientEncounterDto);
  }

  @MessagePattern('PatientService.Encounter.Delete')
  async remove(data: { id: string }): Promise<void> {
    return await this.patientEncounterService.remove(data.id);
  }

  @MessagePattern('PatientService.Encounter.GetStats')
  async getEncounterStats(): Promise<any> {
    return await this.patientEncounterService.getEncounterStats();
  }

}
