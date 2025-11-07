import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Inject,
  Logger,
  UseInterceptors,
  Delete,
  Put,
  Query,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
  ApiQuery,
} from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { handleError } from '@backend/shared-utils';
import {
  TransformInterceptor,
  RequestLoggingInterceptor,
} from '@backend/shared-interceptor';
import { Roles } from '@backend/shared-enums';
import { Role } from '@backend/shared-decorators';
import {
  CreateReportTemplateDto,
  UpdateReportTemplateDto,

} from '@backend/shared-domain';

@ApiTags('Report Templates')
@Controller('report-templates')
@UseInterceptors(RequestLoggingInterceptor, TransformInterceptor)
export class ReportTemplatesController {
  private readonly logger = new Logger('ReportTemplatesController');

  constructor(
    @Inject(process.env.PATIENT_SERVICE_NAME || 'PATIENT_SERVICE')
    private readonly patientServiceClient: ClientProxy
  ) {}

  @Post()
  @Role(Roles.PHYSICIAN, Roles.RADIOLOGIST)
  @ApiOperation({ summary: 'Create report template' })
  @ApiBody({ type: CreateReportTemplateDto })
  @ApiResponse({
    status: 201,
    description: 'Tạo mẫu báo cáo thành công',
  })
  async create(@Body() createReportTemplateDto: CreateReportTemplateDto) {
    try {
      this.logger.log('🏗️ Creating report template');
      const result = await firstValueFrom(
        this.patientServiceClient.send(
          'PatientService.ReportTemplates.Create',
          createReportTemplateDto
        )
      );

      return {
        data: result,
        message: 'Tạo mẫu báo cáo thành công',
      };
    } catch (error) {
      this.logger.error('❌ Failed to create report template', error);
      throw handleError(error);
    }
  }

  @Get()
  @Role(Roles.PHYSICIAN, Roles.RADIOLOGIST)
  @ApiOperation({ summary: 'Get all report templates' })
  @ApiQuery({ name: 'ownerUserId', required: false })
  @ApiQuery({ name: 'templateType', required: false })
  @ApiQuery({ name: 'requestProcedureId', required: false })
  @ApiQuery({ name: 'isPublic', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiResponse({
    status: 200,
    description: 'Lấy danh sách mẫu báo cáo thành công',
  })
  async findAll(
    @Query('ownerUserId') ownerUserId?: string,
    @Query('templateType') templateType?: 'custom' | 'standard',
    @Query('requestProcedureId') requestProcedureId?: string,
    @Query('isPublic') isPublic?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string
  ) {
    try {
      this.logger.log('📋 Fetching report templates');
      const filter: any = {};
      if (ownerUserId) filter.ownerUserId = ownerUserId;
      if (templateType) filter.templateType = templateType;
      if (requestProcedureId) filter.requestProcedureId = requestProcedureId;
      if (isPublic !== undefined) filter.isPublic = isPublic === 'true';
      if (page) filter.page = parseInt(page);
      if (limit) filter.limit = parseInt(limit);

      const result = await firstValueFrom(
        this.patientServiceClient.send(
          'PatientService.ReportTemplates.FindAll',
          filter
        )
      );

      return {
        data: result.data,
        total: result.total,
        page: result.page,
        limit: result.limit,
        message: 'Lấy danh sách mẫu báo cáo thành công',
      };
    } catch (error) {
      this.logger.error('❌ Failed to fetch report templates', error);
      throw handleError(error);
    }
  }

  @Get('public')
  @ApiOperation({ summary: 'Get public report templates' })
  @ApiQuery({ name: 'requestProcedureId', required: false })
  @ApiQuery({ name: 'templateType', required: false })
  @ApiResponse({
    status: 200,
    description: 'Lấy danh sách mẫu báo cáo công khai thành công',
  })
  async findPublic(
    @Query('requestProcedureId') requestProcedureId?: string,
    @Query('templateType') templateType?: 'custom' | 'standard'
  ) {
    try {
      this.logger.log('📋 Fetching public report templates');
      const filter: any = {};
      if (requestProcedureId) filter.requestProcedureId = requestProcedureId;
      if (templateType) filter.templateType = templateType;

      const result = await firstValueFrom(
        this.patientServiceClient.send(
          'PatientService.ReportTemplates.FindPublic',
          filter
        )
      );

      return {
        data: result,
        count: result.length,
        message: 'Lấy danh sách mẫu báo cáo công khai thành công',
      };
    } catch (error) {
      this.logger.error('❌ Failed to fetch public report templates', error);
      throw handleError(error);
    }
  }

  @Get('owner/:ownerUserId')
  @Role(Roles.PHYSICIAN, Roles.RADIOLOGIST)
  @ApiOperation({ summary: 'Get report templates by owner' })
  @ApiParam({ name: 'ownerUserId', description: 'Owner User ID' })
  @ApiResponse({
    status: 200,
    description: 'Lấy danh sách mẫu báo cáo theo người sở hữu thành công',
  })
  async findByOwner(@Param('ownerUserId') ownerUserId: string) {
    try {
      this.logger.log(`📋 Fetching report templates for owner: ${ownerUserId}`);
      const result = await firstValueFrom(
        this.patientServiceClient.send(
          'PatientService.ReportTemplates.FindByOwner',
          ownerUserId
        )
      );

      return {
        data: result,
        count: result.length,
        message: 'Lấy danh sách mẫu báo cáo theo người sở hữu thành công',
      };
    } catch (error) {
      this.logger.error(
        `❌ Failed to fetch report templates for owner: ${ownerUserId}`,
        error
      );
      throw handleError(error);
    }
  }

  @Get('procedure/:requestProcedureId')
  @Role(Roles.PHYSICIAN, Roles.RADIOLOGIST)
  @ApiOperation({ summary: 'Get report templates by procedure' })
  @ApiParam({ name: 'requestProcedureId', description: 'Request Procedure ID' })
  @ApiResponse({
    status: 200,
    description: 'Lấy danh sách mẫu báo cáo theo thủ thuật thành công',
  })
  async findByProcedure(@Param('requestProcedureId') requestProcedureId: string) {
    try {
      this.logger.log(
        `📋 Fetching report templates for procedure: ${requestProcedureId}`
      );
      const result = await firstValueFrom(
        this.patientServiceClient.send(
          'PatientService.ReportTemplates.FindByProcedure',
          requestProcedureId
        )
      );

      return {
        data: result,
        count: result.length,
        message: 'Lấy danh sách mẫu báo cáo theo thủ thuật thành công',
      };
    } catch (error) {
      this.logger.error(
        `❌ Failed to fetch report templates for procedure: ${requestProcedureId}`,
        error
      );
      throw handleError(error);
    }
  }

  @Get(':id')
  @Role(Roles.PHYSICIAN, Roles.RADIOLOGIST)
  @ApiOperation({ summary: 'Get report template by ID' })
  @ApiParam({ name: 'id', description: 'Report Template ID' })
  @ApiResponse({
    status: 200,
    description: 'Lấy thông tin mẫu báo cáo thành công',
  })
  async findOne(@Param('id') id: string) {
    try {
      this.logger.log(`🔎 Fetching report template: ${id}`);
      const result = await firstValueFrom(
        this.patientServiceClient.send(
          'PatientService.ReportTemplates.FindOne',
          id
        )
      );

      return {
        data: result,
        message: 'Lấy thông tin mẫu báo cáo thành công',
      };
    } catch (error) {
      this.logger.error(`❌ Failed to fetch report template: ${id}`, error);
      throw handleError(error);
    }
  }

  @Put(':id')
  @Role(Roles.PHYSICIAN, Roles.RADIOLOGIST)
  @ApiOperation({ summary: 'Update report template' })
  @ApiParam({ name: 'id', description: 'Report Template ID' })
  @ApiBody({ type: UpdateReportTemplateDto })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật mẫu báo cáo thành công',
  })
  async update(
    @Param('id') id: string,
    @Body() updateReportTemplateDto: UpdateReportTemplateDto
  ) {
    try {
      this.logger.log(`🛠️ Updating report template: ${id}`);
      const result = await firstValueFrom(
        this.patientServiceClient.send('PatientService.ReportTemplates.Update', {
          id,
          data: updateReportTemplateDto,
        })
      );

      return {
        data: result,
        message: 'Cập nhật mẫu báo cáo thành công',
      };
    } catch (error) {
      this.logger.error(`❌ Failed to update report template: ${id}`, error);
      throw handleError(error);
    }
  }

