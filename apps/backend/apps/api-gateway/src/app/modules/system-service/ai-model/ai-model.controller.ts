import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Post,
  Put,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  CreateAiAnalysisDto,
  CreateAiModelDto,
  FilterAiAnalysisDto,
  FilterAiModelDto,
  UpdateAiAnalysisDto,
  UpdateAiModelDto,
} from '@backend/shared-domain';
import {
  RequestLoggingInterceptor,
  TransformInterceptor,
} from '@backend/shared-interceptor';
import { Public } from '@backend/shared-decorators';

@Controller('ai-model')
@UseInterceptors(RequestLoggingInterceptor, TransformInterceptor)
export class AiModelController {
  constructor(
    @Inject('SYSTEM_SERVICE') private readonly systemService: ClientProxy
  ) {}

  @Post()
  async create(@Body() createAiModelDto: CreateAiModelDto) {
    return this.systemService.send('ai_model.create', createAiModelDto);
  }



  @Get()
  async findAll(@Query() filter: FilterAiModelDto) {
    return this.systemService.send('ai_model.findAll', filter);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.systemService.send('ai_model.findOne', { id });
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateAiModelDto: UpdateAiModelDto
  ) {
    return this.systemService.send('ai_model.update', {
      id,
      updateAiModelDto,
    });
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.systemService.send('ai_model.remove', { id });
  }

  @Put(':id/status')
  async updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.systemService.send('ai_model.updateStatus', { id, status });
  }
}
