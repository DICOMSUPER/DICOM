import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('imaging-service')
export class ImagingServiceController {
  @Post('upload')
  @UseInterceptors(FileInterceptor('dicomFile'))
  async uploadDicomFile(@UploadedFile() file: File) {
    console.log(file, typeof file);
    return { file: typeof file };
  }
}
