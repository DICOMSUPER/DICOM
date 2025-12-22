import {
  CreateRequestProcedureDto,
  UpdateRequestProcedureDto,
} from '@backend/shared-domain';
import {
  RequestLoggingInterceptor,
  TransformInterceptor,
} from '@backend/shared-interceptor';
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
import { Public } from '@backend/shared-decorators';
import { firstValueFrom } from 'rxjs';
import { ApiTags } from '@nestjs/swagger/dist/decorators/api-use-tags.decorator';
import { ApiOperation } from '@nestjs/swagger/dist/decorators/api-operation.decorator';
import { ApiResponse } from '@nestjs/swagger/dist/decorators/api-response.decorator';
import { ApiQuery } from '@nestjs/swagger/dist/decorators/api-query.decorator';
import {
  CACHE_TTL_SECONDS,
  CacheEntity,
  CacheKeyPattern,
} from '../../../../constant/cache';
import { RedisService } from '@backend/redis';
import { ApiParam } from '@nestjs/swagger/dist/decorators/api-param.decorator';
import { cacheKeyBuilder } from '../../../../utils/cache-builder.utils';
@ApiTags('Request Procedures')
@Controller('request-procedure')
@UseInterceptors(RequestLoggingInterceptor, TransformInterceptor)
export class RequestProcedureController {
  constructor(
    @Inject(process.env.IMAGE_SERVICE_NAME || 'IMAGING_SERVICE')
    private readonly imagingService: ClientProxy,
    @Inject(RedisService)
    private readonly redisService: RedisService
  ) {}

  private async uncacheRequestProcedure(id?: string) {
    if (id) {
      await this.redisService.delete(
        cacheKeyBuilder.id(CacheEntity.requestProcedures, id)
      );
    }
    await this.redisService.deleteKeyStartingWith(
      cacheKeyBuilder.findAll(CacheEntity.requestProcedures)
    );

    await this.redisService.deleteKeyStartingWith(
      cacheKeyBuilder.paginated(CacheEntity.requestProcedures)
    );

    // Invalidate stats cache
    await this.redisService.delete(
      cacheKeyBuilder.stats(CacheEntity.requestProcedures)
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all request procedures' })
  @ApiResponse({ status: 200, description: 'List of all request procedures' })
  @ApiQuery({ name: 'bodyPartId', required: false, type: String })
  @ApiQuery({ name: 'modalityId', required: false, type: String })
  async getRequestProcedures(
    @Query('bodyPartId') bodyPartId?: string,
    @Query('modalityId') modalityId?: string
  ) {
    const pattern = cacheKeyBuilder.findAll(CacheEntity.requestProcedures, {
      bodyPartId,
      modalityId,
    });

    const cachedProcedures = await this.redisService.get(pattern);
    // if (cachedProcedures) {
    //   return cachedProcedures;
    // }

    const procedures = await firstValueFrom(
      this.imagingService.send('ImagingService.RequestProcedure.FindAll', {
        bodyPartId,
        modalityId,
      })
    );
    await this.redisService.set(pattern, procedures, CACHE_TTL_SECONDS);
    return procedures;
  }

  @Get('paginated')
  @ApiOperation({ summary: 'Get paginated request procedures' })
  @ApiResponse({
    status: 200,
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'searchField', required: false, type: String })
  @ApiQuery({ name: 'sortField', required: false, type: String })
  @ApiQuery({ name: 'order', required: false, type: String })
  async findMany(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('searchField') searchField?: string,
    @Query('sortField') sortField?: string,
    @Query('order') order?: 'asc' | 'desc'
  ) {
    const pattern = cacheKeyBuilder.paginated(CacheEntity.requestProcedures, {
      page,
      limit,
      search,
      searchField,
      sortField,
      order,
    });

    const cachedProcedures = await this.redisService.get(pattern);
    // if (cachedProcedures) {
    //   return cachedProcedures;
    // }

    const paginationDto = {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      search,
      searchField,
      sortField,
      order,
    };
    const procedures = await firstValueFrom(
      this.imagingService.send('ImagingService.RequestProcedure.FindMany', {
        paginationDto,
      })
    );
    await this.redisService.set(pattern, procedures, CACHE_TTL_SECONDS);
    return procedures;
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get request procedure statistics' })
  @ApiResponse({
    status: 200,
    description: 'Request procedure statistics',
  })
  @ApiTags('Request Procedures')
  async getRequestProcedureStats() {
    const pattern = cacheKeyBuilder.stats(CacheEntity.requestProcedures);

    const cachedStats = await this.redisService.get(pattern);
    // if (cachedStats) {
    //   return cachedStats;
    // }

    const stats = await firstValueFrom(
      this.imagingService.send('ImagingService.RequestProcedure.GetStats', {})
    );

    await this.redisService.set(pattern, stats, CACHE_TTL_SECONDS);

    return { data: stats };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a request procedure by ID' })
  @ApiResponse({
    status: 200,
  })
  @ApiParam({ name: 'id', required: true, type: String })
  async getRequestProcedureById(@Param('id') id: string) {
    const pattern = cacheKeyBuilder.id(CacheEntity.requestProcedures, id);
    const cachedProcedure = await this.redisService.get(pattern);
    // if (cachedProcedure) {
    //   return cachedProcedure;
    // }
    const procedure = await firstValueFrom(
      this.imagingService.send('ImagingService.RequestProcedure.FindOne', {
        id,
      })
    );
    await this.redisService.set(pattern, procedure, CACHE_TTL_SECONDS);
    return procedure;
  }

  @Post()
  @ApiOperation({ summary: 'Create a new request procedure' })
  @ApiResponse({
    status: 201,
  })
  @ApiTags('Request Procedures')
  @Public()
  async createRequestProcedure(
    @Body() createRequestProcedureDto: CreateRequestProcedureDto
  ) {
    console.log(
      'create request procedure controller',
      createRequestProcedureDto
    );

    const procedure = await firstValueFrom(
      this.imagingService.send(
        'ImagingService.RequestProcedure.Create',
        createRequestProcedureDto
      )
    );

    await this.uncacheRequestProcedure(procedure.id);

    const pattern = cacheKeyBuilder.id(
      CacheEntity.requestProcedures,
      procedure.id
    );
    await this.redisService.set(pattern, procedure, CACHE_TTL_SECONDS);

    return procedure;
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a request procedure by ID' })
  @ApiResponse({
    status: 200,
  })
  @ApiParam({ name: 'id', required: true, type: String })
  @ApiTags('Request Procedures')
  async updateRequestProcedure(
    @Param('id') id: string,
    @Body() updateRequestProcedureDto: UpdateRequestProcedureDto
  ) {
    const procedure = await firstValueFrom(
      this.imagingService.send('ImagingService.RequestProcedure.Update', {
        id,
        updateRequestProcedureDto,
      })
    );

    await this.uncacheRequestProcedure(id);

    const pattern = cacheKeyBuilder.id(
      CacheEntity.requestProcedures,
      procedure.id
    );

    await this.redisService.set(pattern, procedure, CACHE_TTL_SECONDS);

    return procedure;
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a request procedure by ID' })
  @ApiResponse({
    status: 200,
  })
  @ApiParam({ name: 'id', required: true, type: String })
  @ApiTags('Request Procedures')
  async deleteRequestProcedure(@Param('id') id: string) {
    const procedure = await firstValueFrom(
      this.imagingService.send('ImagingService.RequestProcedure.Delete', {
        id,
      })
    );

    await this.uncacheRequestProcedure(id);

    return procedure;
  }
}
