import {
  Body,
  Controller,
  Inject,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Role } from '@backend/shared-decorators';
import { Roles } from '@backend/shared-enums';
import { memoryStorage } from 'multer';
import { firstValueFrom } from 'rxjs';

@Controller('imaging-service')
export class ImagingServiceController {
  constructor(
    @Inject(process.env.IMAGE_SERVICE_NAME || 'ImagingService')
    private readonly imagingService: ClientProxy
  ) {}

  @Post('upload')
  @Role(Roles.IMAGING_TECHNICIAN, Roles.RADIOLOGIST)
  @ApiOperation({ summary: 'Upload a DICOM file' })
  @ApiResponse({ status: 200, description: 'DICOM file uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @UseInterceptors(
    FileInterceptor('dicomFile', {
      storage: memoryStorage(),
    })
  )
  async uploadDicomFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() data: { orderId: string; performingTechnicianId: string }
  ) {
    // Convert the file to a format that can be safely transmitted via microservices
    const fileForTransmission = {
      originalname: file.originalname,
      mimetype: file.mimetype,
      buffer: file.buffer.toString('base64'), // Convert buffer to base64 string
      size: file.size,
      encoding: file.encoding,
      fieldname: file.fieldname,
    };

    return await firstValueFrom(
      this.imagingService.send('ImagingService.UploadFile', {
        file: fileForTransmission,
        orderId: data.orderId,
        performingTechnicianId: data.performingTechnicianId,
      })
    );
  }
}
