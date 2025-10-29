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
import { CreateBodyPartDto, UpdateBodyPartDto } from '@backend/shared-domain';

@Controller('body-parts')
@UseInterceptors(RequestLoggingInterceptor, TransformInterceptor)
export class BodyPartsController {
  constructor(
    @Inject(process.env.IMAGE_SERVICE_NAME || 'IMAGING_SERVICE')
    private readonly imagingService: ClientProxy
  ) {}

  @Get()
  async findAll() {
    return await firstValueFrom(
      this.imagingService.send('ImagingService.BodyParts.FindAll', {})
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
      this.imagingService.send('ImagingService.BodyParts.FindMany', {
        paginationDto,
      })
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await firstValueFrom(
      this.imagingService.send('ImagingService.BodyParts.FindOne', {
        id,
      })
    );
  }

  @Post()
  async create(@Body() createBodyPartDto: CreateBodyPartDto) {
    return await firstValueFrom(
      this.imagingService.send('ImagingService.BodyParts.Create', {
        createBodyPartDto,
      })
    );
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateBodyPartDto: UpdateBodyPartDto
  ) {
    return await firstValueFrom(
      this.imagingService.send('ImagingService.BodyParts.Update', {
        id,
        updateBodyPartDto,
      })
    );
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await firstValueFrom(
      this.imagingService.send('ImagingService.BodyParts.Delete', {
        id,
      })
    );
  }
}
