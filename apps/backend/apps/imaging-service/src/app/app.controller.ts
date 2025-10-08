import { Controller, Get, HttpStatus, UseInterceptors } from '@nestjs/common';
import { AppService } from './app.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
  ThrowMicroserviceException,
  uploadFileToCloudinary,
} from '@backend/shared-utils';
import { ConfigService } from '@nestjs/config';
import { IMAGING_SERVICE } from '../constant/microservice.constant';

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

  checkCloudinaryConfig() {
    if (
      !this.configService.get<string>('CLOUDINARY_NAME') ||
      !this.configService.get<string>('CLOUDINARY_API_KEY') ||
      !this.configService.get<string>('CLOUDINARY_API_PASSWORD')
    ) {
      throw ThrowMicroserviceException(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Media hosting config error',
        IMAGING_SERVICE
      );
    }
  }

  @MessagePattern('ImagingService.UploadFile')
  async uploadFile(@Payload() data: { file: Express.Multer.File }) {
    this.checkCloudinaryConfig();
    const cloudinaryConfig = {
      cloud_name: this.configService.get<string>('CLOUDINARY_NAME') as string,
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY') as string,
      api_password: this.configService.get<string>(
        'CLOUDINARY_API_PASSWORD'
      ) as string,
    };
    return await uploadFileToCloudinary(cloudinaryConfig, data.file);
  }
}
