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
import {
  CreateModalityMachineDto,
  UpdateModalityMachineDto,
} from '@backend/shared-domain';

@Controller('modality-machines')
@UseInterceptors(RequestLoggingInterceptor, TransformInterceptor)
export class ModalityMachinesController {
  constructor(
    @Inject(process.env.IMAGE_SERVICE_NAME || 'IMAGING_SERVICE')
    private readonly imagingService: ClientProxy
  ) {}

  @Get()
  async findAll(@Query('modalityId') modalityId?: string) {
    try {
      return await firstValueFrom(
        this.imagingService.send('ImagingService.ModalityMachines.FindAll', {
          modalityId,
        })
      );
    } catch (error) {
      console.log(error);
    }
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
      this.imagingService.send('ImagingService.ModalityMachines.FindMany', {
        paginationDto,
      })
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await firstValueFrom(
      this.imagingService.send('ImagingService.ModalityMachines.FindOne', {
        id,
      })
    );
  }

  @Post()
  async create(@Body() createModalityMachineDto: CreateModalityMachineDto) {
    return await firstValueFrom(
      this.imagingService.send('ImagingService.ModalityMachines.Create', {
        createModalityMachineDto,
      })
    );
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateModalityMachineDto: UpdateModalityMachineDto
  ) {
    return await firstValueFrom(
      this.imagingService.send('ImagingService.ModalityMachines.Update', {
        id,
        updateModalityMachineDto,
      })
    );
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await firstValueFrom(
      this.imagingService.send('ImagingService.ModalityMachines.Delete', {
        id,
      })
    );
  }
}
