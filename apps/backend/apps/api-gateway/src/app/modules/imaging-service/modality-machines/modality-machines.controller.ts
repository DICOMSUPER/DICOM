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
import {
  CACHE_TTL_SECONDS,
  CacheEntity,
  CacheKeyPattern,
} from '../../../../constant/cache';
import { RedisService } from '@backend/redis';
import { ApiResponse } from '@nestjs/swagger/dist/decorators/api-response.decorator';
import { ApiOperation } from '@nestjs/swagger/dist/decorators/api-operation.decorator';
import { ApiQuery } from '@nestjs/swagger/dist/decorators/api-query.decorator';
import { ApiParam } from '@nestjs/swagger/dist/decorators/api-param.decorator';
import { ApiBody } from '@nestjs/swagger/dist/decorators/api-body.decorator';
import { ApiTags } from '@nestjs/swagger/dist/decorators/api-use-tags.decorator';

@ApiTags('Modality Machines')
@Controller('modality-machines')
@UseInterceptors(RequestLoggingInterceptor, TransformInterceptor)
export class ModalityMachinesController {
  constructor(
    @Inject(process.env.IMAGE_SERVICE_NAME || 'IMAGING_SERVICE')
    private readonly imagingService: ClientProxy,
    @Inject(RedisService)
    private readonly redisService: RedisService
  ) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get all modality machines' })
  @ApiResponse({ status: 200, description: 'List of modality machines' })
  @ApiQuery({ name: 'modalityId', required: false })
  @ApiQuery({ name: 'roomId', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'machineName', required: false })
  @ApiQuery({ name: 'manufacturer', required: false })
  @ApiQuery({ name: 'serialNumber', required: false })
  @ApiQuery({ name: 'model', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'sortBy', required: false })
  @ApiQuery({ name: 'order', required: false })
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
      const pattern = `${CacheEntity.modalityMachines}.${
        CacheKeyPattern.all
      }?modalityId=${modalityId || ''}&roomId=${roomId || ''}&status=${
        status || ''
      }&machineName=${machineName || ''}&manufacturer=${
        manufacturer || ''
      }&serialNumber=${serialNumber || ''}&model=${model || ''}&page=${
        page || ''
      }&limit=${limit || ''}&sortBy=${sortBy || ''}&order=${order || ''}`;

