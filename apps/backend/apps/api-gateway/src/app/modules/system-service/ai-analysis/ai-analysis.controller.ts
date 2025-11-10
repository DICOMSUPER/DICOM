import { Body, Controller, Delete, Get, Inject, Param, Post, Put, Query, UseInterceptors } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { 
  CreateAiAnalysisDto, 
  FilterAiAnalysisDto, 
  UpdateAiAnalysisDto 
} from '@backend/shared-domain';
import { RequestLoggingInterceptor, TransformInterceptor } from '@backend/shared-interceptor';

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

  @Get()
  async findAll(@Query() filter: FilterAiAnalysisDto) {
    return this.systemService.send('ai_analysis.findAll', filter);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.systemService.send('ai_analysis.findOne', { id });
  }

  @Put(':id')
  async update(
    @Param('id') id: string, 
    @Body() updateAiAnalysisDto: UpdateAiAnalysisDto
  ) {
    return this.systemService.send('ai_analysis.update', { id, updateAiAnalysisDto });
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.systemService.send('ai_analysis.remove', { id });
  }

  @Put(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: string
  ) {
    return this.systemService.send('ai_analysis.updateStatus', { id, status });
  }
}
