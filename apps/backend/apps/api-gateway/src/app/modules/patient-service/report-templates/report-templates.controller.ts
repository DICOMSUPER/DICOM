import {
  CreateReportTemplateDto,
  FilterReportTemplateDto,
  UpdateReportTemplateDto,
} from '@backend/shared-domain';
import {
  RequestLoggingInterceptor,
  TransformInterceptor,
} from '@backend/shared-interceptor';
import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseInterceptors,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Role } from '@backend/shared-decorators';
import { firstValueFrom } from 'rxjs';
import { Roles } from '@backend/shared-enums';
import type { IAuthenticatedRequest } from 'libs/shared-interfaces/src';

@Controller('report-templates')
@UseInterceptors(RequestLoggingInterceptor, TransformInterceptor)
export class ReportTemplatesController {
  constructor(
    @Inject(process.env.PATIENT_SERVICE_NAME || 'PATIENT_SERVICE')
    private readonly patientService: ClientProxy
  ) { }

  @Get()
  async getReportTemplates(
    @Query() filterReportTemplateDto: FilterReportTemplateDto
  ) {
    return await firstValueFrom(
      this.patientService.send('PatientService.ReportTemplate.FindAll', {
        filterReportTemplateDto,
      })
    );
  }

  @Get('paginated')
  async findMany(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('searchField') searchField?: string,
    @Query('sortField') sortField?: string,
    @Query('order') order?: 'asc' | 'desc'
  ) {
    const paginationDto = {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      search,
      searchField,
      sortField,
      order,
    };
    return await firstValueFrom(
      this.patientService.send('PatientService.ReportTemplate.FindMany', {
        paginationDto,
      })
    );
  }
  @Get('by-modality-bodypart')
  async getReportTemplatesByModalityAndBodyPart(
    @Query('modalityId') modalityId?: string,
    @Query('bodyPartId') bodyPartId?: string
  ) {
    return await firstValueFrom(
      this.patientService.send('PatientService.ReportTemplate.FindByModalityIdAndBodyPartId', {
        modalityId,
        bodyPartId,
      })
    );
  }
  @Get(':id')
  async getReportTemplateById(@Param('id') id: string) {
    return await firstValueFrom(
      this.patientService.send('PatientService.ReportTemplate.FindOne', {
        id,
      })
    );
  }

  @Post()
  @Role(Roles.PHYSICIAN, Roles.RADIOLOGIST, Roles.SYSTEM_ADMIN)
  async createReportTemplate(
    @Body() createReportTemplateDto: CreateReportTemplateDto,
    @Req() req: IAuthenticatedRequest
  ) {
    console.log("create report template", createReportTemplateDto);
    console.log("user info", req.userInfo);
    
    return await firstValueFrom(
      this.patientService.send('PatientService.ReportTemplate.Create', {
        createReportTemplateDto,
        userInfo: req.userInfo,
      })
    );
  }

  @Patch(':id')
  async updateReportTemplate(
    @Param('id') id: string,
    @Body() updateReportTemplateDto: UpdateReportTemplateDto
  ) {
    return await firstValueFrom(
      this.patientService.send('PatientService.ReportTemplate.Update', {
        id,
        updateReportTemplateDto,
      })
    );
  }

  @Delete(':id')
  async deleteReportTemplate(@Param('id') id: string) {
    return await firstValueFrom(
      this.patientService.send('PatientService.ReportTemplate.Delete', {
        id,
      })
    );
  }


}