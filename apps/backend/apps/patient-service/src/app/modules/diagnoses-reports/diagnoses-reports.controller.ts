import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { DiagnosesReportService } from './diagnoses-reports.service';
import { CreateDiagnosesReportDto } from './dto/create-diagnoses-report.dto';
import { UpdateDiagnosesReportDto } from './dto/update-diagnoses-report.dto';
import type { DiagnosisSearchFilters } from '@backend/shared-domain';

@Controller()
export class DiagnosesReportController {
  constructor(private readonly diagnosesReportService: DiagnosesReportService) {}

  @MessagePattern('PatientService.Diagnosis.Create')
  create(createDiagnosesReportDto: CreateDiagnosesReportDto) {
    return this.diagnosesReportService.create(createDiagnosesReportDto);
  }

  @MessagePattern('PatientService.Diagnosis.FindAll')
  findAll(filters: DiagnosisSearchFilters) {
    return this.diagnosesReportService.findAll(filters);
  }

  @MessagePattern('PatientService.Diagnosis.GetStats')
  getStats() {
    return this.diagnosesReportService.getDiagnosisStats();
  }

  @MessagePattern('PatientService.Diagnosis.GetByType')
  getDiagnosesByType() {
    return this.diagnosesReportService.getDiagnosesByType();
  }

  @MessagePattern('PatientService.Diagnosis.FindByEncounter')
  findByEncounter(data: { encounterId: string }) {
    return this.diagnosesReportService.findByEncounter(data.encounterId);
  }

  @MessagePattern('PatientService.Diagnosis.FindByPatient')
  findByPatient(data: { patientId: string; limit?: number }) {
    return this.diagnosesReportService.findByPatient(data.patientId, data.limit);
  }

  @MessagePattern('PatientService.Diagnosis.FindByPhysician')
  findByPhysician(data: { physicianId: string }) {
    return this.diagnosesReportService.findByPhysician(data.physicianId);
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
