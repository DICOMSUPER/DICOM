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
import { RedisService } from '@backend/redis';
import {
  CACHE_TTL_SECONDS,
  CacheEntity,
  CacheKeyPattern,
} from '../../../../constant/cache';
import { ApiTags } from '@nestjs/swagger/dist/decorators/api-use-tags.decorator';
import { ApiOperation } from '@nestjs/swagger/dist/decorators/api-operation.decorator';
import { ApiResponse } from '@nestjs/swagger/dist/decorators/api-response.decorator';
import { ApiBody } from '@nestjs/swagger/dist/decorators/api-body.decorator';
import { ApiParam } from '@nestjs/swagger/dist/decorators/api-param.decorator';
import { ApiQuery } from '@nestjs/swagger/dist/decorators/api-query.decorator';
import { cacheKeyBuilder } from '../../../../utils/cache-builder.utils';

@ApiTags('Image Segmentation Layers')
@Controller('image-segmentation-layers')
@UseInterceptors(RequestLoggingInterceptor, TransformInterceptor)
export class ImageSegmentationLayersController {
  constructor(
    @Inject(process.env.IMAGE_SERVICE_NAME || 'IMAGING_SERVICE')
    private readonly imagingService: ClientProxy,
    @Inject(process.env.USER_SERVICE_NAME || 'USER_SERVICE')
    private readonly userService: ClientProxy,
    @Inject(RedisService)
    private readonly redisService: RedisService
  ) {}

  private async uncacheImageSegmentationLayer(id?: string) {
    if (id) {
      await this.redisService.delete(
        cacheKeyBuilder.id(CacheEntity.imageSegmentationLayers, id)
      );
    }

    await this.redisService.deleteKeyStartingWith(
      cacheKeyBuilder.bySeriesId(CacheEntity.imageSegmentationLayers)
    );
    await this.redisService.deleteKeyStartingWith(
      cacheKeyBuilder.findAll(CacheEntity.imageSegmentationLayers)
    );
    await this.redisService.deleteKeyStartingWith(
      cacheKeyBuilder.paginated(CacheEntity.imageSegmentationLayers)
    );
  }

