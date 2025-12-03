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
import type { IAuthenticatedRequest } from '@backend/shared-interfaces';
import { CacheEntity, CacheKeyPattern } from '../../../../constant/cache';
import { RedisService } from '@backend/redis';
import { ApiParam } from '@nestjs/swagger/dist/decorators/api-param.decorator';
import { ApiResponse } from '@nestjs/swagger/dist/decorators/api-response.decorator';
import { ApiOperation } from '@nestjs/swagger/dist/decorators/api-operation.decorator';

@Controller('dicom-study-signatures')
@UseInterceptors(RequestLoggingInterceptor, TransformInterceptor)
export class DicomStudySignaturesController {
  private readonly logger = new Logger(DicomStudySignaturesController.name);

  constructor(
    @Inject(process.env.IMAGE_SERVICE_NAME || 'IMAGING_SERVICE')
    private readonly imagingService: ClientProxy,
    @Inject(RedisService)
    private readonly redisService: RedisService
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

    await this.redisService.deleteKeyStartingWith(
      `${CacheEntity.dicomStudySignatures}.${CacheKeyPattern.byStudyId}/${dto.studyId}`
    );
    return result;
  }

  @Role(Roles.RADIOLOGIST, Roles.PHYSICIAN)
  @Post('physician-approve')
  @ApiOperation({ summary: 'Physician approves a DICOM study' })
  @ApiResponse({ status: 200, description: 'Study approved successfully' })
  @HttpCode(HttpStatus.OK)
  async physicianApprove(
    @Req() req: IAuthenticatedRequest,
    @Body() dto: SignStudyDto
  ) {
    this.logger.log(
      `Physician ${req.userInfo.userId} approving study ${dto.studyId}`
    );

    const result = await firstValueFrom(
      this.imagingService.send(
        'ImagingService.DicomStudySignature.PhysicianApprove',
        {
          userId: req.userInfo.userId,
          studyId: dto.studyId,
          pin: dto.pin,
        }
      )
    );

    await this.redisService.deleteKeyStartingWith(
      `${CacheEntity.dicomStudySignatures}.${CacheKeyPattern.byStudyId}/${dto.studyId}`
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
  @ApiOperation({ summary: 'Get all signatures for a DICOM study' })
  @ApiResponse({ status: 200, description: 'List of signatures for the study' })
  @ApiParam({ name: 'studyId', required: true, type: String })
  async getStudySignatures(@Param('studyId') studyId: string) {
    this.logger.log(`Getting signatures for study ${studyId}`);

    const pattern = `${CacheEntity.dicomStudySignatures}.${CacheKeyPattern.byStudyId}/${studyId}`;
    const cachedSignatures = await this.redisService.get(pattern);

    if (cachedSignatures) {
      return cachedSignatures;
    }
    const result = await firstValueFrom(
      this.imagingService.send('ImagingService.DicomStudySignature.GetAll', {
        studyId,
      })
    );

    await this.redisService.set(pattern, result, CACHE_TTL_SECONDS);

    return result;
  }

  @Get(':studyId/:signatureType')
  @ApiOperation({
    summary: 'Get details of a specific signature for a DICOM study',
  })
  @ApiResponse({ status: 200, description: 'Signature details' })
  @ApiParam({ name: 'studyId', required: true, type: String })
  @ApiParam({ name: 'signatureType', required: true, type: String })
  async getSignatureDetails(
    @Param('studyId') studyId: string,
    @Param('signatureType') signatureType: SignatureType
  ) {
    this.logger.log(
      `Getting signature details for study ${studyId}, type ${signatureType}`
    );

    const pattern = `${CacheEntity.dicomStudySignatures}.${CacheKeyPattern.byStudyId}/${studyId}/${signatureType}`;

    const cachedDetails = await this.redisService.get(pattern);
    if (cachedDetails) {
      return cachedDetails;
    }

    const result = await firstValueFrom(
      this.imagingService.send(
        'ImagingService.DicomStudySignature.GetDetails',
        {
          studyId,
          signatureType,
        }
      )
    );
    await this.redisService.set(pattern, result, CACHE_TTL_SECONDS);

    return result;
  }
}
