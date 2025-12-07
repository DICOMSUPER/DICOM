import {
  Body,
  Controller,
  Inject,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Role } from '@backend/shared-decorators';
import { Roles } from '@backend/shared-enums';
import { memoryStorage } from 'multer';
import { firstValueFrom } from 'rxjs';
import {
  TransformInterceptor,
  RequestLoggingInterceptor,
} from '@backend/shared-interceptor';
import { RedisService } from '@backend/redis';
import {
  CACHE_TTL_SECONDS,
  CacheEntity,
  CacheKeyPattern,
} from '../../../constant/cache';
import { cacheKeyBuilder } from '../../../utils/cache-builder.utils';
@Controller('imaging-service')
@UseInterceptors(RequestLoggingInterceptor, TransformInterceptor)
export class ImagingServiceController {
  constructor(
    @Inject(process.env.IMAGE_SERVICE_NAME || 'IMAGING_SERVICE')
    private readonly imagingService: ClientProxy,
    @Inject(process.env.USER_SERVICE_NAME || 'USER_SERVICE')
    private readonly userService: ClientProxy,
    @Inject(process.env.PATIENT_SERVICE_NAME || 'PATIENT_SERVICE')
    private readonly patientService: ClientProxy,
    @Inject(RedisService)
    private readonly redisService: RedisService
  ) {}

  private async uncacheDicomInstance(id?: string) {
    if (id) {
      await this.redisService.delete(
        cacheKeyBuilder.id(CacheEntity.dicomInstances, id)
      );
    }

    await this.redisService.delete(
      cacheKeyBuilder.findAll(CacheEntity.dicomInstances)
    );
    await this.redisService.deleteKeyStartingWith(
      cacheKeyBuilder.paginated(CacheEntity.dicomInstances)
    );
    await this.redisService.deleteKeyStartingWith(
      cacheKeyBuilder.byReferenceId(CacheEntity.dicomInstances, '')
    );
  }

  private async uncacheDicomSeries(id?: string) {
    // 1. Delete single item cache
    if (id) {
      await this.redisService.delete(
        cacheKeyBuilder.id(CacheEntity.dicomSeries, id)
      );
    }

    await this.redisService.delete(
      cacheKeyBuilder.findAll(CacheEntity.dicomSeries)
    );
    await this.redisService.deleteKeyStartingWith(
      cacheKeyBuilder.paginated(CacheEntity.dicomSeries)
    );
    await this.redisService.deleteKeyStartingWith(
      cacheKeyBuilder.byReferenceId(CacheEntity.dicomSeries, '')
    );
  }

  private async uncacheDicomStudies(id?: string) {
    await this.redisService.delete(
      cacheKeyBuilder.findAll(CacheEntity.dicomStudies)
    );

    await this.redisService.deleteKeyStartingWith(
      cacheKeyBuilder.paginated(CacheEntity.dicomStudies)
    );

    await this.redisService.deleteKeyStartingWith(
      cacheKeyBuilder.byReferenceId(CacheEntity.dicomStudies, '')
    );

    await this.redisService.deleteKeyStartingWith(
      cacheKeyBuilder.filter(CacheEntity.dicomStudies)
    );

    await this.redisService.deleteKeyStartingWith(
      cacheKeyBuilder.filterWithPagination(CacheEntity.dicomStudies)
    );

    await this.redisService.deleteKeyStartingWith(
      cacheKeyBuilder.statsInDateRange(CacheEntity.dicomStudies)
    );

    if (id) {
      await this.redisService.delete(
        cacheKeyBuilder.id(CacheEntity.dicomStudies, id)
      );
    }

    await this.redisService.deleteKeyStartingWith(
      cacheKeyBuilder.byOrderId(CacheEntity.dicomStudies, '')
    );
  }

  @Post('upload')
  @Role(Roles.IMAGING_TECHNICIAN, Roles.RADIOLOGIST)
  @ApiOperation({ summary: 'Upload a DICOM file' })
  @ApiResponse({ status: 200, description: 'DICOM file uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @UseInterceptors(
    FileInterceptor('dicomFile', {
      storage: memoryStorage(),
      limits: { fileSize: 512 * 1024 * 1024 }, //512 mb
    })
  )
  async uploadDicomFile(
    @UploadedFile() file: Express.Multer.File,
    @Body()
    data: {
      orderId: string;
      performingTechnicianId: string;
      modalityMachineId: string;
    }
  ) {
    try {
      const user = await firstValueFrom(
        this.userService.send('UserService.Users.findOne', {
          id: data.performingTechnicianId,
        })
      );

      if (!user) {
        throw new NotFoundException('Imaging Technician not found');
      }

      if (user.role !== Roles.IMAGING_TECHNICIAN) {
        throw new BadRequestException('Invalid performing imaging technician');
      }
      // Convert the file to a format that can be safely transmitted via microservices
      const fileForTransmission = {
        originalname: file.originalname,
        mimetype: file.mimetype,
        buffer: file.buffer.toString('base64'), // Convert buffer to base64 string
        size: file.size,
        encoding: file.encoding,
        fieldname: file.fieldname,
      };

      const metaData = await firstValueFrom(
        this.imagingService.send('ImagingService.ExtractMetadata', {
          buffer: fileForTransmission.buffer,
        })
      );

      console.log(metaData.PatientID);
      //verify patient exists
      const patient = await firstValueFrom(
        this.patientService.send('PatientService.Patient.FindByCode', {
          patientCode: metaData.PatientID,
        })
      );

      if (!patient) {
        throw new NotFoundException('Patient not found');
      }

      const result = await firstValueFrom(
        this.imagingService.send('ImagingService.UploadFile', {
          file: fileForTransmission,
          orderId: data.orderId,
          performingTechnicianId: data.performingTechnicianId,
          patient,
          modalityMachineId: data.modalityMachineId,
        })
      );

      await this.uncacheDicomStudies(result.studyId);
      await this.uncacheDicomSeries(result.seriesId);
      await this.uncacheDicomInstance(result.id);

      return result;
    } catch (error) {
      console.error('Upload DICOM error:', error);
      throw new InternalServerErrorException((error as Error).message);
    }
  }
}
