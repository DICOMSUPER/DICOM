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
import { CreateDicomInstanceDto } from '@backend/shared-domain';
import { ApiBody } from '@nestjs/swagger/dist/decorators/api-body.decorator';
import { UpdateDicomInstanceDto } from '@backend/shared-domain';
import { ApiTags } from '@nestjs/swagger/dist/decorators/api-use-tags.decorator';
import { Role } from '@backend/shared-decorators';
import { Roles } from '@backend/shared-enums';

@ApiTags('DICOM Instances')
@Controller('dicom-instances')
@UseInterceptors(RequestLoggingInterceptor, TransformInterceptor)
export class DicomInstancesController {
  constructor(
    @Inject(process.env.IMAGE_SERVICE_NAME || 'IMAGING_SERVICE')
    private readonly imagingService: ClientProxy,
    @Inject(RedisService)
    private readonly redisService: RedisService
  ) {}

  @Get()
  @Role(
    Roles.PHYSICIAN,
    Roles.IMAGING_TECHNICIAN,
    Roles.RADIOLOGIST,
    Roles.SYSTEM_ADMIN
  )
  @ApiOperation({ summary: 'Get all DICOM instances' })
  @ApiResponse({ status: 200, description: 'List of DICOM instances' })
  async findAll() {
    const pattern = `${CacheEntity.dicomInstances}.${CacheKeyPattern.all}`;
    const cachedInstances = await this.redisService.get(pattern);
    if (cachedInstances) {
      return cachedInstances;
    }
    const instances = await firstValueFrom(
      this.imagingService.send('ImagingService.DicomInstances.FindAll', {})
    );

    await this.redisService.set(pattern, instances, CACHE_TTL_SECONDS);
    return instances;
  }

  @Get('reference/:id')
  @Role(
    Roles.PHYSICIAN,
    Roles.IMAGING_TECHNICIAN,
    Roles.RADIOLOGIST,
    Roles.SYSTEM_ADMIN
  )
  @ApiOperation({ summary: 'Get DICOM instances by reference ID' })
  @ApiResponse({
    status: 200,
    description: 'List of DICOM instances for the reference ID',
  })
  @ApiParam({ name: 'id', required: true, type: String })
  @ApiQuery({ name: 'type', required: true, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'searchField', required: false, type: String })
  @ApiQuery({ name: 'sortField', required: false, type: String })
  @ApiQuery({ name: 'order', required: false, type: String })
  async findByReferenceId(
    @Param('id') id: string,
    @Query('type') type: string,
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

    const pattern = `${CacheEntity.dicomInstances}.${
      CacheKeyPattern.byReferenceId
    }/${id}?type=${type || ''}&page=${page || ''}&limit=${limit || ''}&search=${
      search || ''
    }&searchField=${searchField || ''}&sortField=${sortField || ''}&order=${
      order || ''
    }`;
    const cachedInstances = await this.redisService.get(pattern);
    if (cachedInstances) {
      return cachedInstances;
    }

    const instances = await firstValueFrom(
      this.imagingService.send(
        'ImagingService.DicomInstances.FindByReferenceId',
        {
          id,
          type,
          paginationDto,
        }
      )
    );

    await this.redisService.set(pattern, instances, CACHE_TTL_SECONDS);
    return instances;
  }

  @Get('paginated')
  @Role(
    Roles.PHYSICIAN,
    Roles.IMAGING_TECHNICIAN,
    Roles.RADIOLOGIST,
    Roles.SYSTEM_ADMIN
  )
  @ApiOperation({ summary: 'Get paginated DICOM instances' })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of DICOM instances',
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
    const pattern = `${CacheEntity.dicomInstances}.${
      CacheKeyPattern.paginated
    }?page=${page || ''}&limit=${limit || ''}&search=${
      search || ''
    }&searchField=${searchField || ''}&sortField=${sortField || ''}&order=${
      order || ''
    }`;
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

