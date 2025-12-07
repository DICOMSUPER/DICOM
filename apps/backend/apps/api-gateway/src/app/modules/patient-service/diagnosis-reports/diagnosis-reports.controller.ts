import { Role } from '@backend/shared-decorators';
import {
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
import { RedisService } from '@backend/redis';
import { firstValueFrom } from 'rxjs';
import { cacheKeyBuilder } from '../../../../utils/cache-builder.utils';
import { CACHE_TTL_SECONDS, CacheEntity } from '../../../../constant/cache';

@Controller('diagnosis-reports')
@UseInterceptors(RequestLoggingInterceptor, TransformInterceptor)
export class DiagnosisReportsController {
  private readonly logger = new Logger('DiagnosisReportController');

  constructor(
    @Inject(process.env.PATIENT_SERVICE_NAME || 'PATIENT_SERVICE')
    private readonly patientService: ClientProxy,
    @Inject(RedisService)
    private readonly redisService: RedisService
  ) {}

  private async uncacheDiagnosisReports(id?: string) {
    if (id) {
      await this.redisService.delete(
        cacheKeyBuilder.id(CacheEntity.diagnosticReports, id)
      );
    }

    await this.redisService.delete(
      cacheKeyBuilder.findAll(CacheEntity.diagnosticReports)
    );

    await this.redisService.deleteKeyStartingWith(
      cacheKeyBuilder.paginated(CacheEntity.diagnosticReports)
    );

    await this.redisService.deleteKeyStartingWith(
      cacheKeyBuilder.filter(CacheEntity.diagnosticReports)
    );

    await this.redisService.delete(
      cacheKeyBuilder.stats(CacheEntity.diagnosticReports)
    );

    await this.redisService.deleteKeyStartingWith(
      cacheKeyBuilder.byStudyId(CacheEntity.diagnosticReports)
    );
  }

  @Role(Roles.RADIOLOGIST, Roles.PHYSICIAN, Roles.SYSTEM_ADMIN)
  @Post()
  async createDiagnoseReport(@Body() createDiagnosesReportDto: any) {
    console.log('diagnosis report', createDiagnosesReportDto);

    try {
      const report = await firstValueFrom(
        this.patientService.send('PatientService.DiagnosesReport.Create', {
          createDiagnosesReportDto,
        })
      );

      const pattern = cacheKeyBuilder.id(
        CacheEntity.diagnosticReports,
        report.id
      );

      await this.uncacheDiagnosisReports();
      await this.redisService.set(pattern, report, CACHE_TTL_SECONDS);

      return report;
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  @Patch(':id')
  @Role(Roles.RADIOLOGIST, Roles.PHYSICIAN, Roles.SYSTEM_ADMIN)
  async updateDiagnoseReport(
    @Param('id') id: string,
    @Body() updateDiagnosesReportDto: UpdateDiagnosesReportDto
  ) {
    try {
      const report = await firstValueFrom(
        this.patientService.send('PatientService.DiagnosesReport.Update', {
          id,
          updateDiagnosesReportDto,
        })
      );

      const pattern = cacheKeyBuilder.id(
        CacheEntity.diagnosticReports,
        report.id
      );
      await this.uncacheDiagnosisReports(report.id);
      await this.redisService.set(pattern, report, CACHE_TTL_SECONDS);

      return report;
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
      const pattern = cacheKeyBuilder.findAll(CacheEntity.diagnosticReports);

      const cached = await this.redisService.get(pattern);
      if (cached) {
        this.logger.log('Returning cached diagnosis reports');
        return cached;
      }

      const reports = await firstValueFrom(
        this.patientService.send('PatientService.DiagnosesReport.FindAll', {})
      );

      await this.redisService.set(pattern, reports, CACHE_TTL_SECONDS);

      return reports;
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
      const pattern = cacheKeyBuilder.paginated(CacheEntity.diagnosticReports, {
        page,
        limit,
        search,
        searchField,
        sortField,
        order,
      });

      const cached = await this.redisService.get(pattern);
      if (cached) {
        this.logger.log('Returning cached diagnosis reports');
        return cached;
      }

      const paginationDto = {
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
        search,
        searchField,
        sortField,
        order,
      };

      const reports = await firstValueFrom(
        this.patientService.send('PatientService.DiagnosesReport.FindMany', {
          paginationDto,
        })
      );

      await this.redisService.set(pattern, reports, CACHE_TTL_SECONDS);

      return reports;
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  @Get('with-filter')
  @Role(Roles.PHYSICIAN, Roles.SYSTEM_ADMIN)
  async getAllDiagnoses(
    @Query() filter: FilterDiagnosesReportDto,
    @Req() req: IAuthenticatedRequest
  ) {
    const pattern = cacheKeyBuilder.filter(
      CacheEntity.diagnosticReports,
      filter
    );
    const cached = await this.redisService.get(pattern);
    if (cached) {
      this.logger.log('Returning cached diagnosis reports with filter');
      return cached;
    }

    const reports = await firstValueFrom(
      this.patientService.send(
        'PatientService.DiagnosesReport.FindAllWithFilter',
        { filter, userInfo: req.userInfo }
      )
    );

    await this.redisService.set(pattern, reports, CACHE_TTL_SECONDS);

    return reports;
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
      const pattern = cacheKeyBuilder.byStudyId(
        CacheEntity.diagnosticReports,
        studyId
      );
      const cached = await this.redisService.get(pattern);
      if (cached) {
        this.logger.log('Returning cached diagnosis report by studyId');
        return cached;
      }

      const reports = await firstValueFrom(
        this.patientService.send(
          'PatientService.DiagnosesReport.FindByStudyId',
          {
            studyId,
          }
        )
      );

      await this.redisService.set(pattern, reports, CACHE_TTL_SECONDS);

      return reports;
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  @Get('stats')
  @Role(Roles.PHYSICIAN, Roles.SYSTEM_ADMIN, Roles.RADIOLOGIST)
  async getStats(@Req() req: IAuthenticatedRequest) {
    try {
      const pattern = cacheKeyBuilder.stats(CacheEntity.diagnosticReports);
      const cached = await this.redisService.get(pattern);
      if (cached) {
        this.logger.log('Returning cached diagnosis report stats');
        return cached;
      }

      const reports = await firstValueFrom(
        this.patientService.send('PatientService.DiagnosesReport.GetStats', {
          userInfo: req?.userInfo,
        })
      );

      await this.redisService.set(pattern, reports, CACHE_TTL_SECONDS);

      return reports;
    } catch (error) {
      this.logger.error('Error getting diagnosis report stats:', error);
      throw error;
    }
  }

  @Get(':id')
  @Role(
    Roles.RADIOLOGIST,
    Roles.PHYSICIAN,
    Roles.SYSTEM_ADMIN,
    Roles.IMAGING_TECHNICIAN
  )
  async getDiagnosesReport(@Param('id') id: string) {
    try {
      const pattern = cacheKeyBuilder.id(CacheEntity.diagnosticReports, id);

      const cached = await this.redisService.get(pattern);

      if (cached) {
        this.logger.log('Returning cached diagnosis report by ID');
        return cached;
      }

      const reports = await firstValueFrom(
        this.patientService.send('PatientService.DiagnosesReport.FindOne', {
          id,
        })
      );

      await this.redisService.set(pattern, reports, CACHE_TTL_SECONDS);

      return reports;
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
      const result = await firstValueFrom(
        this.patientService.send('PatientService.DiagnosesReport.Delete', {
          id,
        })
      );

      await this.uncacheDiagnosisReports(id);

      return result;
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  @Post(':id/reject')
  @Role(Roles.PHYSICIAN, Roles.RADIOLOGIST, Roles.SYSTEM_ADMIN)
  async rejectDiagnosisReport(
    @Param('id') id: string,
    @Body() body: { rejectionReason: string },
    @Req() req: IAuthenticatedRequest
  ) {
    try {
      const report = await firstValueFrom(
        this.patientService.send('PatientService.DiagnosesReport.Reject', {
          id,
          rejectedBy: req.userInfo.userId,
          rejectionReason: body.rejectionReason,
        })
      );

      await this.uncacheDiagnosisReports(id);

      const pattern = cacheKeyBuilder.id(
        CacheEntity.diagnosticReports,
        report.id
      );

      await this.redisService.set(pattern, report, CACHE_TTL_SECONDS);

      return report;
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  @Post(':id/approve')
  @Role(Roles.PHYSICIAN, Roles.RADIOLOGIST, Roles.SYSTEM_ADMIN)
  async approveDiagnosisReport(
    @Param('id') id: string,
    @Req() req: IAuthenticatedRequest
  ) {
    try {
      const report = await firstValueFrom(
        this.patientService.send('PatientService.DiagnosesReport.Approve', {
          id,
          approvedBy: req.userInfo.userId,
        })
      );

      await this.uncacheDiagnosisReports(id);

      const pattern = cacheKeyBuilder.id(
        CacheEntity.diagnosticReports,
        report.id
      );

      await this.redisService.set(pattern, report, CACHE_TTL_SECONDS);

      return report;
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }
}