  @Delete(':id')
  @Role(Roles.PHYSICIAN, Roles.RADIOLOGIST)
  @ApiOperation({ summary: 'Delete report template' })
  @ApiParam({ name: 'id', description: 'Report Template ID' })
  @ApiResponse({
    status: 200,
    description: 'Xóa mẫu báo cáo thành công',
  })
  async delete(@Param('id') id: string) {
    try {
      this.logger.log(`🗑️ Deleting report template: ${id}`);
      const result = await firstValueFrom(
        this.patientServiceClient.send(
          'PatientService.ReportTemplates.Delete',
          id
        )
      );

      return {
        message: result.message || 'Xóa mẫu báo cáo thành công',
      };
    } catch (error) {
      this.logger.error(`❌ Failed to delete report template: ${id}`, error);
      throw handleError(error);
    }
  }

  @Post(':id/duplicate')
  @Role(Roles.PHYSICIAN, Roles.RADIOLOGIST)
  @ApiOperation({ summary: 'Duplicate report template' })
  @ApiParam({ name: 'id', description: 'Report Template ID to duplicate' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        newTemplateName: { type: 'string' },
        ownerUserId: { type: 'string' },
      },
      required: ['newTemplateName', 'ownerUserId'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Sao chép mẫu báo cáo thành công',
  })
  async duplicate(
    @Param('id') id: string,
    @Body() body: { newTemplateName: string; ownerUserId: string }
  ) {
    try {
      this.logger.log(`📋 Duplicating report template: ${id}`);
      const result = await firstValueFrom(
        this.patientServiceClient.send(
          'PatientService.ReportTemplates.Duplicate',
          {
            id,
            newTemplateName: body.newTemplateName,
            ownerUserId: body.ownerUserId,
          }
        )
      );

      return {
        data: result,
        message: 'Sao chép mẫu báo cáo thành công',
      };
    } catch (error) {
      this.logger.error(`❌ Failed to duplicate report template: ${id}`, error);
      throw handleError(error);
    }
  }
}
