import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

import { SignatureType } from '@backend/shared-enums';
import { DicomStudySignaturesService } from './dicom-study-signatures.service';
import { handleErrorFromMicroservices } from '@backend/shared-utils';
import { IMAGING_SERVICE } from '../../../constant/microservice.constant';

@Controller()
export class DicomStudySignaturesController {
  private readonly logger = new Logger(DicomStudySignaturesController.name);

  constructor(private readonly signatureService: DicomStudySignaturesService) {}

  @MessagePattern('ImagingService.DicomStudySignature.TechnicianVerify')
  async technicianVerify(
    @Payload() data: { userId: string; studyId: string; pin: string }
  ) {
    this.logger.log(
      `Processing technician verify: userId=${data.userId}, studyId=${data.studyId}`
    );
    try {
      return await this.signatureService.technicianVerifyStudy(
        data.userId,
        data.studyId,
        data.pin
      );
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        'Failed to technician verification',
        IMAGING_SERVICE
      );
    }
  }

  @MessagePattern('ImagingService.DicomStudySignature.PhysicianApprove')
  async physicianApprove(
    @Payload() data: { userId: string; studyId: string; pin: string }
  ) {
    this.logger.log(
      `Processing physician approve: userId=${data.userId}, studyId=${data.studyId}`
    );
    try {
      return await this.signatureService.physicianApproveStudy(
        data.userId,
        data.studyId,
        data.pin
      );
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        'Failed to physician approval',
        IMAGING_SERVICE
      );
    }
  }

  @MessagePattern('ImagingService.DicomStudySignature.Verify')
  async verifySignature(
    @Payload() data: { studyId: string; signatureType: SignatureType }
  ) {
    this.logger.log(
      `Processing signature verification: studyId=${data.studyId}, type=${data.signatureType}`
    );

    return this.signatureService.verifyStudySignature(
      data.studyId,
      data.signatureType
    );
  }

  @MessagePattern('ImagingService.DicomStudySignature.GetAll')
  async getStudySignatures(@Payload() data: { studyId: string }) {
    this.logger.log(`Getting all signatures for study: ${data.studyId}`);

    return this.signatureService.getStudySignatures(data.studyId);
  }
  // get all annotations by study ID and signature type
  

  // @MessagePattern('ImagingService.DicomStudySignature.GetDetails')
  // async getSignatureDetails(
  //   @Payload() data: { studyId: string; signatureType: SignatureType }
  // ) {
  //   this.logger.log(
  //     `Getting signature details: studyId=${data.studyId}, type=${data.signatureType}`
  //   );

  //   return this.signatureService.getSignatureDetails(
  //     data.studyId,
  //     data.signatureType
  //   );
  // }

}
