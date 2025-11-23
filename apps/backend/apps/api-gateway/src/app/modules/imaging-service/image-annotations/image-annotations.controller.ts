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
@Controller('image-annotations')
@UseInterceptors(RequestLoggingInterceptor, TransformInterceptor)
export class ImageAnnotationsController {
  constructor(
    @Inject(process.env.IMAGE_SERVICE_NAME || 'IMAGING_SERVICE')
    private readonly imagingService: ClientProxy,
    @Inject(process.env.USER_SERVICE_NAME || 'USER_SERVICE')
    private readonly userService: ClientProxy
  ) {}

  @Get()
  async getAll() {
    const annotations = await firstValueFrom(
      this.imagingService.send('ImagingService.ImageAnnotations.FindAll', {})
    );

    // Collect all user IDs (both annotatorId and reviewerId) and remove duplicates
    const userIds = [
      ...new Set(
        annotations.flatMap((a: ImageAnnotation) => {
          const ids: string[] = [];
          if (a.annotatorId) ids.push(a.annotatorId);
          if (a.reviewerId) ids.push(a.reviewerId);
          return ids;
        })
      ),
    ];

    console.log('UserIds ,', userIds);

    const users = await firstValueFrom(
      this.userService.send('UserService.Users.GetUsersByIds', { userIds })
    );

    console.log('users', users);
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

    return combined;
  }

  @Get('paginated')
  async getMany(
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
    const annotationsData = await firstValueFrom(
      this.imagingService.send('ImagingService.ImageAnnotations.FindMany', {
        paginationDto,
      })
    );

    const annotations = annotationsData?.data;
    // Collect all user IDs (both annotatorId and reviewerId) and remove duplicates
    const userIds = [
      ...new Set(
        annotations.flatMap((a: ImageAnnotation) => {
          const ids: string[] = [];
          if (a.annotatorId) ids.push(a.annotatorId);
          if (a.reviewerId) ids.push(a.reviewerId);
          return ids;
        })
      ),
    ];

    console.log('UserIds ,', userIds);

    const users = await firstValueFrom(
      this.userService.send('UserService.Users.GetUsersByIds', { userIds })
    );

    console.log('users', users);
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

    return { ...annotationsData, data: combined };
  }

  @Get('instance/:id')
  async getByInstanceId(
    @Param('id') id: string,
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

    const annotations = await firstValueFrom(
      this.imagingService.send(
        'ImagingService.ImageAnnotations.FindByReferenceId',
        { id, type: 'instance', paginationDto }
      )
    );

    // Collect all user IDs (both annotatorId and reviewerId) and remove duplicates
    const userIds = [
      ...new Set(
        annotations.flatMap((a: ImageAnnotation) => {
          const ids: string[] = [];
          if (a.annotatorId) ids.push(a.annotatorId);
          if (a.reviewerId) ids.push(a.reviewerId);
          return ids;
        })
      ),
    ];

    console.log('UserIds ,', userIds);

    const users = await firstValueFrom(
      this.userService.send('UserService.Users.GetUsersByIds', { userIds })
    );

    console.log('users', users);
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

    return combined;
  }

  @Get('series/:id')
  async getBySeriesId(
    @Param('id') id: string,
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

    const annotations = await firstValueFrom(
      this.imagingService.send(
        'ImagingService.ImageAnnotations.FindByReferenceId',
        { id, type: 'series', paginationDto }
      )
    );

    // Collect all user IDs (both annotatorId and reviewerId) and remove duplicates
    const userIds = [
      ...new Set(
        annotations.flatMap((a: ImageAnnotation) => {
          const ids: string[] = [];
          if (a.annotatorId) ids.push(a.annotatorId);
          if (a.reviewerId) ids.push(a.reviewerId);
          return ids;
        })
      ),
    ];

    console.log('UserIds ,', userIds);

    const users = await firstValueFrom(
      this.userService.send('UserService.Users.GetUsersByIds', { userIds })
    );

    console.log('users', users);
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

    return combined;
  }

  @Get('reference/:id')
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

    const annotations = annotationsData?.data;
    // Collect all user IDs (both annotatorId and reviewerId) and remove duplicates
    const userIds = [
      ...new Set(
        annotations.flatMap((a: ImageAnnotation) => {
          const ids: string[] = [];
          if (a.annotatorId) ids.push(a.annotatorId);
          if (a.reviewerId) ids.push(a.reviewerId);
          return ids;
        })
      ),
    ];

    console.log('UserIds ,', userIds);

    const users = await firstValueFrom(
      this.userService.send('UserService.Users.GetUsersByIds', { userIds })
    );

    console.log('users', users);
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

    return { ...annotationsData, data: combined };
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
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

    return result;
  }

  @Post()
  async create(
    @Body() createImageAnnotationDto: CreateImageAnnotationDto,
    @Req() req: IAuthenticatedRequest
  ) {
    return await firstValueFrom(
      this.imagingService.send('ImagingService.ImageAnnotations.Create', {
        createImageAnnotationDto: {
          ...createImageAnnotationDto,
          annotatorId: req.userInfo.userId,
        },
      })
    );
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateImageAnnotationDto: any) {
    return await firstValueFrom(
      this.imagingService.send('ImagingService.ImageAnnotations.Update', {
        id,
        updateImageAnnotationDto,
      })
    );
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return await firstValueFrom(
      this.imagingService.send('ImagingService.ImageAnnotations.Delete', { id })
    );
  }
}
