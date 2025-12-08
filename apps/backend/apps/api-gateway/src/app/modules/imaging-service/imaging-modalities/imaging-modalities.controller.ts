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
import { RedisService } from '@backend/redis';
import { ApiOperation } from '@nestjs/swagger/dist/decorators/api-operation.decorator';
import { ApiTags } from '@nestjs/swagger/dist/decorators/api-use-tags.decorator';
import { ApiResponse } from '@nestjs/swagger/dist/decorators/api-response.decorator';
import { ApiQuery } from '@nestjs/swagger/dist/decorators/api-query.decorator';
import {
  CACHE_TTL_SECONDS,
  CacheEntity,
  CacheKeyPattern,
} from '../../../../constant/cache';
import { ApiParam } from '@nestjs/swagger/dist/decorators/api-param.decorator';
import {
  CreateImagingModalityDto,
  UpdateImagingModalityDto,
} from '@backend/shared-domain';
import { ApiBody } from '@nestjs/swagger/dist/decorators/api-body.decorator';
import { cacheKeyBuilder } from '../../../../utils/cache-builder.utils';
@ApiTags('Imaging Modalities')
@Controller('imaging-modalities')
@UseInterceptors(RequestLoggingInterceptor, TransformInterceptor)
export class ImagingModalitiesController {
  constructor(
    @Inject(process.env.IMAGE_SERVICE_NAME || 'IMAGING_SERVICE')
    private readonly imagingService: ClientProxy,
    @Inject(RedisService)
    private readonly redisService: RedisService
  ) {}

  private async uncacheImagingModalities(id?: string) {
    if (id) {
      await this.redisService.delete(
        cacheKeyBuilder.id(CacheEntity.imagingModalities, id)
      );
    }

    await this.redisService.deleteKeyStartingWith(
      cacheKeyBuilder.findAll(CacheEntity.imagingModalities)
    );
    await this.redisService.deleteKeyStartingWith(
      cacheKeyBuilder.paginated(CacheEntity.imagingModalities)
    );
    await this.redisService.delete(
      cacheKeyBuilder.stats(CacheEntity.imagingModalities)
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all imaging modalities' })
  @ApiResponse({ status: 200, description: 'List of imaging modalities' })
  async getImagingModalities() {
    const pattern = cacheKeyBuilder.findAll(CacheEntity.imagingModalities);
    const cachedModalities = await this.redisService.get(pattern);
    // if (cachedModalities) {
    //   return cachedModalities;
    // }
    const modalities = await firstValueFrom(
      this.imagingService.send('ImagingService.ImagingModalities.FindAll', {})
    );
    await this.redisService.set(pattern, modalities, CACHE_TTL_SECONDS);
    return modalities;
  }

  @Get('paginated')
  @ApiOperation({ summary: 'Get paginated imaging modalities' })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of imaging modalities',
  })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'searchField', required: false })
  @ApiQuery({ name: 'sortField', required: false })
  @ApiQuery({ name: 'order', required: false, enum: ['asc', 'desc'] })
  @ApiQuery({ name: 'includeInactive', required: false })
  @ApiQuery({ name: 'includeDeleted', required: false })
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
    const pattern = cacheKeyBuilder.paginated(CacheEntity.imagingModalities, {
      page,
      limit,
      search,
      searchField,
      sortField,
      order,
      includeInactive,
      includeDeleted,
    });

    const cachedModalities = await this.redisService.get(pattern);
    // if (cachedModalities) {
    //   return cachedModalities;
    // }

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
    const modalities = await firstValueFrom(
      this.imagingService.send('ImagingService.ImagingModalities.FindMany', {
        paginationDto,
      })
    );
    await this.redisService.set(pattern, modalities, CACHE_TTL_SECONDS);
    return modalities;
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get imaging modalities statistics' })
  @ApiResponse({ status: 200, description: 'Imaging modalities statistics' })
  async getStats() {
    const pattern = cacheKeyBuilder.stats(CacheEntity.imagingModalities);
    const cachedStats = await this.redisService.get(pattern);
    // if (cachedStats) {
    //   return cachedStats;
    // }
    const stats = await firstValueFrom(
      this.imagingService.send('ImagingService.ImagingModalities.GetStats', {})
    );
    await this.redisService.set(pattern, stats, CACHE_TTL_SECONDS);
    return stats;
  }

  // Test hard delete for testing e2e
  // @Get(':id/hard-delete')
  // async hardDeleteImagingModality(@Param('id') id: string) {
  //   return await firstValueFrom(
  //     this.imagingService.send('ImagingService.ImagingModalities.HardDelete', {
  //       id,
  //     })
  //   );
  // }

  @Get(':id')
  @ApiOperation({ summary: 'Get an imaging modality by ID' })
  @ApiResponse({ status: 200, description: 'Imaging modality details' })
  @ApiParam({ name: 'id', required: true, type: String })
  async getImagingModalityById(@Param('id') id: string) {
    const pattern = cacheKeyBuilder.id(CacheEntity.imagingModalities, id);
    const cachedModality = await this.redisService.get(pattern);
    // if (cachedModality) {
    //   return cachedModality;
    // }
    const modality = await firstValueFrom(
      this.imagingService.send('ImagingService.ImagingModalities.FindOne', {
        id,
      })
    );
    await this.redisService.set(pattern, modality, CACHE_TTL_SECONDS);
    return modality;
  }

  @Post()
  @ApiOperation({ summary: 'Create a new imaging modality' })
  @ApiResponse({
    status: 201,
    description: 'The imaging modality has been created.',
  })
  @ApiBody({ type: CreateImagingModalityDto })
  async createImagingModality(
    @Body() createImagingModalityDto: CreateImagingModalityDto
  ) {
    const modality = await firstValueFrom(
      this.imagingService.send(
        'ImagingService.ImagingModalities.Create',
        createImagingModalityDto
      )
    );

    const pattern = cacheKeyBuilder.id(
      CacheEntity.imagingModalities,
      modality.id
    );

    await this.redisService.set(pattern, modality, CACHE_TTL_SECONDS);

    await this.uncacheImagingModalities();

    return modality;
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an imaging modality by ID' })
  @ApiResponse({
    status: 200,
    description: 'The imaging modality has been updated.',
  })
  @ApiBody({ type: UpdateImagingModalityDto })
  async updateImagingModality(
    @Param('id') id: string,
    @Body() updateImagingModalityDto: UpdateImagingModalityDto
  ) {
    const pattern = cacheKeyBuilder.id(CacheEntity.imagingModalities, id);

    const modality = await firstValueFrom(
      this.imagingService.send('ImagingService.ImagingModalities.Update', {
        id,
        updateImagingModalityDto,
      })
    );

    await this.uncacheImagingModalities(id);

    await this.redisService.set(pattern, modality, CACHE_TTL_SECONDS);

    return modality;
  }

  @Delete(':id')
  async deleteImagingModality(@Param('id') id: string) {
    await this.uncacheImagingModalities(id);

    return await firstValueFrom(
      this.imagingService.send('ImagingService.ImagingModalities.Delete', {
        id,
      })
    );
  }
}
