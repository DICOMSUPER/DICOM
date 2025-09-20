import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DiagnosesReportService } from './diagnoses-reports.service';
import { CreateDiagnosesReportDto } from './dto/create-diagnoses-report.dto';
import { UpdateDiagnosesReportDto } from './dto/update-diagnoses-report.dto';

@Controller('diagnoses-report')
export class DiagnosesReportController {
  constructor(private readonly diagnosesReportService: DiagnosesReportService) {}

  @Post()
  create(@Body() createDiagnosesReportDto: CreateDiagnosesReportDto) {
    return this.diagnosesReportService.create(createDiagnosesReportDto);
  }

  @Get()
  findAll() {
    return this.diagnosesReportService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.diagnosesReportService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDiagnosesReportDto: UpdateDiagnosesReportDto) {
    return this.diagnosesReportService.update(+id, updateDiagnosesReportDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.diagnosesReportService.remove(+id);
  }
}
