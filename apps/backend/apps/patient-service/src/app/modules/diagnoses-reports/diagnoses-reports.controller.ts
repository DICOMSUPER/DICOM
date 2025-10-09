import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { DiagnosesReportService } from './diagnoses-reports.service';
import { CreateDiagnosesReportDto } from './dto/create-diagnoses-report.dto';
import { UpdateDiagnosesReportDto } from './dto/update-diagnoses-report.dto';
import type { DiagnosesReportResponseDto, PaginatedResponseDto } from '@backend/shared-domain';
import { RepositoryPaginationDto } from '@backend/database';

@Controller()
export class DiagnosesReportController {
  constructor(private readonly diagnosesReportService: DiagnosesReportService) {}

  @MessagePattern('PatientService.Diagnosis.Create')
  create(createDiagnosesReportDto: CreateDiagnosesReportDto) {
    return this.diagnosesReportService.create(createDiagnosesReportDto);
  }

  @MessagePattern('PatientService.Diagnosis.FindMany')
  findMany(paginationDto: RepositoryPaginationDto): Promise<PaginatedResponseDto<DiagnosesReportResponseDto>> {
    return this.diagnosesReportService.findMany(paginationDto);
  }

  @MessagePattern('PatientService.Diagnosis.GetStats')
  getStats() {
    return this.diagnosesReportService.getDiagnosisStats();
  }

  @MessagePattern('PatientService.Diagnosis.GetByType')
  getDiagnosesByType() {
    return this.diagnosesReportService.getDiagnosesByType();
  }

  @MessagePattern('PatientService.Diagnosis.FindOne')
  findOne(data: { id: string }) {
    return this.diagnosesReportService.findOne(data.id);
  }

  @MessagePattern('PatientService.Diagnosis.Update')
  update(data: { id: string; updateDiagnosesReportDto: UpdateDiagnosesReportDto }) {
    return this.diagnosesReportService.update(data.id, data.updateDiagnosesReportDto);
  }

  @MessagePattern('PatientService.Diagnosis.Delete')
  remove(data: { id: string }) {
    return this.diagnosesReportService.remove(data.id);
  }
}
