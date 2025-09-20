import { Injectable } from '@nestjs/common';
import { CreateDiagnosesReportDto } from './dto/create-diagnoses-report.dto';
import { UpdateDiagnosesReportDto } from './dto/update-diagnoses-report.dto';

@Injectable()
export class DiagnosesReportService {
  create(createDiagnosesReportDto: CreateDiagnosesReportDto) {
    return 'This action adds a new diagnosesReport';
  }

  findAll() {
    return `This action returns all diagnosesReport`;
  }

  findOne(id: number) {
    return `This action returns a #${id} diagnosesReport`;
  }

  update(id: number, updateDiagnosesReportDto: UpdateDiagnosesReportDto) {
    return `This action updates a #${id} diagnosesReport`;
  }

  remove(id: number) {
    return `This action removes a #${id} diagnosesReport`;
  }
}
