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
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
@Controller('imaging-modalities')
export class ImagingModalitiesController {
  constructor(
    @Inject(process.env.IMAGE_SERVICE_NAME || 'ImageService')
    private readonly imagingService: ClientProxy
  ) {}

  @Get()
  async getImagingModalities() {
    return await firstValueFrom(
      this.imagingService.send('ImagingService.ImagingModality.FindAll', {})
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
      this.imagingService.send('ImagingService.ImagingModality.FindMany', {
        paginationDto,
      })
    );
  }

  @Get(':id')
  async getImagingModalityById(@Param('id') id: string) {
    return await firstValueFrom(
      this.imagingService.send('ImagingService.ImagingModality.FindOne', { id })
    );
  }

  @Post()
  async createImagingModality(@Body() createImagingModalityDto: any) {
    return await firstValueFrom(
      this.imagingService.send(
        'ImagingService.ImagingModality.Create',
        createImagingModalityDto
      )
    );
  }

  @Patch(':id')
  async updateImagingModality(
    @Param('id') id: string,
    @Body() updateImagingModalityDto: any
  ) {
    return await firstValueFrom(
      this.imagingService.send('ImagingService.ImagingModality.Update', {
        id,
        updateImagingModalityDto,
      })
    );
  }

  @Delete(':id')
  async deleteImagingModality(@Param('id') id: string) {
    return await firstValueFrom(
      this.imagingService.send('ImagingService.ImagingModality.Delete', { id })
    );
  }
}
