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
import { RedisService } from '@backend/redis';
import {
  RequestLoggingInterceptor,
  TransformInterceptor,
} from '@backend/shared-interceptor';
import {
  CACHE_TTL_SECONDS,
  CacheEntity,
  CacheKeyPattern,
} from '../../../../constant/cache';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { cacheKeyBuilder } from '../../../../utils/cache-builder.utils';

@ApiTags('Body Parts')
@Controller('body-part')
@UseInterceptors(RequestLoggingInterceptor, TransformInterceptor)
export class BodyPartController {
  constructor(
    @Inject(process.env.IMAGE_SERVICE_NAME || 'IMAGING_SERVICE')
    private readonly imagingService: ClientProxy,
    @Inject(RedisService)
    private readonly redisService: RedisService
  ) {}

  private async uncacheBodyPart(id?: string) {
    // 1. Delete single item cache
    if (id) {
      await this.redisService.delete(
        cacheKeyBuilder.id(CacheEntity.bodyParts, id)
      );
    }

    // 2. Delete "all" cache
    await this.redisService.delete(
      cacheKeyBuilder.findAll(CacheEntity.bodyParts, {})
    );

    // 3. Delete all paginated caches
    await this.redisService.deleteKeyStartingWith(
      cacheKeyBuilder.paginated(CacheEntity.bodyParts, {})
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all body parts' })
  @ApiResponse({ status: 200, description: 'List of body parts' })
  async getBodyParts() {
    const pattern = cacheKeyBuilder.findAll(CacheEntity.bodyParts, {});

    const cachedParts = await this.redisService.get(pattern);
    if (cachedParts) {
      return cachedParts;
    }

    const parts = await firstValueFrom(
      this.imagingService.send('ImagingService.BodyPart.FindAll', {})
    );
    await this.redisService.set(pattern, parts, CACHE_TTL_SECONDS);

    return parts;
  }

  @Get('paginated')
  @ApiOperation({ summary: 'Get paginated body parts' })
  @ApiResponse({ status: 200, description: 'Paginated list of body parts' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'searchField', required: false, type: String })
  @ApiQuery({ name: 'sortField', required: false, type: String })
  @ApiQuery({ name: 'order', required: false, enum: ['asc', 'desc'] })
  @ApiQuery({ name: 'sortFields', required: false, type: [String] })
  @ApiQuery({ name: 'sortOrders', required: false, type: [String] })
  @ApiQuery({ name: 'sortFieldsString', required: false, type: String })
  @ApiQuery({ name: 'sortOrdersString', required: false, type: String })
  @ApiQuery({ name: 'includeInactive', required: false, type: Boolean })
  @ApiQuery({ name: 'includeDeleted', required: false, type: Boolean })
  async findMany(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('searchField') searchField?: string,
    @Query('sortField') sortField?: string,
    @Query('order') order?: 'asc' | 'desc',
    @Query('sortFields') sortFields?: string | string[],
    @Query('sortOrders') sortOrders?: string | string[],
    @Query('sortFieldsString') sortFieldsString?: string,
    @Query('sortOrdersString') sortOrdersString?: string,
    @Query('includeInactive') includeInactive?: boolean,
    @Query('includeDeleted') includeDeleted?: boolean
  ) {
    const pattern = cacheKeyBuilder.paginated(CacheEntity.bodyParts, {
      page,
      limit,
      search,
      searchField,
      sortField,
      order,
      sortFields,
      sortOrders,
      sortFieldsString,
      sortOrdersString,
      includeInactive,
      includeDeleted,
    });

    const cachedPaginated = await this.redisService.get(pattern);

    if (cachedPaginated) {
      return cachedPaginated;
    }
    // Handle array format (from query string, arrays come as comma-separated or repeated params)
    const sortFieldsArray = Array.isArray(sortFields)
      ? sortFields
      : typeof sortFields === 'string'
      ? sortFields
          .split(',')
          .map((f) => f.trim())
          .filter((f) => f)
      : undefined;

    const sortOrdersArray = Array.isArray(sortOrders)
      ? sortOrders
      : typeof sortOrders === 'string'
      ? sortOrders
          .split(',')
          .map((o) => o.trim())
          .filter((o) => o)
      : undefined;

    const paginationDto = {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      search,
      searchField,
      // Single field (backward compatibility)
      sortField,
      order,
      // Multiple fields (n fields)
      sortFields: sortFieldsArray,
      sortOrders: sortOrdersArray,
      sortFieldsString,
      sortOrdersString,
      includeInactive: includeInactive === true,
      includeDeleted: includeDeleted === true,
    };
    const parts = await firstValueFrom(
      this.imagingService.send('ImagingService.BodyPart.FindMany', {
        paginationDto,
      })
    );

    await this.redisService.set(pattern, parts, CACHE_TTL_SECONDS);

    return parts;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a body part by ID' })
  @ApiResponse({ status: 200, description: 'Body part details' })
  @ApiParam({ name: 'id', required: true, type: String })
  async getBodyPartById(@Param('id') id: string) {
    const pattern = cacheKeyBuilder.id(CacheEntity.bodyParts, id);
    const cachedPart = await this.redisService.get(pattern);
    if (cachedPart) {
      return cachedPart;
    }

    const part = await firstValueFrom(
      this.imagingService.send('ImagingService.BodyPart.FindOne', {
        id,
      })
    );
    await this.redisService.set(pattern, part, CACHE_TTL_SECONDS);
    return part;
  }

  @Post()
  @ApiOperation({ summary: 'Create a new body part' })
  @ApiResponse({ status: 201, description: 'The body part has been created.' })
  @ApiBody({ type: CreateBodyPartDto })
  async createBodyPart(@Body() createBodyPartDto: CreateBodyPartDto) {
    const part = await firstValueFrom(
      this.imagingService.send(
        'ImagingService.BodyPart.Create',
        createBodyPartDto
      )
    );

    await this.uncacheBodyPart();

    const pattern = cacheKeyBuilder.id(CacheEntity.bodyParts, part.id);

    await this.redisService.set(pattern, part, CACHE_TTL_SECONDS);

    return part;
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a body part by ID' })
  @ApiResponse({ status: 200, description: 'The body part has been updated.' })
  @ApiParam({ name: 'id', required: true, type: String })
  @ApiBody({ type: UpdateBodyPartDto })
  async updateBodyPart(
    @Param('id') id: string,
    @Body() updateBodyPartDto: UpdateBodyPartDto
  ) {
    const pattern = cacheKeyBuilder.id(CacheEntity.bodyParts, id);

    const parts = await firstValueFrom(
      this.imagingService.send('ImagingService.BodyPart.Update', {
        id,
        updateBodyPartDto,
      })
    );

    await this.uncacheBodyPart();

    await this.redisService.set(pattern, parts, CACHE_TTL_SECONDS);

    return parts;
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a body part by ID' })
  @ApiResponse({ status: 200, description: 'The body part has been deleted.' })
  @ApiParam({ name: 'id', required: true, type: String })
  async deleteBodyPart(@Param('id') id: string) {
    // const pattern = `${CacheEntity.bodyParts}.${CacheKeyPattern.id}/${id}`;

    const parts = await firstValueFrom(
      this.imagingService.send('ImagingService.BodyPart.Delete', {
        id,
      })
    );

    await this.uncacheBodyPart(id);

    return parts;
  }
}