  @Post()
  @ApiOperation({ summary: 'Create a new image segmentation layer' })
  @ApiResponse({
    status: 201,
    description: 'The image segmentation layer has been created.',
  })
  @ApiBody({ type: CreateImageSegmentationLayerDto })
  async create(
    @Body() createImageSegmentationLayerDto: CreateImageSegmentationLayerDto,
    @Req() req: IAuthenticatedRequest
  ) {
    const segmentation = await firstValueFrom(
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

    const pattern = cacheKeyBuilder.id(
      CacheEntity.imageSegmentationLayers,
      segmentation.id
    );
    await this.uncacheImageSegmentationLayer();

    await this.redisService.set(pattern, segmentation, CACHE_TTL_SECONDS);

    return segmentation;
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an existing image segmentation layer' })
  @ApiParam({ name: 'id', required: true, type: String })
  @ApiResponse({
    status: 200,
    description: 'The image segmentation layer has been updated.',
  })
  @ApiBody({ type: UpdateImageSegmentationLayerDto })
  async update(
    @Param('id') id: string,
    @Body() updateImageSegmentationLayerDto: UpdateImageSegmentationLayerDto
  ) {
    const segmentation = await firstValueFrom(
      this.imagingService.send(
        'ImagingService.ImageSegmentationLayers.Update',
        { id, updateImageSegmentationLayerDto }
      )
    );

    const pattern = cacheKeyBuilder.id(CacheEntity.imageSegmentationLayers, id);

    await this.uncacheImageSegmentationLayer(id);

    await this.redisService.set(pattern, segmentation, CACHE_TTL_SECONDS);
    return segmentation;
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an image segmentation layer' })
  @ApiParam({ name: 'id', required: true, type: String })
  @ApiResponse({
    status: 200,
    description: 'The image segmentation layer has been deleted.',
  })
  async delete(@Param('id') id: string) {
    await this.uncacheImageSegmentationLayer(id);

    return await firstValueFrom(
      this.imagingService.send(
        'ImagingService.ImageSegmentationLayers.Delete',
        { id }
      )
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all image segmentation layers' })
  @ApiResponse({
    status: 200,
    description: 'List of image segmentation layers',
  })
  @ApiQuery({ name: 'instanceId', required: false, type: String })
  async findAll(@Query('instanceId') instanceId?: string) {
    const pattern = cacheKeyBuilder.findAll(
      CacheEntity.imageSegmentationLayers,
      { instanceId }
    );
    const cachedSegmentations = await this.redisService.get(pattern);

    if (cachedSegmentations) {
      return cachedSegmentations;
    }

    const segmentations = await firstValueFrom(
      this.imagingService.send(
        'ImagingService.ImageSegmentationLayers.FindAll',
        { instanceId }
      )
    );

    await this.redisService.set(pattern, segmentations, CACHE_TTL_SECONDS);
    return segmentations;
  }

  @Get('paginated')
  @ApiOperation({ summary: 'Get paginated image segmentation layers' })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of image segmentation layers',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'searchField', required: false, type: String })
  @ApiQuery({ name: 'sortField', required: false, type: String })
  @ApiQuery({ name: 'order', required: false, type: String })
  async findAllPaginated(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('searchField') searchField?: string,
    @Query('sortField') sortField?: string,
    @Query('order') order?: 'asc' | 'desc'
  ) {
    const pattern = cacheKeyBuilder.paginated(
      CacheEntity.imageSegmentationLayers,
      {
        page,
        limit,
        search,
        searchField,
        sortField,
        order,
      }
    );

    const cachedPaginated = await this.redisService.get(pattern);
    if (cachedPaginated) {
      return cachedPaginated;
    }

    const paginationDto = {
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      search,
      searchField,
      sortField,
      order,
    };
    const segmentations = await firstValueFrom(
      this.imagingService.send(
        'ImagingService.ImageSegmentationLayers.FindMany',
        { paginationDto }
      )
    );

    await this.redisService.set(pattern, segmentations, CACHE_TTL_SECONDS);
    return segmentations;
  }

  @Get('series/:seriesId')
  @ApiOperation({ summary: 'Get image segmentation layers by series ID' })
  @ApiParam({ name: 'seriesId', required: true, type: String })
  @ApiResponse({
    status: 200,
    description: 'List of image segmentation layers for the series',
  })
  async findBySeriesId(@Param('seriesId') seriesId: string) {
    const pattern = cacheKeyBuilder.bySeriesId(
      CacheEntity.imageSegmentationLayers,
      seriesId
    );
    const cachedSegmentations = await this.redisService.get(pattern);
    if (cachedSegmentations) {
      return cachedSegmentations;
    }

    const segmentations = await firstValueFrom(
      this.imagingService.send(
        'ImagingService.ImageSegmentationLayers.FindBySeriesId',
        { seriesId }
      )
    );

    await this.redisService.set(pattern, segmentations, CACHE_TTL_SECONDS);
    return segmentations;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an image segmentation layer by ID' })
  @ApiResponse({
    status: 200,
    description: 'The image segmentation layer',
  })
  @ApiResponse({
    status: 404,
    description: 'Image Segmentation Layer not found',
  })
  @ApiParam({ name: 'id', required: true, type: String })
  async findOne(@Param('id') id: string) {
    const pattern = cacheKeyBuilder.id(CacheEntity.imageSegmentationLayers, id);

    const cachedSegmentation = await this.redisService.get(pattern);
    if (cachedSegmentation) {
      return cachedSegmentation;
    }

    const segmentation = await firstValueFrom(
      this.imagingService.send(
        'ImagingService.ImageSegmentationLayers.FindOne',
        { id }
      )
    );

    if (!segmentation) {
      throw new NotFoundException('Image Segmentation Layer not found');
    }

    await this.redisService.set(pattern, segmentation, CACHE_TTL_SECONDS);

    return segmentation;
  }
}
