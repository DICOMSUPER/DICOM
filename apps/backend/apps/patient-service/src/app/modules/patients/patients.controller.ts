import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { PatientService } from './patients.service';
import { 
  CreatePatientDto, 
  UpdatePatientDto, 
  PatientSearchDto, 
  PatientResponseDto,
  PaginatedResponseDto,
  PatientStatsDto
} from '@backend/shared-domain';

@Controller()
export class PatientController {
  constructor(private readonly patientService: PatientService) {}

  @MessagePattern('patient.create')
  async create(createPatientDto: CreatePatientDto): Promise<PatientResponseDto> {
    return await this.patientService.create(createPatientDto);
  }

  @MessagePattern('patient.findAll')
  async findAll(searchDto: PatientSearchDto): Promise<PatientResponseDto[]> {
    return await this.patientService.findAll(searchDto);
  }

  @MessagePattern('patient.findPatientsWithPagination')
  async findPatientsWithPagination(data: { page: number; limit: number; searchDto: Omit<PatientSearchDto, 'limit' | 'offset'> }): Promise<PaginatedResponseDto<PatientResponseDto>> {
    return await this.patientService.findPatientsWithPagination(data.page, data.limit, data.searchDto);
  }

  @MessagePattern('patient.searchPatientsByName')
  async searchPatientsByName(data: { searchTerm: string; limit: number }): Promise<PatientResponseDto[]> {
    return await this.patientService.searchPatientsByName(data.searchTerm, data.limit);
  }

  @MessagePattern('patient.getPatientStats')
  async getPatientStats(): Promise<PatientStatsDto> {
    return await this.patientService.getPatientStats();
  }

  @MessagePattern('patient.findPatientByCode')
  async findPatientByCode(patientCode: string): Promise<PatientResponseDto> {
    return await this.patientService.findPatientByCode(patientCode);
  }

  @MessagePattern('patient.findOne')
  async findOne(id: string): Promise<PatientResponseDto> {
    return await this.patientService.findOne(id);
  }

  @MessagePattern('patient.update')
  async update(data: { id: string; updatePatientDto: UpdatePatientDto }): Promise<PatientResponseDto> {
    return await this.patientService.update(data.id, data.updatePatientDto);
  }

  @MessagePattern('patient.remove')
  async remove(id: string): Promise<void> {
    return await this.patientService.remove(id);
  }

  @MessagePattern('patient.restore')
  async restore(id: string): Promise<PatientResponseDto> {
    return await this.patientService.restore(id);
  }
}
