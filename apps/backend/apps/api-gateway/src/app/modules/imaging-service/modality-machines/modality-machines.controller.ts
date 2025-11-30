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
import { Public } from '@backend/shared-decorators';

@Controller('modality-machines')
@UseInterceptors(RequestLoggingInterceptor, TransformInterceptor)
export class ModalityMachinesController {
  constructor(
    @Inject(process.env.IMAGE_SERVICE_NAME || 'IMAGING_SERVICE')
    private readonly imagingService: ClientProxy
  ) {}

  @Public()
  @Get()
  async findAll(
    @Query('modalityId') modalityId?: string,
    @Query('roomId') roomId?: string,
    @Query('status') status?: string,
    @Query('machineName') machineName?: string,
    @Query('manufacturer') manufacturer?: string,
    @Query('serialNumber') serialNumber?: string,
    @Query('model') model?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('sortBy') sortBy?: string,
    @Query('order') order?: 'asc' | 'desc'
  ) {
    try {
      return await firstValueFrom(
        this.imagingService.send('ImagingService.ModalityMachines.FindAll', {
          modalityId,
          roomId,
          status,
          machineName,
          manufacturer,
          serialNumber,
          model,
          page: page ? Number(page) : undefined,
          limit: limit ? Number(limit) : undefined,
          sortBy,
          order,
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
    @Query('sortBy') sortBy?: string,
    @Query('order') order?: 'asc' | 'desc',
    @Query('includeDeleted') includeDeleted?: boolean,
    @Query('modalityId') modalityId?: string,
    @Query('status') status?: string
  ) {
    const paginationDto = {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      search,
      searchField,
      sortField: sortField || sortBy, // Support both sortField and sortBy for compatibility
      order,
      includeDeleted: includeDeleted === true,
      modalityId,
      status,
    };
    return await firstValueFrom(
      this.imagingService.send('ImagingService.ModalityMachines.FindMany', {
        paginationDto,
      })
    );
  }

  @Get('stats')
  async getStats(@Query('roomId') roomId?: string) {
    return await firstValueFrom(
      this.imagingService.send('ImagingService.ModalityMachines.GetStats', {
        roomId,
      })
    );
  }

  @Get('room/:roomId')
  async findByRoomId(@Param('roomId') roomId: string) {
    return await firstValueFrom(
      this.imagingService.send('ImagingService.ModalityMachines.FindByRoomId', {
        roomId,
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
