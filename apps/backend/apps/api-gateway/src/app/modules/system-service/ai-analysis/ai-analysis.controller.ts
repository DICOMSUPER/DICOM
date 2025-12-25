import { Role } from '@backend/shared-decorators';
import {
  CreateAiAnalysisDto,
  FilterAiAnalysisDto,
  UpdateAiAnalysisDto,
  SubmitFeedbackDto,
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
  Put,
  Query,
  Req,
  Res,
  UseInterceptors,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Roles } from '@backend/shared-enums';
import type {
  AiResultDiagnosis,
  IAuthenticatedRequest,
} from '@backend/shared-interfaces';
import type { Response } from 'express';

@Controller('ai-analyses')
@UseInterceptors(RequestLoggingInterceptor, TransformInterceptor)
export class AiAnalysisController {
  constructor(
    @Inject('SYSTEM_SERVICE') private readonly systemService: ClientProxy
  ) { }

  @Post()
  async create(@Body() createAiAnalysisDto: CreateAiAnalysisDto) {
    return this.systemService.send('ai_analysis.create', createAiAnalysisDto);
  }

  // @Post('/diagnosis-image')
  // @Public()
  // async diagnosisImageByAI(
  //   @Body()
  //   body: {
  //     base64Image: string;
  //     folder: string;
  //   }
  // ) {
  //   return this.systemService.send(
  //     'SystemService.AiAnalysis.DiagnosisImage',
  //     body
  //   );
  // }

  @Post('/diagnosis-image')
  @Role(
    Roles.RADIOLOGIST,
    Roles.SYSTEM_ADMIN,
    Roles.PHYSICIAN,
    Roles.IMAGING_TECHNICIAN
  )
  async diagnosisImageByAI(
    @Body()
    body: {
      base64Image: string;
      aiModelId?: string;
      modelName?: string;
      versionName?: string;
      selectedStudyId?: string;
      folder: string;
    },
    @Req() req: IAuthenticatedRequest
  ) {
    return this.systemService.send('SystemService.AiAnalysis.DiagnosisImage', {
      body,
      userId: req.userInfo?.userId,
      // folder: body.folder,
    });
  }
  @Get()
  async findAll(@Query() filter: FilterAiAnalysisDto) {
    return this.systemService.send('ai_analysis.findAll', filter);
  }

  // Specific routes MUST come before dynamic routes to avoid conflicts
  @Get('stats')
  @Role(
    Roles.RADIOLOGIST,
    Roles.SYSTEM_ADMIN,
    Roles.PHYSICIAN,
    Roles.IMAGING_TECHNICIAN
  )
  async getStats() {
    return this.systemService.send('ai_analysis.getStats', {});
  }

  // get ai analysis by study id
  @Get('study/:studyId')
  async getAiAnalysisByStudyId(@Param('studyId') studyId: string) {
    return this.systemService.send('ai_analysis.getByStudyId', { studyId });
  }

  // Dynamic :id routes come AFTER specific routes
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.systemService.send('ai_analysis.findOne', { id });
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateAiAnalysisDto: UpdateAiAnalysisDto
  ) {
    return this.systemService.send('ai_analysis.update', {
      id,
      updateAiAnalysisDto,
    });
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.systemService.send('ai_analysis.remove', { id });
  }

  @Put(':id/status')
  async updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.systemService.send('ai_analysis.updateStatus', { id, status });
  }

  @Post(':id/feedback')
  @Role(
    Roles.RADIOLOGIST,
    Roles.SYSTEM_ADMIN,
    Roles.PHYSICIAN,
    Roles.IMAGING_TECHNICIAN
  )
  async submitFeedback(
    @Param('id') id: string,
    @Body() body: SubmitFeedbackDto,
    @Req() req: IAuthenticatedRequest
  ) {
    return this.systemService.send('ai_analysis.submitFeedback', {
      id,
      userId: req.userInfo?.userId,
      isHelpful: body.isHelpful,
      feedbackComment: body.feedbackComment,
    });
  }

  // Specific POST routes come before any dynamic POST routes
  @Post('export-excel')
  @Role(
    Roles.RADIOLOGIST,
    Roles.SYSTEM_ADMIN,
    Roles.PHYSICIAN,
    Roles.IMAGING_TECHNICIAN
  )
  async exportToExcel(
    @Body()
    filter: {
      fromDate?: string;
      toDate?: string;
      status?: string;
      isHelpful?: boolean;
    },
    @Res() res: Response
  ) {
    const buffer = await this.systemService
      .send('ai_analysis.exportToExcel', filter)
      .toPromise();

    const fileName = `AI_Analyses_Export_${new Date().toISOString().split('T')[0]
      }.xlsx`;

    // Handle serialized Buffer from microservice
    // In production, Buffer objects get serialized as {type: 'Buffer', data: [...]}
    let excelBuffer: Buffer;
    if (buffer?.type === 'Buffer' && Array.isArray(buffer.data)) {
      excelBuffer = Buffer.from(buffer.data);
    } else if (Buffer.isBuffer(buffer)) {
      excelBuffer = buffer;
    } else {
      excelBuffer = Buffer.from(buffer);
    }

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.send(excelBuffer);
  }

  // SystemService.AiAnalysis.AnalyzeDiagnosisWithImageAndROI
  @Post('analyze-diagnosis')
  async analyzeDiagnosisWithImageAndROI(
    @Body()
    body: {
      image_url: string;
      modelName: string;
      aiResult: AiResultDiagnosis;
    }
  ) {
    return this.systemService.send(
      'SystemService.AiAnalysis.AnalyzeDiagnosisWithImageAndROI',
      body
    );
  }
}
