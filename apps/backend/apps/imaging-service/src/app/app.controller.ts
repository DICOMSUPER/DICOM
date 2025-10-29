import { Controller, Get, HttpStatus } from '@nestjs/common';
import { AppService } from './app.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
  ThrowMicroserviceException,
  uploadFileToCloudinary,
} from '@backend/shared-utils';
import { ConfigService } from '@nestjs/config';
import { IMAGING_SERVICE } from '../constant/microservice.constant';
import { DicomStudiesService } from './modules/dicom-studies/dicom-studies.service';
import { DicomSeriesService } from './modules/dicom-series/dicom-series.service';
import { DicomInstancesService } from './modules/dicom-instances/dicom-instances.service';
import { ImagingModalitiesService } from './modules/imaging-modalities/imaging-modalities.service';
import { Patient } from '@backend/shared-domain';

interface FileForTransmission {
  originalname: string;
  mimetype: string;
  buffer: string; // base64 string
  size: number;
  encoding: string;
  fieldname: string;
}

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly configService: ConfigService
  ) {}

  @Get()
  getData() {
    return this.appService.getData();
  }

  @MessagePattern(`${IMAGING_SERVICE}.HealthCheck`)
  async healthCheck(): Promise<{
    status: string;
    message: string;
    timestamp: string;
  }> {
    return {
      status: 'ok',
      message: 'ImagingService is running',
      timestamp: new Date().toISOString(),
    };
  }

  checkCloudinaryConfig() {
    if (
      !this.configService.get<string>('CLOUDINARY_NAME') ||
      !this.configService.get<string>('CLOUDINARY_API_KEY') ||
      !this.configService.get<string>('CLOUDINARY_API_SECRET')
    ) {
      throw ThrowMicroserviceException(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Media hosting config error',
        IMAGING_SERVICE
      );
    }
  }

  //may be for verifing patientCode?
  @MessagePattern('ImagingService.ExtractMetadata')
  async extractMetadata(
    @Payload()
    data: {
      buffer: string; // base64 string
    }
  ) {
    const metaData = await this.appService.extractMetadataFromFileBuffer(
      Buffer.from(data.buffer, 'base64')
    );

    return metaData;
  }

  @MessagePattern('ImagingService.UploadFile')
  async uploadFile(
    @Payload()
    data: {
      file: FileForTransmission;
      orderId: string;
      performingTechnicianId: string;
      modalityMachineId: string;
      patient: Patient;
    }
  ) {
    const { orderId, performingTechnicianId, patient, modalityMachineId } =
      data;
    this.checkCloudinaryConfig();
    const cloudinaryConfig = {
      cloud_name: this.configService.get<string>('CLOUDINARY_NAME') as string,
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY') as string,
      api_secret: this.configService.get<string>(
        'CLOUDINARY_API_SECRET'
      ) as string,
    };

    // Reconstruct the file object for Cloudinary
    const reconstructedFile: Express.Multer.File = {
      originalname: data.file.originalname,
      mimetype: data.file.mimetype,
      buffer: Buffer.from(data.file.buffer, 'base64'), // Convert back to Buffer
      size: data.file.size,
      encoding: data.file.encoding,
      fieldname: data.file.fieldname,
      stream: null as any, // Not used by Cloudinary
      destination: '', // Not used by Cloudinary
      filename: '', // Not used by Cloudinary
      path: '', // Not used by Cloudinary
    };
    const metaData = await this.appService.extractMetadataFromFileBuffer(
      Buffer.from(data.file.buffer, 'base64')
    );

    const filePath = await uploadFileToCloudinary(
      cloudinaryConfig,
      reconstructedFile,
      'dicom'
    );
    return await this.appService.createDicomStructure(
      metaData,
      orderId,
      performingTechnicianId,
      filePath as string,
      patient,
      modalityMachineId
    );
  }
}
