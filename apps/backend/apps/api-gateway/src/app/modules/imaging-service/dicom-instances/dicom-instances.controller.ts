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

@Controller('dicom-instances')
export class DicomInstancesController {
  constructor(
    @Inject(process.env.IMAGE_SERVICE_NAME || 'ImagingService')
    private readonly imagingService: ClientProxy
  ) {}

  @Get()
  async findAll() {
    return await firstValueFrom(
      this.imagingService.send('ImagingService.DicomInstances.FindAll', {})
    );
  }

  @Get('reference/:id')
  async findByReferenceId(
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
        'ImagingService.DicomInstances.FindByReferenceId',
        {
          id,
          type,
          paginationDto,
        }
      )
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
      this.imagingService.send('ImagingService.DicomInstances.FindMany', {
        paginationDto,
      })
    );
  }

  @Get(':id')
  async getOne(@Param('id') id: string) {
    return await firstValueFrom(
      this.imagingService.send('ImagingService.DicomInstances.FindOne', { id })
    );
  }

  @Post()
  async create(@Body() createDicomInstanceDto: any) {
    return await firstValueFrom(
      this.imagingService.send('ImagingService.DicomInstances.Create', {
        createDicomInstanceDto,
      })
    );
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateDicomInstanceDto: any) {
    return await firstValueFrom(
      this.imagingService.send('ImagingService.DicomInstances.Update', {
        id,
        updateDicomInstanceDto,
      })
    );
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return await firstValueFrom(
      this.imagingService.send('ImagingService.DicomInstances.Delete', { id })
    );
  }
}
