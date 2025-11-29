import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseInterceptors,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  RequestLoggingInterceptor,
  TransformInterceptor,
} from '@backend/shared-interceptor';
import {
  CreateImageSegmentationLayerDto,
  UpdateImageSegmentationLayerDto,
} from '@backend/shared-domain';
import { firstValueFrom, NotFoundError } from 'rxjs';
import type { IAuthenticatedRequest } from '@backend/shared-interfaces';

@Controller('image-segmentation-layers')
@UseInterceptors(RequestLoggingInterceptor, TransformInterceptor)
export class ImageSegmentationLayersController {
  constructor(
    @Inject(process.env.IMAGE_SERVICE_NAME || 'IMAGING_SERVICE')
    private readonly imagingService: ClientProxy,
    @Inject(process.env.USER_SERVICE_NAME || 'USER_SERVICE')
    private readonly userService: ClientProxy
  ) {}
  @Post()
  async create(
    @Body() createImageSegmentationLayerDto: CreateImageSegmentationLayerDto,
    @Req() req: IAuthenticatedRequest
  ) {
    return await firstValueFrom(
      this.imagingService.send(
        'ImagingService.ImageSegmentationLayers.Create',
        {
          createImageSegmentationLayerDto: {
            ...createImageSegmentationLayerDto,
            segmentatorId: req.userInfo.userId,
          },
        }
      )
    );
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateImageSegmentationLayerDto: UpdateImageSegmentationLayerDto
  ) {
    return await firstValueFrom(
      this.imagingService.send(
        'ImagingService.ImageSegmentationLayers.Update',
        { id, updateImageSegmentationLayerDto }
      )
    );
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return await firstValueFrom(
      this.imagingService.send(
        'ImagingService.ImageSegmentationLayers.Delete',
        { id }
      )
    );
  }

  @Get()
  async findAll(@Query('instanceId') instanceId?: string) {
    return await firstValueFrom(
      this.imagingService.send(
        'ImagingService.ImageSegmentationLayers.FindAll',
        { instanceId }
      )
    );
  }

  @Get('paginated')
  async findAllPaginated(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('searchField') searchField?: string,
    @Query('sortField') sortField?: string,
    @Query('order') order?: 'asc' | 'desc'
  ) {
    const paginationDto = {
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      search,
      searchField,
      sortField,
      order,
    };
    return await firstValueFrom(
      this.imagingService.send(
        'ImagingService.ImageSegmentationLayers.FindMany',
        { paginationDto }
      )
    );
  }

  @Get('series/:seriesId')
  async findBySeriesId(@Param('seriesId') seriesId: string) {
    return await firstValueFrom(
      this.imagingService.send(
        'ImagingService.ImageSegmentationLayers.FindBySeriesId',
        { seriesId }
      )
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const segmentation = await firstValueFrom(
      this.imagingService.send(
        'ImagingService.ImageSegmentationLayers.FindOne',
        { id }
      )
    );

    if (!segmentation) {
      throw new NotFoundException('Image Segmentation Layer not found');
    }

    return segmentation;
  }
}
