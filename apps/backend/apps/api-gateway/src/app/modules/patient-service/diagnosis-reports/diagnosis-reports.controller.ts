import { Role } from '@backend/shared-decorators';
import {
  CreateDiagnosesReportDto,
  FilterDiagnosesReportDto,
  UpdateDiagnosesReportDto,
} from '@backend/shared-domain';
import { Roles } from '@backend/shared-enums';
import {
  RequestLoggingInterceptor,
  TransformInterceptor,
} from '@backend/shared-interceptor';
import type { IAuthenticatedRequest } from '@backend/shared-interfaces';
import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Logger,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseInterceptors,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Controller('diagnosis-reports')
@UseInterceptors(RequestLoggingInterceptor, TransformInterceptor)
export class DiagnosisReportsController {
  private readonly logger = new Logger('DiagnosisReportController');

  constructor(
    @Inject(process.env.PATIENT_SERVICE_NAME || 'PATIENT_SERVICE')
    private readonly patientService: ClientProxy
  ) {}

  @Role(Roles.RADIOLOGIST, Roles.PHYSICIAN, Roles.SYSTEM_ADMIN)
  @Post()
  async createDiagnoseReport(
    @Body() createDiagnosesReportDto: CreateDiagnosesReportDto
  ) {
    try {
      return await firstValueFrom(
        this.patientService.send('PatientService.DiagnosesReport.Create', {
          createDiagnosesReportDto,
        })
      );
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  @Patch(':id')
  @Role(Roles.RADIOLOGIST, Roles.PHYSICIAN, Roles.SYSTEM_ADMIN)
  async updateDiagnoseReport(
    @Param("id") id: string,
    @Body() updateDiagnosesReportDto: UpdateDiagnosesReportDto
  ) {
    try {
      return await firstValueFrom(
        this.patientService.send('PatientService.DiagnosesReport.Update', {
          id,
          updateDiagnosesReportDto,
        })
      );
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  @Get()
  @Role(
    Roles.RADIOLOGIST,
    Roles.PHYSICIAN,
    Roles.SYSTEM_ADMIN,
    Roles.IMAGING_TECHNICIAN
  )
  async getAllDiagnosesReport() {
    try {
      return await firstValueFrom(
        this.patientService.send('PatientService.DiagnosesReport.FindAll', {})
      );
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  @Get('paginated')
  @Role(
    Roles.RADIOLOGIST,
    Roles.PHYSICIAN,
    Roles.SYSTEM_ADMIN,
    Roles.IMAGING_TECHNICIAN
  )
  async findManyDiagnosisReport(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('searchField') searchField?: string,
    @Query('sortField') sortField?: string,
    @Query('order') order?: 'asc' | 'desc'
  ) {
    try {
      const paginationDto = {
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
        search,
        searchField,
        sortField,
        order,
      };

      return await firstValueFrom(
        this.patientService.send('PatientService.DiagnosesReport.FindMany', {
          paginationDto,
        })
      );
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  @Get("with-filter")
  @Role(Roles.PHYSICIAN, Roles.SYSTEM_ADMIN)
  async getAllDiagnoses(
    @Query() filter: FilterDiagnosesReportDto,
    @Req() req: IAuthenticatedRequest
  ) {
    return await firstValueFrom(
      this.patientService.send(
        'PatientService.DiagnosesReport.FindAllWithFilter',
        { filter, userInfo: req.userInfo }
      )
    );
  }

  @Get(':id')
  @Role(
    Roles.RADIOLOGIST,
    Roles.PHYSICIAN,
    Roles.SYSTEM_ADMIN,
    Roles.IMAGING_TECHNICIAN
  )
  async getDiagnosesReport(@Param("id") id: string) {
    try {
      return await firstValueFrom(
        this.patientService.send('PatientService.DiagnosesReport.FindOne', {
          id,
        })
      );
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  @Delete(':id')
  @Role(
    Roles.RADIOLOGIST,
    Roles.PHYSICIAN,
    Roles.SYSTEM_ADMIN,
    Roles.IMAGING_TECHNICIAN
  )
  async deleteDiagnosisReport(@Param('id') id: string) {
    try {
      return await firstValueFrom(
        this.patientService.send('PatientService.DiagnosesReport.Delete', {
          id,
        })
      );
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  @Get('studyId/:studyId')
  @Role(
    Roles.RADIOLOGIST,
    Roles.PHYSICIAN,
    Roles.SYSTEM_ADMIN,
    Roles.IMAGING_TECHNICIAN
  )
  async getDiagnosisReportByStudyId(@Param('studyId') studyId: string) {
    try {
      return await firstValueFrom(
        this.patientService.send(
          'PatientService.DiagnosesReport.FindByStudyId',
          {
            studyId,
          }
        )
      );
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }
}