      const cachedMachines = await this.redisService.get(pattern);
      if (cachedMachines) {
        return cachedMachines;
      }
      const machines = await firstValueFrom(
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
      await this.redisService.set(pattern, machines, CACHE_TTL_SECONDS); // Cache for 5 minutes
      return machines;
    } catch (error) {
      console.log(error);
    }
  }

  @Get('paginated')
  @ApiOperation({ summary: 'Get paginated modality machines' })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of modality machines',
  })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'searchField', required: false })
  @ApiQuery({ name: 'sortField', required: false })
  @ApiQuery({ name: 'sortBy', required: false })
  @ApiQuery({ name: 'order', required: false, enum: ['asc', 'desc'] })
  @ApiQuery({ name: 'includeDeleted', required: false })
  @ApiQuery({ name: 'modalityId', required: false })
  @ApiQuery({ name: 'status', required: false })
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
    const pattern = `${CacheEntity.modalityMachines}.${
      CacheKeyPattern.paginated
    }?page=${page || ''}&limit=${limit || ''}&search=${
      search || ''
    }&searchField=${searchField || ''}&sortField=${sortField || ''}&order=${
      order || ''
    }&includeDeleted=${includeDeleted || ''}&modalityId=${
      modalityId || ''
    }&status=${status || ''}`;

    const cachedPaginated = await this.redisService.get(pattern);
    if (cachedPaginated) {
      return cachedPaginated;
    }

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
    const machines = await firstValueFrom(
      this.imagingService.send('ImagingService.ModalityMachines.FindMany', {
        paginationDto,
      })
    );
    await this.redisService.set(pattern, machines, CACHE_TTL_SECONDS);
    return machines;
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get modality machines statistics' })
  @ApiResponse({ status: 200, description: 'Modality machines statistics' })
  @ApiQuery({ name: 'roomId', required: false })
  async getStats(@Query('roomId') roomId?: string) {
    const pattern = `${CacheEntity.modalityMachines}.${
      CacheKeyPattern.stats
    }?roomId=${roomId || ''}`;
    const cachedStats = await this.redisService.get(pattern);
    if (cachedStats) {
      return cachedStats;
    }
    const stats = await firstValueFrom(
      this.imagingService.send('ImagingService.ModalityMachines.GetStats', {
        roomId,
      })
    );
    await this.redisService.set(pattern, stats, CACHE_TTL_SECONDS);
    return stats;
  }

  @Get('room/:roomId')
  @ApiOperation({ summary: 'Get modality machines by room ID' })
  @ApiResponse({
    status: 200,
    description: 'List of modality machines for the specified room ID',
  })
  @ApiParam({ name: 'roomId', description: 'The ID of the room' })
  async findByRoomId(@Param('roomId') roomId: string) {
    const pattern = `${CacheEntity.modalityMachines}.${CacheKeyPattern.byRoomId}/${roomId}`;
    const cachedMachines = await this.redisService.get(pattern);
    if (cachedMachines) {
      return cachedMachines;
    }
    const machines = await firstValueFrom(
      this.imagingService.send('ImagingService.ModalityMachines.FindByRoomId', {
        roomId,
      })
    );
    await this.redisService.set(pattern, machines, CACHE_TTL_SECONDS);
    return machines;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a modality machine by ID' })
  @ApiResponse({ status: 200, description: 'Modality machine details' })
  @ApiParam({ name: 'id', required: true, type: String })
  async findOne(@Param('id') id: string) {
    const pattern = `${CacheEntity.modalityMachines}.${CacheKeyPattern.id}/${id}`;
    const cachedMachine = await this.redisService.get(pattern);
    if (cachedMachine) {
      return cachedMachine;
    }
    const machine = await firstValueFrom(
      this.imagingService.send('ImagingService.ModalityMachines.FindOne', {
        id,
      })
    );
    await this.redisService.set(pattern, machine, CACHE_TTL_SECONDS);
    return machine;
  }

  @Post()
  @ApiOperation({ summary: 'Create a new modality machine' })
  @ApiResponse({
    status: 201,
    description: 'The modality machine has been created.',
  })
  @ApiBody({ type: CreateModalityMachineDto })
  async create(@Body() createModalityMachineDto: CreateModalityMachineDto) {
    const machine = await firstValueFrom(
      this.imagingService.send('ImagingService.ModalityMachines.Create', {
        createModalityMachineDto,
      })
    );
    const pattern = `${CacheEntity.modalityMachines}.${CacheKeyPattern.id}/${machine.id}`;
    await this.redisService.set(pattern, machine, CACHE_TTL_SECONDS);
    await this.redisService.deleteKeyStartingWith(
      `${CacheEntity.modalityMachines}.${CacheKeyPattern.paginated}`
    );
    await this.redisService.delete(
      `${CacheEntity.modalityMachines}.${CacheKeyPattern.all}`
    );
    await this.redisService.deleteKeyStartingWith(
      `${CacheEntity.modalityMachines}.${CacheKeyPattern.byRoomId}`
    );
    await this.redisService.deleteKeyStartingWith(
      `${CacheEntity.modalityMachines}.${CacheKeyPattern.stats}`
    );

    return machine;
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a modality machine by ID' })
  @ApiResponse({
    status: 200,
  })
  @ApiParam({ name: 'id', required: true, type: String })
  @ApiBody({ type: UpdateModalityMachineDto })
  async update(
    @Param('id') id: string,
    @Body() updateModalityMachineDto: UpdateModalityMachineDto
  ) {
    const machine = await firstValueFrom(
      this.imagingService.send('ImagingService.ModalityMachines.Update', {
        id,
        updateModalityMachineDto,
      })
    );

    const pattern = `${CacheEntity.modalityMachines}.${CacheKeyPattern.id}/${machine.id}`;
    await this.redisService.set(pattern, machine, CACHE_TTL_SECONDS);
    await this.redisService.deleteKeyStartingWith(
      `${CacheEntity.modalityMachines}.${CacheKeyPattern.paginated}`
    );
    await this.redisService.delete(
      `${CacheEntity.modalityMachines}.${CacheKeyPattern.all}`
    );
    await this.redisService.deleteKeyStartingWith(
      `${CacheEntity.modalityMachines}.${CacheKeyPattern.byRoomId}`
    );
    await this.redisService.deleteKeyStartingWith(
      `${CacheEntity.modalityMachines}.${CacheKeyPattern.stats}`
    );
    return machine;
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a modality machine by ID' })
  @ApiResponse({
    status: 200,
  })
  @ApiParam({ name: 'id', required: true, type: String })
  async remove(@Param('id') id: string) {
    const result = await firstValueFrom(
      this.imagingService.send('ImagingService.ModalityMachines.Delete', {
        id,
      })
    );
    const pattern = `${CacheEntity.modalityMachines}.${CacheKeyPattern.id}/${id}`;
    await this.redisService.delete(pattern);

    await this.redisService.deleteKeyStartingWith(
      `${CacheEntity.modalityMachines}.${CacheKeyPattern.paginated}`
    );
    await this.redisService.delete(
      `${CacheEntity.modalityMachines}.${CacheKeyPattern.all}`
    );
    await this.redisService.deleteKeyStartingWith(
      `${CacheEntity.modalityMachines}.${CacheKeyPattern.byRoomId}`
    );
    await this.redisService.deleteKeyStartingWith(
      `${CacheEntity.modalityMachines}.${CacheKeyPattern.stats}`
    );
    return result;
  }
}
