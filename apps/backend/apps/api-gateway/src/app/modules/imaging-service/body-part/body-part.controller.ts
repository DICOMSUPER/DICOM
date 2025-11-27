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
import { CreateBodyPartDto, UpdateBodyPartDto } from '@backend/shared-domain';
import { firstValueFrom } from 'rxjs';

import {
  RequestLoggingInterceptor,
  TransformInterceptor,
} from '@backend/shared-interceptor';

@Controller('body-part')
@UseInterceptors(RequestLoggingInterceptor, TransformInterceptor)
export class BodyPartController {
  constructor(
    @Inject(process.env.IMAGE_SERVICE_NAME || 'IMAGING_SERVICE')
    private readonly imagingService: ClientProxy
  ) { }

  @Get()
  async getBodyParts() {
    return await firstValueFrom(
      this.imagingService.send('ImagingService.BodyPart.FindAll', {})
    );
  }

  @Get('paginated')
  async findMany(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('searchField') searchField?: string,
    @Query('sortField') sortField?: string,
    @Query('order') order?: 'asc' | 'desc',
    @Query('includeInactive') includeInactive?: boolean,
    @Query('includeDeleted') includeDeleted?: boolean
  ) {
    const paginationDto = {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      search,
      searchField,
      sortField,
      order,
      includeInactive: includeInactive === true,
      includeDeleted: includeDeleted === true,
    };
    return await firstValueFrom(
      this.imagingService.send('ImagingService.BodyPart.FindMany', {
        paginationDto,
      })
    );
  }

  @Get(':id')
  async getBodyPartById(@Param('id') id: string) {
    return await firstValueFrom(
      this.imagingService.send('ImagingService.BodyPart.FindOne', {
        id,
      })
    );
  }

  @Post()
  async createBodyPart(@Body() createBodyPartDto: CreateBodyPartDto) {
    return await firstValueFrom(
      this.imagingService.send(
        'ImagingService.BodyPart.Create',
        createBodyPartDto
      )
    );
  }

  @Patch(':id')
  async updateBodyPart(
    @Param('id') id: string,
    @Body() updateBodyPartDto: UpdateBodyPartDto
  ) {
    return await firstValueFrom(
      this.imagingService.send('ImagingService.BodyPart.Update', {
        id,
        updateBodyPartDto,
      })
    );
  }

  @Delete(':id')
  async deleteBodyPart(@Param('id') id: string) {
    return await firstValueFrom(
      this.imagingService.send('ImagingService.BodyPart.Delete', {
        id,
      })
    );
  }
}
