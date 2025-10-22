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
@Controller('image-annotations')
@UseInterceptors(RequestLoggingInterceptor, TransformInterceptor)
export class ImageAnnotationsController {
  constructor(
    @Inject(process.env.IMAGE_SERVICE_NAME || 'IMAGING_SERVICE')
    private readonly imagingService: ClientProxy
  ) {}

  @Get()
  async getAll() {
    return await firstValueFrom(
      this.imagingService.send('ImagingService.ImageAnnotations.FindAll', {})
    );
  }

  @Get('paginated')
  async getMany(
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
      this.imagingService.send('ImagingService.ImageAnnotations.FindMany', {
        paginationDto,
      })
    );
  }

  @Get('reference/:id')
  async getByReferenceId(
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
      this.imagingService.send(
        'ImagingService.ImageAnnotations.FindByReferenceId',
        { id, type, paginationDto }
      )
    );
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    return await firstValueFrom(
      this.imagingService.send('ImagingService.ImageAnnotations.FindOne', {
        id,
      })
    );
  }

  @Post()
  async create(@Body() createImageAnnotationDto: any) {
    return await firstValueFrom(
      this.imagingService.send('ImagingService.ImageAnnotations.Create', {
        createImageAnnotationDto,
      })
    );
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateImageAnnotationDto: any) {
    return await firstValueFrom(
      this.imagingService.send('ImagingService.ImageAnnotations.Update', {
        id,
        updateImageAnnotationDto,
      })
    );
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return await firstValueFrom(
      this.imagingService.send('ImagingService.ImageAnnotations.Delete', { id })
    );
  }
}
