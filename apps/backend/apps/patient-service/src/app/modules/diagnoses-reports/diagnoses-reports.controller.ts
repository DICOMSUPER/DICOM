import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { DiagnosesReportService } from './diagnoses-reports.service';
import { CreateDiagnosesReportDto } from './dto/create-diagnoses-report.dto';
import { UpdateDiagnosesReportDto } from './dto/update-diagnoses-report.dto';
import { DiagnosisSearchFilters } from '@backend/shared-domain';

@Controller('diagnoses')
export class DiagnosesReportController {
  constructor(private readonly diagnosesReportService: DiagnosesReportService) {}

  @Post()
  create(@Body() createDiagnosesReportDto: CreateDiagnosesReportDto) {
    return this.diagnosesReportService.create(createDiagnosesReportDto);
  }

  @Get()
  findAll(@Query() filters: DiagnosisSearchFilters) {
    return this.diagnosesReportService.findAll(filters);
  }

  @Get('stats')
  getStats() {
    return this.diagnosesReportService.getDiagnosisStats();
  }

  @Get('types')
  getDiagnosesByType() {
    return this.diagnosesReportService.getDiagnosesByType();
  }

  @Get('encounter/:encounterId')
  findByEncounter(@Param('encounterId') encounterId: string) {
    return this.diagnosesReportService.findByEncounter(encounterId);
  }

  @Get('patient/:patientId')
  findByPatient(@Param('patientId') patientId: string, @Query('limit') limit?: number) {
    return this.diagnosesReportService.findByPatient(patientId, limit);
  }

  @Get('physician/:physicianId')
  findByPhysician(@Param('physicianId') physicianId: string) {
    return this.diagnosesReportService.findByPhysician(physicianId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.diagnosesReportService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDiagnosesReportDto: UpdateDiagnosesReportDto) {
    return this.diagnosesReportService.update(id, updateDiagnosesReportDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.diagnosesReportService.remove(id);
  }
}
