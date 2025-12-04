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
import { ApiResponse } from '@nestjs/swagger/dist/decorators/api-response.decorator';
import { ApiOperation } from '@nestjs/swagger/dist/decorators/api-operation.decorator';
import {
  CACHE_TTL_SECONDS,
  CacheEntity,
  CacheKeyPattern,
} from '../../../../constant/cache';
import { ApiParam } from '@nestjs/swagger/dist/decorators/api-param.decorator';
import { ApiQuery } from '@nestjs/swagger/dist/decorators/api-query.decorator';
import { ApiTags } from '@nestjs/swagger/dist/decorators/api-use-tags.decorator';
import {
  CreateDicomSeriesDto,
  UpdateDicomSeriesDto,
} from '@backend/shared-domain';
import { ApiBody } from '@nestjs/swagger/dist/decorators/api-body.decorator';

@ApiTags('DICOM Series')
@Controller('dicom-series')
@UseInterceptors(RequestLoggingInterceptor, TransformInterceptor)
export class DicomSeriesController {
  constructor(
    @Inject(process.env.IMAGE_SERVICE_NAME || 'IMAGING_SERVICE')
    private readonly imagingService: ClientProxy,
    @Inject(RedisService)
    private readonly redisService: RedisService
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all DICOM series' })
  @ApiResponse({ status: 200, description: 'List of DICOM series' })
  async getAllDicomSeries() {
    const pattern = `${CacheEntity.dicomSeries}.${CacheKeyPattern.all}`;
    const cachedSeries = await this.redisService.get(pattern);
    if (cachedSeries) {
      return cachedSeries;
    }

    const series = await firstValueFrom(
      this.imagingService.send('ImagingService.DicomSeries.FindAll', {})
    );

    await this.redisService.set(pattern, series, CACHE_TTL_SECONDS);
    return series;
  }

  @Get('reference/:id')
  @ApiOperation({ summary: 'Get DICOM series by reference ID' })
  @ApiResponse({
    status: 200,
    description: 'List of DICOM series for the reference ID',
  })
  @ApiParam({ name: 'id', required: true, type: String })
  @ApiQuery({ name: 'type', required: true, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'searchField', required: false, type: String })
  @ApiQuery({ name: 'sortField', required: false, type: String })
  @ApiQuery({ name: 'order', required: false, type: String })
  async getDicomSeriesByReference(
    @Param('id') id: string,
    @Query('type') type: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('searchField') searchField?: string,
    @Query('sortField') sortField?: string,
    @Query('order') order?: 'asc' | 'desc'
  ) {
    const pattern = `${CacheEntity.dicomSeries}.${
      CacheKeyPattern.byReferenceId
    }/${id}?type=${type || ''}&page=${page || ''}&limit=${limit || ''}&search=${
      search || ''
    }&searchField=${searchField || ''}&sortField=${sortField || ''}&order=${
      order || ''
    }`;
    const cachedSeries = await this.redisService.get(pattern);
    if (cachedSeries) {
      return cachedSeries;
    }

    const paginationDto = {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      search,
      searchField,
      sortField,
      order,
    };
    const series = await firstValueFrom(
      this.imagingService.send('ImagingService.DicomSeries.FindByReferenceId', {
        id,
        type,
        paginationDto,
      })
    );
    await this.redisService.set(pattern, series, 300);
    return series;
  }

  @Get('paginated')
  @ApiOperation({ summary: 'Get paginated DICOM series' })
  @ApiResponse({ status: 200, description: 'Paginated list of DICOM series' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'searchField', required: false, type: String })
  @ApiQuery({ name: 'sortField', required: false, type: String })
  @ApiQuery({ name: 'order', required: false, enum: ['asc', 'desc'] })
  async getManyDicomSeries(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('searchField') searchField?: string,
    @Query('sortField') sortField?: string,
    @Query('order') order?: 'asc' | 'desc'
  ) {
    const pattern = `${CacheEntity.dicomSeries}.${CacheKeyPattern.paginated}?page=${page}&limit=${limit}&search=${search}&searchField=${searchField}&sortField=${sortField}&order=${order}`;

    const cachedPaginated = await this.redisService.get(pattern);
    if (cachedPaginated) {
      return cachedPaginated;
    }
    const paginationDto = {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      search,
      searchField,
      sortField,
      order,
    };

    const series = await firstValueFrom(
      this.imagingService.send('ImagingService.DicomSeries.FindMany', {
        paginationDto,
      })
    );
    await this.redisService.set(pattern, series, 300);
    return series;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a DICOM series by ID' })
  @ApiResponse({ status: 200, description: 'DICOM series details' })
  @ApiParam({ name: 'id', required: true, type: String })
  async getDicomSeries(@Param('id') id: string) {
    const pattern = `${CacheEntity.dicomSeries}.${CacheKeyPattern.id}/${id}`;
    const cachedSeries = await this.redisService.get(pattern);
    if (cachedSeries) {
      return cachedSeries;
    }
    const series = await firstValueFrom(
      this.imagingService.send('ImagingService.DicomSeries.FindOne', { id })
    );
    await this.redisService.set(pattern, series, 300);
    return series;
  }

  @Post()
  @ApiOperation({ summary: 'Create a new DICOM series' })
  @ApiResponse({
    status: 201,
    description: 'The DICOM series has been created.',
  })
  @ApiBody({ type: CreateDicomSeriesDto })
  async createDicomSeries(@Body() createDicomSeriesDto: CreateDicomSeriesDto) {
    const series = await firstValueFrom(
      this.imagingService.send('ImagingService.DicomSeries.Create', {
        createDicomSeriesDto,
      })
    );

    const pattern = `${CacheEntity.dicomSeries}.${CacheKeyPattern.id}/${series.id}`;
    await this.redisService.set(pattern, series, 300);
    await this.redisService.delete(
      `${CacheEntity.dicomSeries}.${CacheKeyPattern.all}`
    );
    await this.redisService.deleteKeyStartingWith(
      `${CacheEntity.dicomSeries}.${CacheKeyPattern.paginated}`
    );
    await this.redisService.deleteKeyStartingWith(
      `${CacheEntity.dicomSeries}.${CacheKeyPattern.byReferenceId}`
    );
    return series;
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a DICOM series by ID' })
  @ApiResponse({
    status: 200,
    description: 'The DICOM series has been updated.',
  })
  @ApiParam({ name: 'id', required: true, type: String })
  @ApiBody({ type: UpdateDicomSeriesDto })
  async updateDicomSeries(
    @Param('id') id: string,
    @Body() updateDicomSeriesDto: UpdateDicomSeriesDto
  ) {
    const pattern = `${CacheEntity.dicomSeries}.${CacheKeyPattern.id}/${id}`;
    const series = await firstValueFrom(
      this.imagingService.send('ImagingService.DicomSeries.Update', {
        id,
        updateDicomSeriesDto,
      })
    );
    await this.redisService.set(pattern, series, 300);
    await this.redisService.delete(
      `${CacheEntity.dicomSeries}.${CacheKeyPattern.all}`
    );
    await this.redisService.deleteKeyStartingWith(
      `${CacheEntity.dicomSeries}.${CacheKeyPattern.paginated}`
    );
    await this.redisService.deleteKeyStartingWith(
      `${CacheEntity.dicomSeries}.${CacheKeyPattern.byReferenceId}`
    );
    return series;
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a DICOM series by ID' })
  @ApiResponse({
    status: 200,
    description: 'The DICOM series has been deleted.',
  })
  @ApiParam({ name: 'id', required: true, type: String })
  async deleteDicomSeries(@Param('id') id: string) {
    const result = await firstValueFrom(
      this.imagingService.send('ImagingService.DicomSeries.Delete', {
        id,
      })
    );

    const pattern = `${CacheEntity.dicomSeries}.${CacheKeyPattern.id}/${id}`;
    await this.redisService.delete(pattern);
    await this.redisService.delete(
      `${CacheEntity.dicomSeries}.${CacheKeyPattern.all}`
    );
    await this.redisService.deleteKeyStartingWith(
      `${CacheEntity.dicomSeries}.${CacheKeyPattern.paginated}`
    );
    await this.redisService.deleteKeyStartingWith(
      `${CacheEntity.dicomSeries}.${CacheKeyPattern.byReferenceId}`
    );
    return result;
  }
}