    const instances = await firstValueFrom(
      this.imagingService.send('ImagingService.DicomInstances.FindMany', {
        paginationDto,
      })
    );
    await this.redisService.set(pattern, instances, CACHE_TTL_SECONDS);
    return instances;
  }

  @Get(':id')
  @Role(
    Roles.PHYSICIAN,
    Roles.IMAGING_TECHNICIAN,
    Roles.RADIOLOGIST,
    Roles.SYSTEM_ADMIN
  )
  @ApiOperation({ summary: 'Get a DICOM instance by ID' })
  @ApiResponse({ status: 200, description: 'DICOM instance details' })
  @ApiParam({ name: 'id', required: true, type: String })
  async getOne(@Param('id') id: string) {
    const pattern = `${CacheEntity.dicomInstances}.${CacheKeyPattern.id}/${id}`;
    const cachedInstance = await this.redisService.get(pattern);
    if (cachedInstance) {
      return cachedInstance;
    }

    const instance = await firstValueFrom(
      this.imagingService.send('ImagingService.DicomInstances.FindOne', { id })
    );

    await this.redisService.set(pattern, instance, CACHE_TTL_SECONDS);
    return instance;
  }

  @Post()
  @ApiOperation({ summary: 'Create a new DICOM instance' })
  @ApiResponse({
    status: 201,
    description: 'The DICOM instance has been created.',
  })
  @ApiBody({ type: CreateDicomInstanceDto })
  async create(@Body() createDicomInstanceDto: CreateDicomInstanceDto) {
    const instance = await firstValueFrom(
      this.imagingService.send('ImagingService.DicomInstances.Create', {
        createDicomInstanceDto,
      })
    );

    const pattern = `${CacheEntity.dicomInstances}.${CacheKeyPattern.id}/${instance.id}`;
    await this.redisService.set(pattern, instance, CACHE_TTL_SECONDS);
    await this.redisService.delete(
      `${CacheEntity.dicomInstances}.${CacheKeyPattern.all}`
    );
    await this.redisService.deleteKeyStartingWith(
      `${CacheEntity.dicomInstances}.${CacheKeyPattern.paginated}`
    );
    await this.redisService.deleteKeyStartingWith(
      `${CacheEntity.dicomInstances}.${CacheKeyPattern.byReferenceId}`
    );
    return instance;
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a DICOM instance by ID' })
  @ApiResponse({
    status: 200,
    description: 'The DICOM instance has been updated.',
  })
  @ApiParam({ name: 'id', required: true, type: String })
  @ApiBody({ type: UpdateDicomInstanceDto })
  async update(
    @Param('id') id: string,
    @Body() updateDicomInstanceDto: UpdateDicomInstanceDto
  ) {
    const instance = await firstValueFrom(
      this.imagingService.send('ImagingService.DicomInstances.Update', {
        id,
        updateDicomInstanceDto,
      })
    );

    const pattern = `${CacheEntity.dicomInstances}.${CacheKeyPattern.id}/${instance.id}`;

    await this.redisService.set(pattern, instance, CACHE_TTL_SECONDS);
    await this.redisService.delete(
      `${CacheEntity.dicomInstances}.${CacheKeyPattern.all}`
    );
    await this.redisService.deleteKeyStartingWith(
      `${CacheEntity.dicomInstances}.${CacheKeyPattern.paginated}`
    );
    await this.redisService.deleteKeyStartingWith(
      `${CacheEntity.dicomInstances}.${CacheKeyPattern.byReferenceId}`
    );
    return instance;
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a DICOM instance by ID' })
  @ApiResponse({
    status: 200,
    description: 'The DICOM instance has been deleted.',
  })
  @ApiParam({ name: 'id', required: true, type: String })
  async delete(@Param('id') id: string) {
    await this.redisService.delete(
      `${CacheEntity.dicomInstances}.${CacheKeyPattern.id}/${id}`
    );
    const instance = await firstValueFrom(
      this.imagingService.send('ImagingService.DicomInstances.Delete', { id })
    );

    await this.redisService.delete(
      `${CacheEntity.dicomInstances}.${CacheKeyPattern.all}`
    );
    await this.redisService.deleteKeyStartingWith(
      `${CacheEntity.dicomInstances}.${CacheKeyPattern.paginated}`
    );
    await this.redisService.deleteKeyStartingWith(
      `${CacheEntity.dicomInstances}.${CacheKeyPattern.byReferenceId}`
    );

    return instance;
  }
}
