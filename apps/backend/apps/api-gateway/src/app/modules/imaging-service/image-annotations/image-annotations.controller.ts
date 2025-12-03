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
import { firstValueFrom } from 'rxjs';
import {
  TransformInterceptor,
  RequestLoggingInterceptor,
} from '@backend/shared-interceptor';
import {
  CreateImageAnnotationDto,
  ImageAnnotation,
  User,
} from '@backend/shared-domain';
import type { IAuthenticatedRequest } from '@backend/shared-interfaces';
import { RedisService } from '@backend/redis';
import {
  CACHE_TTL_SECONDS,
  CacheEntity,
  CacheKeyPattern,
} from '../../../../constant/cache';
import { ApiResponse } from '@nestjs/swagger/dist/decorators/api-response.decorator';
import { ApiOperation } from '@nestjs/swagger/dist/decorators/api-operation.decorator';
import { ApiQuery } from '@nestjs/swagger/dist/decorators/api-query.decorator';
import { ApiParam } from '@nestjs/swagger/dist/decorators/api-param.decorator';
import { ApiTags } from '@nestjs/swagger/dist/decorators/api-use-tags.decorator';
@Controller('image-annotations')
@ApiTags('Image Annotations')
@UseInterceptors(RequestLoggingInterceptor, TransformInterceptor)
export class ImageAnnotationsController {
  constructor(
    @Inject(process.env.IMAGE_SERVICE_NAME || 'IMAGING_SERVICE')
    private readonly imagingService: ClientProxy,
    @Inject(process.env.USER_SERVICE_NAME || 'USER_SERVICE')
    private readonly userService: ClientProxy,
    @Inject(RedisService)
    private readonly redisService: RedisService
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all image annotations' })
  @ApiResponse({ status: 200, description: 'List of image annotations' })
  async getAll() {
    const pattern = `${CacheEntity.imageAnnotations}.${CacheKeyPattern.all}`;
    const cachedAnnotations = await this.redisService.get(pattern);

    if (cachedAnnotations) {
      return cachedAnnotations;
    }

    const annotations =
      (await firstValueFrom(
        this.imagingService.send('ImagingService.ImageAnnotations.FindAll', {})
      )) || [];

    // Collect all user IDs (both annotatorId and reviewerId) and remove duplicates
    const userIds = [
      ...new Set(
        annotations?.flatMap((a: ImageAnnotation) => {
          const ids: string[] = [];
          if (a.annotatorId) ids.push(a.annotatorId);
          if (a.reviewerId) ids.push(a.reviewerId);
          return ids;
        })
      ),
    ];

    // console.log('UserIds ,', userIds);

    const users = await firstValueFrom(
      this.userService.send('UserService.Users.GetUsersByIds', { userIds })
    );

    // console.log('users', users);
    const combined = annotations.map((a: ImageAnnotation) => {
      const result: any = { ...a };
      if (a.annotatorId) {
        result.annotator = users.find((u: User) => u.id === a.annotatorId);
      }
      if (a.reviewerId) {
        result.reviewer = users.find((u: User) => u.id === a.reviewerId);
      }
      return result;
    });

    await this.redisService.set(pattern, combined, CACHE_TTL_SECONDS);
    return combined;
  }

  @Get('paginated')
  @ApiOperation({ summary: 'Get paginated image annotations' })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of image annotations',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'searchField', required: false, type: String })
  @ApiQuery({ name: 'sortField', required: false, type: String })
  @ApiQuery({ name: 'order', required: false, type: String })
  async getMany(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('searchField') searchField?: string,
    @Query('sortField') sortField?: string,
    @Query('order') order?: 'asc' | 'desc'
  ) {
    const pattern = `${CacheEntity.imageAnnotations}.${
      CacheKeyPattern.paginated
    }?page=${page || ''}&limit=${limit || ''}&search=${
      search || ''
    }&searchField=${searchField || ''}&sortField=${sortField || ''}&order=${
      order || ''
    }`;
    const cachedAnnotations = await this.redisService.get(pattern);

    if (cachedAnnotations) {
      return cachedAnnotations;
    }

    const paginationDto = {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      search,
      searchField,
      sortField,
      order,
    };

    const annotationsData = await firstValueFrom(
      this.imagingService.send('ImagingService.ImageAnnotations.FindMany', {
        paginationDto,
      })
    );

    const annotations = annotationsData?.data || [];
    // Collect all user IDs (both annotatorId and reviewerId) and remove duplicates
    const userIds = [
      ...new Set(
        annotations?.flatMap((a: ImageAnnotation) => {
          const ids: string[] = [];
          if (a.annotatorId) ids.push(a.annotatorId);
          if (a.reviewerId) ids.push(a.reviewerId);
          return ids;
        })
      ),
    ];

    // console.log('UserIds ,', userIds);

    const users = await firstValueFrom(
      this.userService.send('UserService.Users.GetUsersByIds', { userIds })
    );

    // console.log('users', users);
    const combined = annotations.map((a: ImageAnnotation) => {
      const result: any = { ...a };
      if (a.annotatorId) {
        result.annotator = users.find((u: User) => u.id === a.annotatorId);
      }
      if (a.reviewerId) {
        result.reviewer = users.find((u: User) => u.id === a.reviewerId);
      }
      return result;
    });

    await this.redisService.set(
      pattern,
      { ...annotationsData, data: combined },
      CACHE_TTL_SECONDS
    );

    return { ...annotationsData, data: combined };
  }

  @Get('instance/:id')
  @ApiOperation({ summary: 'Get image annotations by instance ID' })
  @ApiResponse({
    status: 200,
    description: 'List of image annotations for the given instance ID',
  })
  @ApiParam({ name: 'id', required: true, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'searchField', required: false, type: String })
  @ApiQuery({ name: 'sortField', required: false, type: String })
  @ApiQuery({ name: 'order', required: false, type: String })
  async getByInstanceId(
    @Param('id') id: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('searchField') searchField?: string,
    @Query('sortField') sortField?: string,
    @Query('order') order?: 'asc' | 'desc'
  ) {
    const pattern = `${CacheEntity.imageAnnotations}.${
      CacheKeyPattern.byInstanceId
    }/${id}?page=${page || ''}&limit=${limit || ''}&search=${
      search || ''
    }&searchField=${searchField || ''}&sortField=${sortField || ''}&order=${
      order || ''
    }`;
    const cachedAnnotations = await this.redisService.get(pattern);

    if (cachedAnnotations) {
      return cachedAnnotations;
    }

    const paginationDto = {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      search,
      searchField,
      sortField,
      order,
    };

    const annotationsData = await firstValueFrom(
      this.imagingService.send(
        'ImagingService.ImageAnnotations.FindByReferenceId',
        { id, type: 'instance', paginationDto }
      )
    );

    const annotations = annotationsData?.data || [];
    // Collect all user IDs (both annotatorId and reviewerId) and remove duplicates
    const userIds = [
      ...new Set(
        annotations?.flatMap((a: ImageAnnotation) => {
          const ids: string[] = [];
          if (a.annotatorId) ids.push(a.annotatorId);
          if (a.reviewerId) ids.push(a.reviewerId);
          return ids;
        })
      ),
    ];

    // console.log('UserIds ,', userIds);

    const users = await firstValueFrom(
      this.userService.send('UserService.Users.GetUsersByIds', { userIds })
    );

    // console.log('users', users);
    const combined = annotations.map((a: ImageAnnotation) => {
      const result: any = { ...a };
      if (a.annotatorId) {
        result.annotator = users.find((u: User) => u.id === a.annotatorId);
      }
      if (a.reviewerId) {
        result.reviewer = users.find((u: User) => u.id === a.reviewerId);
      }
      return result;
    });

    await this.redisService.set(
      pattern,
      { ...annotationsData, data: combined },
      CACHE_TTL_SECONDS
    );

    return { ...annotationsData, data: combined };
  }

  @Get('series/:id')
  @ApiOperation({ summary: 'Get image annotations by series ID' })
  @ApiResponse({
    status: 200,
    description: 'List of image annotations for the given series ID',
  })
  @ApiParam({ name: 'id', required: true, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'searchField', required: false, type: String })
  @ApiQuery({ name: 'sortField', required: false, type: String })
  @ApiQuery({ name: 'order', required: false, type: String })
  async getBySeriesId(
    @Param('id') id: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('searchField') searchField?: string,
    @Query('sortField') sortField?: string,
    @Query('order') order?: 'asc' | 'desc'
  ) {
    const pattern = `${CacheEntity.imageAnnotations}.${
      CacheKeyPattern.bySeriesId
    }/${id}?page=${page || ''}&limit=${limit || ''}&search=${
      search || ''
    }&searchField=${searchField || ''}&sortField=${sortField || ''}&order=${
      order || ''
    }`;
    const cachedAnnotations = await this.redisService.get(pattern);

    if (cachedAnnotations) {
      return cachedAnnotations;
    }

    const paginationDto = {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      search,
      searchField,
      sortField,
      order,
    };

    const annotationsData = await firstValueFrom(
      this.imagingService.send(
        'ImagingService.ImageAnnotations.FindByReferenceId',
        { id, type: 'series', paginationDto }
      )
    );

    const annotations = annotationsData?.data || [];
    // Collect all user IDs (both annotatorId and reviewerId) and remove duplicates
    const userIds = [
      ...new Set(
        annotations?.flatMap((a: ImageAnnotation) => {
          const ids: string[] = [];
          if (a.annotatorId) ids.push(a.annotatorId);
          if (a.reviewerId) ids.push(a.reviewerId);
          return ids;
        })
      ),
    ];

    // console.log('UserIds ,', userIds);

    const users = await firstValueFrom(
      this.userService.send('UserService.Users.GetUsersByIds', { userIds })
    );

    // console.log('users', users);
    const combined = annotations.map((a: ImageAnnotation) => {
      const result: any = { ...a };
      if (a.annotatorId) {
        result.annotator = users.find((u: User) => u.id === a.annotatorId);
      }
      if (a.reviewerId) {
        result.reviewer = users.find((u: User) => u.id === a.reviewerId);
      }
      return result;
    });

    await this.redisService.set(
      pattern,
      { ...annotationsData, data: combined },
      CACHE_TTL_SECONDS
    );

    return { ...annotationsData, data: combined };
  }

  @Get('reference/:id')
  @ApiOperation({ summary: 'Get image annotations by reference ID' })
  @ApiResponse({
    status: 200,
    description: 'List of image annotations for the given reference ID',
  })
  @ApiParam({ name: 'id', required: true, type: String })
  @ApiQuery({ name: 'type', required: true, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'searchField', required: false, type: String })
  @ApiQuery({ name: 'sortField', required: false, type: String })
  @ApiQuery({ name: 'order', required: false, type: String })
  async getByReferenceId(
    @Param('id') id: string,
    @Query('type') type: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('searchField') searchField?: string,
    @Query('sortField') sortField?: string,
    @Query('order') order?: 'asc' | 'desc'
  ) {
    const pattern = `${CacheEntity.imageAnnotations}.${
      CacheKeyPattern.byReferenceId
    }/${id}?type=${type || ''}&page=${page || ''}&limit=${limit || ''}&search=${
      search || ''
    }&searchField=${searchField || ''}&sortField=${sortField || ''}&order=${
      order || ''
    }`;
    const cachedAnnotations = await this.redisService.get(pattern);

    if (cachedAnnotations) {
      return cachedAnnotations;
    }

    const paginationDto = {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      search,
      searchField,
      sortField,
      order,
    };

    const annotationsData = await firstValueFrom(
      this.imagingService.send(
        'ImagingService.ImageAnnotations.FindByReferenceId',
        { id, type, paginationDto }
      )
    );

    const annotations = annotationsData?.data || [];
    // Collect all user IDs (both annotatorId and reviewerId) and remove duplicates
    const userIds = [
      ...new Set(
        annotations?.flatMap((a: ImageAnnotation) => {
          const ids: string[] = [];
          if (a.annotatorId) ids.push(a.annotatorId);
          if (a.reviewerId) ids.push(a.reviewerId);
          return ids;
        })
      ),
    ];

    // console.log('UserIds ,', userIds);

    const users = await firstValueFrom(
      this.userService.send('UserService.Users.GetUsersByIds', { userIds })
    );

    // console.log('users', users);
    const combined = annotations.map((a: ImageAnnotation) => {
      const result: any = { ...a };
      if (a.annotatorId) {
        result.annotator = users.find((u: User) => u.id === a.annotatorId);
      }
      if (a.reviewerId) {
        result.reviewer = users.find((u: User) => u.id === a.reviewerId);
      }
      return result;
    });

    await this.redisService.set(
      pattern,
      { ...annotationsData, data: combined },
      CACHE_TTL_SECONDS
    );
    return { ...annotationsData, data: combined };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get image annotation by ID' })
  @ApiResponse({ status: 200, description: 'Image annotation details' })
  @ApiParam({ name: 'id', required: true, type: String })
  async getById(@Param('id') id: string) {
    const pattern = `${CacheEntity.imageAnnotations}.${CacheKeyPattern.id}/${id}`;
    const cachedAnnotation = await this.redisService.get(pattern);
    if (cachedAnnotation) {
      return cachedAnnotation;
    }

    const annotation = await firstValueFrom(
      this.imagingService.send('ImagingService.ImageAnnotations.FindOne', {
        id,
      })
    );

    if (!annotation) {
      throw new NotFoundException('Annotation not found');
    }

    // Collect all user IDs (both annotatorId and reviewerId) and remove duplicates
    const userIds = [
      ...new Set(
        [annotation].flatMap((a: ImageAnnotation) => {
          const ids: string[] = [];
          if (a.annotatorId) ids.push(a.annotatorId);
          if (a.reviewerId) ids.push(a.reviewerId);
          return ids;
        })
      ),
    ];

    const users = await firstValueFrom(
      this.userService.send('UserService.Users.GetUsersByIds', { userIds })
    );

    const result: any = { ...annotation };
    if (annotation.annotatorId) {
      result.annotator = users.find(
        (u: User) => u.id === annotation.annotatorId
      );
    }
    if (annotation.reviewerId) {
      result.reviewer = users.find((u: User) => u.id === annotation.reviewerId);
    }

    await this.redisService.set(pattern, result, CACHE_TTL_SECONDS);

    return result;
  }

  @Post()
  async create(
    @Body() createImageAnnotationDto: any,
    @Req() req: IAuthenticatedRequest
  ) {
    const annotation = await firstValueFrom(
      this.imagingService.send('ImagingService.ImageAnnotations.Create', {
        createImageAnnotationDto: {
          ...createImageAnnotationDto,
          annotatorId: req.userInfo.userId,
        },
      })
    );

    const pattern = `${CacheEntity.imageAnnotations}.${CacheKeyPattern.id}/${annotation.id}`;
    await this.redisService.set(pattern, annotation, CACHE_TTL_SECONDS);
    await this.redisService.delete(
      `${CacheEntity.imageAnnotations}.${CacheKeyPattern.all}`
    );
    await this.redisService.deleteKeyStartingWith(
      `${CacheEntity.imageAnnotations}.${CacheKeyPattern.paginated}`
    );
    await this.redisService.deleteKeyStartingWith(
      `${CacheEntity.imageAnnotations}.${CacheKeyPattern.byReferenceId}`
    );
    await this.redisService.deleteKeyStartingWith(
      `${CacheEntity.imageAnnotations}.${CacheKeyPattern.bySeriesId}`
    );
    await this.redisService.deleteKeyStartingWith(
      `${CacheEntity.imageAnnotations}.${CacheKeyPattern.byInstanceId}`
    );

    return annotation;
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateImageAnnotationDto: any) {
    const result = await firstValueFrom(
      this.imagingService.send('ImagingService.ImageAnnotations.Update', {
        id,
        updateImageAnnotationDto,
      })
    );
    const pattern = `${CacheEntity.imageAnnotations}.${CacheKeyPattern.id}/${id}`;

    await this.redisService.set(pattern, result, CACHE_TTL_SECONDS);
    await this.redisService.delete(
      `${CacheEntity.imageAnnotations}.${CacheKeyPattern.all}`
    );
    await this.redisService.deleteKeyStartingWith(
      `${CacheEntity.imageAnnotations}.${CacheKeyPattern.paginated}`
    );
    await this.redisService.deleteKeyStartingWith(
      `${CacheEntity.imageAnnotations}.${CacheKeyPattern.byReferenceId}`
    );
    await this.redisService.deleteKeyStartingWith(
      `${CacheEntity.imageAnnotations}.${CacheKeyPattern.bySeriesId}`
    );
    await this.redisService.deleteKeyStartingWith(
      `${CacheEntity.imageAnnotations}.${CacheKeyPattern.byInstanceId}`
    );

    return result;
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    const result = await firstValueFrom(
      this.imagingService.send('ImagingService.ImageAnnotations.Delete', { id })
    );

    const pattern = `${CacheEntity.imageAnnotations}.${CacheKeyPattern.id}/${id}`;
    await this.redisService.delete(pattern);
    await this.redisService.delete(
      `${CacheEntity.imageAnnotations}.${CacheKeyPattern.all}`
    );
    await this.redisService.deleteKeyStartingWith(
      `${CacheEntity.imageAnnotations}.${CacheKeyPattern.paginated}`
    );
    await this.redisService.deleteKeyStartingWith(
      `${CacheEntity.imageAnnotations}.${CacheKeyPattern.byReferenceId}`
    );
    await this.redisService.deleteKeyStartingWith(
      `${CacheEntity.imageAnnotations}.${CacheKeyPattern.bySeriesId}`
    );
    await this.redisService.deleteKeyStartingWith(
      `${CacheEntity.imageAnnotations}.${CacheKeyPattern.byInstanceId}`
    );

    return result;
  }
}
