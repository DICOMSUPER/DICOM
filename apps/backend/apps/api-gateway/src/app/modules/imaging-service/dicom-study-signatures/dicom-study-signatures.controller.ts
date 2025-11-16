import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  Logger,
  UseInterceptors,
  Req,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { Public, Role } from '@backend/shared-decorators';
import { Roles, SignatureType } from '@backend/shared-enums';
import {
  TransformInterceptor,
  RequestLoggingInterceptor,
} from '@backend/shared-interceptor';
import { SignStudyDto, VerifyStudySignatureDto } from '@backend/shared-domain';
import type { IAuthenticatedRequest } from 'libs/shared-interfaces/src';

@Controller('dicom-study-signatures')
@UseInterceptors(RequestLoggingInterceptor, TransformInterceptor)
export class DicomStudySignaturesController {
  private readonly logger = new Logger(DicomStudySignaturesController.name);

  constructor(
    @Inject(process.env.IMAGE_SERVICE_NAME || 'IMAGING_SERVICE')
    private readonly imagingService: ClientProxy
  ) {}

  @Role(Roles.IMAGING_TECHNICIAN)
  @Post('technician-verify')
  @HttpCode(HttpStatus.OK)
  async technicianVerify(
    @Req() req: IAuthenticatedRequest,
    @Body() dto: SignStudyDto
  ) {
    this.logger.log(
      `Technician ${req.userInfo.userId} verifying study ${dto.studyId}`
    );

    const result = await firstValueFrom(
      this.imagingService.send(
        'ImagingService.DicomStudySignature.TechnicianVerify',
        {
          userId: req.userInfo.userId,
          studyId: dto.studyId,
          pin: dto.pin,
        }
      )
    );

    return result;
  }

  @Role(Roles.RADIOLOGIST, Roles.PHYSICIAN)
  @Post('radiologist-approve')
  @HttpCode(HttpStatus.OK)
  async radiologistApprove(
    @Req() req: IAuthenticatedRequest,
    @Body() dto: SignStudyDto
  ) {
    this.logger.log(
      `Radiologist ${req.userInfo.userId} approving study ${dto.studyId}`
    );

    const result = await firstValueFrom(
      this.imagingService.send(
        'ImagingService.DicomStudySignature.RadiologistApprove',
        {
          userId: req.userInfo.userId,
          studyId: dto.studyId,
          pin: dto.pin,
        }
      )
    );

    return result;
  }

  @Post('verify')
  @HttpCode(HttpStatus.OK)
  async verifySignature(@Body() dto: VerifyStudySignatureDto) {
    this.logger.log(
      `Verifying signature for study ${dto.studyId}, type ${dto.signatureType}`
    );

    const result = await firstValueFrom(
      this.imagingService.send('ImagingService.DicomStudySignature.Verify', {
        studyId: dto.studyId,
        signatureType: dto.signatureType,
      })
    );

    return result;
  }

  @Get(':studyId')
  async getStudySignatures(@Param('studyId') studyId: string) {
    this.logger.log(`Getting signatures for study ${studyId}`);

    const result = await firstValueFrom(
      this.imagingService.send('ImagingService.DicomStudySignature.GetAll', {
        studyId,
      })
    );

    return result;
  }

  @Get(':studyId/:signatureType')
  async getSignatureDetails(
    @Param('studyId') studyId: string,
    @Param('signatureType') signatureType: SignatureType
  ) {
    this.logger.log(
      `Getting signature details for study ${studyId}, type ${signatureType}`
    );

    const result = await firstValueFrom(
      this.imagingService.send(
        'ImagingService.DicomStudySignature.GetDetails',
        {
          studyId,
          signatureType,
        }
      )
    );

    return result;
  }
}
