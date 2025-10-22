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
import {
  TransformInterceptor,
  RequestLoggingInterceptor,
} from '@backend/shared-interceptor';
@Controller('dicom-series')
@UseInterceptors(RequestLoggingInterceptor, TransformInterceptor)
export class DicomSeriesController {
  constructor(
    @Inject(process.env.IMAGE_SERVICE_NAME || 'IMAGING_SERVICE')
    private readonly imagingService: ClientProxy
  ) {}

  @Get()
  async getAllDicomSeries() {
    return await firstValueFrom(
      this.imagingService.send('ImagingService.DicomSeries.FindAll', {})
    );
  }

  @Get('reference/:id')
  async getDicomSeriesByReference(
    @Param('id') id: string,
    @Query('type') type: string,
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
      this.imagingService.send('ImagingService.DicomSeries.FindByReferenceId', {
        id,
        type,
        paginationDto,
      })
    );
  }

  @Get('paginated')
  async getManyDicomSeries(
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
      this.imagingService.send('ImagingService.DicomSeries.FindMany', {
        paginationDto,
      })
    );
  }

  @Get(':id')
  async getDicomSeries(@Param('id') id: string) {
    return await firstValueFrom(
      this.imagingService.send('ImagingService.DicomSeries.FindOne', { id })
    );
  }

  @Post()
  async createDicomSeries(@Body() createDicomSeriesDto: any) {
    return await firstValueFrom(
      this.imagingService.send('ImagingService.DicomSeries.Create', {
        createDicomSeriesDto,
      })
    );
  }

  @Patch(':id')
  async updateDicomSeries(
    @Param('id') id: string,
    @Body() updateDicomSeriesDto: any
  ) {
    return await firstValueFrom(
      this.imagingService.send('ImagingService.DicomSeries.Update', {
        id,
        updateDicomSeriesDto,
      })
    );
  }

  @Delete(':id')
  async deleteDicomSeries(@Param('id') id: string) {
    return await firstValueFrom(
      this.imagingService.send('ImagingService.DicomSeries.Delete', {
        id,
      })
    );
  }
}
