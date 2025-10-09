import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateDiagnosesReportDto } from './dto/create-diagnoses-report.dto';
import { UpdateDiagnosesReportDto } from './dto/update-diagnoses-report.dto';
import { DiagnosisReportRepository, DiagnosesReportResponseDto, PaginatedResponseDto } from '@backend/shared-domain';
import { DiagnosisType, DiagnosisStatus, Severity } from '@backend/shared-enums';
import { RepositoryPaginationDto } from '@backend/database';

@Injectable()
export class DiagnosesReportService {
  constructor(
    private readonly diagnosisRepository: DiagnosisReportRepository,
  ) {}

  async create(createDiagnosesReportDto: CreateDiagnosesReportDto) {
    const diagnosisData = {
      ...createDiagnosesReportDto,
      diagnosisDate: createDiagnosesReportDto.diagnosisDate || new Date(),
      diagnosisStatus: createDiagnosesReportDto.diagnosisStatus || DiagnosisStatus.ACTIVE,
      followupRequired: createDiagnosesReportDto.followupRequired || false,
      followUpInstructions: createDiagnosesReportDto.followUpInstructions || false,
      isDeleted: false,
    };

    return await this.diagnosisRepository.create(diagnosisData);
  }

  async findMany(paginationDto: RepositoryPaginationDto): Promise<PaginatedResponseDto<DiagnosesReportResponseDto>> {
    const result = await this.diagnosisRepository.findWithPagination(paginationDto);
    return {
      data: result.data.map((diagnosis: any) => this.mapToResponseDto(diagnosis)),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
      hasNextPage: result.hasNextPage,
      hasPreviousPage: result.hasPreviousPage
    };
  }

  async findOne(id: string) {
    const diagnosis = await this.diagnosisRepository.findById(id);
    if (!diagnosis) {
      throw new NotFoundException(`Diagnosis report with ID ${id} not found`);
    }
    return diagnosis;
  }

  async findByEncounter(encounterId: string) {
    return await this.diagnosisRepository.findByEncounterId(encounterId);
  }

  async findByPatient(patientId: string, limit?: number) {
    return await this.diagnosisRepository.findByPatientId(patientId, limit);
  }

  async findByPhysician(physicianId: string) {
    return await this.diagnosisRepository.findByPhysician(physicianId);
  }

  async update(id: string, updateDiagnosesReportDto: UpdateDiagnosesReportDto) {
    const diagnosis = await this.findOne(id);
    
    const updatedDiagnosis = await this.diagnosisRepository.update(id, {
      ...updateDiagnosesReportDto,
      updatedAt: new Date()
    });

    return updatedDiagnosis;
  }

  async remove(id: string) {
    const diagnosis = await this.findOne(id);
    
    const deleted = await this.diagnosisRepository.delete(id);
    if (!deleted) {
      throw new NotFoundException(`Failed to delete diagnosis report with ID ${id}`);
    }

    return { message: 'Diagnosis report deleted successfully' };
  }

  async getDiagnosisStats() {
    const total = await this.diagnosisRepository.count({
      where: { isDeleted: false }
    });

    const active = await this.diagnosisRepository.count({
      where: { 
        diagnosisStatus: DiagnosisStatus.ACTIVE,
        isDeleted: false 
      }
    });

    const resolved = await this.diagnosisRepository.count({
      where: { 
        diagnosisStatus: DiagnosisStatus.RESOLVED,
        isDeleted: false 
      }
    });

    const critical = await this.diagnosisRepository.count({
      where: { 
        severity: Severity.CRITICAL,
        isDeleted: false 
      }
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayDiagnoses = await this.diagnosisRepository.count({
      where: {
        diagnosisDate: {
          $gte: today,
          $lt: tomorrow
        } as any,
        isDeleted: false
      }
    });

    return {
      total,
      active,
      resolved,
      critical,
      today: todayDiagnoses
    };
  }

  async getDiagnosesByType() {
    const primary = await this.diagnosisRepository.count({
      where: { 
        diagnosisType: DiagnosisType.PRIMARY,
        isDeleted: false 
      }
    });

    const secondary = await this.diagnosisRepository.count({
      where: { 
        diagnosisType: DiagnosisType.SECONDARY,
        isDeleted: false 
      }
    });

    const differential = await this.diagnosisRepository.count({
      where: { 
        diagnosisType: DiagnosisType.DIFFERENTIAL,
        isDeleted: false 
      }
    });

    return {
      primary,
      secondary,
      differential
    };
  }

  private mapToResponseDto(diagnosis: any): DiagnosesReportResponseDto {
    return {
      id: diagnosis.id,
      encounterId: diagnosis.encounterId,
      patientId: diagnosis.patientId,
      physicianId: diagnosis.physicianId,
      studyId: diagnosis.studyId,
      diagnosisName: diagnosis.diagnosisName,
      diagnosisCode: diagnosis.diagnosisCode,
      diagnosisType: diagnosis.diagnosisType,
      diagnosisStatus: diagnosis.diagnosisStatus,
      severity: diagnosis.severity,
      description: diagnosis.description,
      followUpInstructions: diagnosis.followUpInstructions,
      diagnosisDate: diagnosis.diagnosisDate,
      recordedDate: diagnosis.recordedDate,
      createdAt: diagnosis.createdAt,
      updatedAt: diagnosis.updatedAt
    };
  }
}
