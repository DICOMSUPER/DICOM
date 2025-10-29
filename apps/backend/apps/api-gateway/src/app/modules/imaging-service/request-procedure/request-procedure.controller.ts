import { CreateRequestProcedureDto, UpdateRequestProcedureDto } from '@backend/shared-domain';
import { RequestLoggingInterceptor, TransformInterceptor } from '@backend/shared-interceptor';
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
  UseInterceptors,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Controller('request-procedure')
@UseInterceptors(RequestLoggingInterceptor, TransformInterceptor)
export class RequestProcedureController {
  constructor(
    @Inject(process.env.IMAGE_SERVICE_NAME || 'IMAGING_SERVICE')
    private readonly imagingService: ClientProxy
  ) {}

  @Get()
  async getRequestProcedures(
    @Query("bodyPartId") bodyPartId?: string,
    @Query("modalityId") modalityId?: string
  ) {
    return await firstValueFrom(
      this.imagingService.send('ImagingService.RequestProcedure.FindAll', { bodyPartId, modalityId })
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
      this.imagingService.send('ImagingService.RequestProcedure.FindMany', {
        paginationDto,
      })
    );
  }

  @Get(':id')
  async getRequestProcedureById(@Param('id') id: string) {
    return await firstValueFrom(
      this.imagingService.send('ImagingService.RequestProcedure.FindOne', {
        id,
      })
    );
  }

  @Post()
  async createRequestProcedure(@Body() createRequestProcedureDto: CreateRequestProcedureDto) {
    return await firstValueFrom(
      this.imagingService.send(
        'ImagingService.RequestProcedure.Create',
        createRequestProcedureDto
      )
    );
  }

  @Patch(':id')
  async updateRequestProcedure(
    @Param('id') id: string,
    @Body() updateRequestProcedureDto: UpdateRequestProcedureDto
  ) {
    return await firstValueFrom(
      this.imagingService.send('ImagingService.RequestProcedure.Update', {
        id,
        updateRequestProcedureDto,
      })
    );
  }

  @Delete(':id')
  async deleteRequestProcedure(@Param('id') id: string) {
    return await firstValueFrom(
      this.imagingService.send('ImagingService.RequestProcedure.Delete', {
        id,
      })
    );
  }
}
