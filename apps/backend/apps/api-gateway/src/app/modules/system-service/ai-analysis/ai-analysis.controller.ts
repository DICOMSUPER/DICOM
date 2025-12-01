import { Role } from '@backend/shared-decorators';
import {
  CreateAiAnalysisDto,
  FilterAiAnalysisDto,
  UpdateAiAnalysisDto,
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
  UseInterceptors,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Roles } from '@backend/shared-enums';
import type { IAuthenticatedRequest } from '@backend/shared-interfaces';

@Controller('ai-analyses')
@UseInterceptors(RequestLoggingInterceptor, TransformInterceptor)
export class AiAnalysisController {
  constructor(
    @Inject('SYSTEM_SERVICE') private readonly systemService: ClientProxy
  ) {}

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
    },
    @Req() req: IAuthenticatedRequest
  ) {
    console.log("");
    
    return this.systemService.send(
      'SystemService.AiAnalysis.DiagnosisImage',
      {
        body,
        userId: req.userInfo?.userId,
      },
    
    );
  }
  @Get()
  async findAll(@Query() filter: FilterAiAnalysisDto) {
    return this.systemService.send('ai_analysis.findAll', filter);
  }

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
}
