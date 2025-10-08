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
import { RepositoryPaginationDto } from '@backend/database';

@Controller()
export class PatientController {
  constructor(private readonly patientService: PatientService) {}

  @MessagePattern('PatientService.Patient.Create')
  async create(createPatientDto: CreatePatientDto): Promise<PatientResponseDto> {
    return await this.patientService.create(createPatientDto);
  }

  @MessagePattern('PatientService.Patient.FindAll')
  async findAll(searchDto: PatientSearchDto): Promise<PatientResponseDto[]> {
    return await this.patientService.findAll(searchDto);
  }

  @MessagePattern('PatientService.Patient.FindMany')
  async findPatientsWithPagination(paginationDto: RepositoryPaginationDto): Promise<PaginatedResponseDto<PatientResponseDto>> {
    return await this.patientService.findPatientsWithPagination(paginationDto);
  }

  @MessagePattern('PatientService.Patient.SearchByName')
  async searchPatientsByName(data: { searchTerm: string; limit?: number }): Promise<PatientResponseDto[]> {
    return await this.patientService.searchPatientsByName(data.searchTerm, data.limit);
  }

  @MessagePattern('PatientService.Patient.GetStats')
  async getPatientStats(): Promise<PatientStatsDto> {
    return await this.patientService.getPatientStats();
  }

  @MessagePattern('PatientService.Patient.FindByCode')
  async findPatientByCode(data: { patientCode: string }): Promise<PatientResponseDto> {
    return await this.patientService.findPatientByCode(data.patientCode);
  }

  @MessagePattern('PatientService.Patient.FindOne')
  async findOne(data: { id: string }): Promise<PatientResponseDto> {
    return await this.patientService.findOne(data.id);
  }

  @MessagePattern('PatientService.Patient.Update')
  async update(data: { id: string; updatePatientDto: UpdatePatientDto }): Promise<PatientResponseDto> {
    return await this.patientService.update(data.id, data.updatePatientDto);
  }

  @MessagePattern('PatientService.Patient.Delete')
  async remove(data: { id: string }): Promise<void> {
    return await this.patientService.remove(data.id);
  }

  @MessagePattern('PatientService.Patient.Restore')
  async restore(data: { id: string }): Promise<PatientResponseDto> {
    return await this.patientService.restore(data.id);
  }
}
