import { Injectable, Logger, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import * as crypto from 'crypto';

import { DicomStudyStatus, SignatureType } from '@backend/shared-enums';
import {
  ResourceNotFoundException,
  BusinessLogicException,
  AuthenticationException,
} from '@backend/shared-exception';
import { DicomStudy, DicomStudySignature } from '@backend/shared-domain';

@Injectable()
export class DicomStudySignaturesService {
  private readonly logger = new Logger(DicomStudySignaturesService.name);

  constructor(
    @InjectRepository(DicomStudy)
    private readonly studyRepo: Repository<DicomStudy>,
    @InjectRepository(DicomStudySignature)
    private readonly signatureRepo: Repository<DicomStudySignature>,
    @Inject( process.env.USER_SERVICE_NAME || 'USER_SERVICE')
    private readonly userServiceClient: ClientProxy
  ) {}

  /**
   * Technician verify study
   */
  async technicianVerifyStudy(userId: string, studyId: string, pin: string) {
    // 1. Get study
    const study = await this.studyRepo.findOne({
      where: { id: studyId },
      relations: ['studySignatures'],
    });

    if (!study) {
      throw new ResourceNotFoundException('DicomStudy', studyId);
    }

    // 2. Validate study status
    if (study.studyStatus !== DicomStudyStatus.SCANNED) {
      throw new BusinessLogicException(
        'Study must be in SCANNED status to verify'
      );
    }

    // 3. Check if already signed by technician
    const existingSignature = study.studySignatures?.find(
      (s) => s.signatureType === SignatureType.TECHNICIAN_VERIFY
    );

    if (existingSignature) {
      throw new BusinessLogicException('Study already verified by technician');
    }

    // 4. Sign the study
    const signature = await this.signStudy(
      userId,
      studyId,
      pin,
      SignatureType.TECHNICIAN_VERIFY,
      study
    );

    // 5. Update study status
    study.studyStatus = DicomStudyStatus.TECHNICIAN_VERIFIED;
    study.performingTechnicianId = userId;
    await this.studyRepo.save(study);

    this.logger.log(
      `Technician ${userId} verified study ${studyId} successfully`
    );

    return {
      message: 'Study verified successfully',
      study: {
        id: study.id,
        status: study.studyStatus,
        verifiedAt: signature.signedAt,
      },
    };
  }

  /**
   * Radiologist approve study
   */
  async radiologistApproveStudy(userId: string, studyId: string, pin: string) {
    // 1. Get study
    const study = await this.studyRepo.findOne({
      where: { id: studyId },
      relations: ['studySignatures'],
    });

    if (!study) {
      throw new ResourceNotFoundException('DicomStudy', studyId);
    }

    // 2. Validate study status - must be verified by technician first
    if (study.studyStatus !== DicomStudyStatus.TECHNICIAN_VERIFIED) {
      throw new BusinessLogicException(
        'Study must be verified by technician before approval'
      );
    }

    // 3. Check if already approved
    const existingSignature = study.studySignatures?.find(
      (s) => s.signatureType === SignatureType.RADIOLOGIST_APPROVE
    );

    if (existingSignature) {
      throw new BusinessLogicException('Study already approved by radiologist');
    }

    // 4. Sign the study
    const signature = await this.signStudy(
      userId,
      studyId,
      pin,
      SignatureType.RADIOLOGIST_APPROVE,
      study
    );

    // 5. Update study status
    study.studyStatus = DicomStudyStatus.APPROVED;
    study.verifyingRadiologistId = userId;
    await this.studyRepo.save(study);

    this.logger.log(
      `Radiologist ${userId} approved study ${studyId} successfully`
    );

    return {
      message: 'Study approved successfully',
      study: {
        id: study.id,
        status: study.studyStatus,
        approvedAt: signature.signedAt,
      },
    };
  }

  /**
   * Core signing logic
   */
  private async signStudy(
    userId: string,
    studyId: string,
    pin: string,
    signatureType: SignatureType,
    study: DicomStudy
  ): Promise<DicomStudySignature> {
    // 1. Prepare data to sign
    const dataToSign = JSON.stringify({
      studyId: study.id,
      studyInstanceUid: study.studyInstanceUid,
      patientId: study.patientId,
      studyDate: study.studyDate,
      signatureType,
      timestamp: new Date().toISOString(),
    });

    // 2. Call User Service to sign data
    try {
      const signResult = await firstValueFrom(
        this.userServiceClient.send('digital-signature.sign', {
          userId,
          pin,
          data: dataToSign,
        })
      );

      if (!signResult || !signResult.signature) {
        throw new BusinessLogicException('Failed to sign data');
      }

      // 3. Get digital signature info
      const digitalSignature = await firstValueFrom(
        this.userServiceClient.send('digital-signature.getById', {
          id: signResult.signatureId,
        })
      );

      // 4. Create study signature record
      const studySignature = this.signatureRepo.create({
        studyId: study.id as string,
        signatureId: signResult.signatureId,
        userId,
        signatureType,
        signedData: dataToSign,
        signatureValue: signResult.signature,
        publicKey: signResult.publicKey,
        certificateSerial: digitalSignature.certificateSerial,
        algorithm: digitalSignature.algorithm || 'RSA-SHA256',
      });

      await this.signatureRepo.save(studySignature);

      return studySignature;
    } catch (error: any) {
      this.logger.error('Failed to sign study', error.stack);

      if (error.message?.includes('Invalid PIN')) {
        throw new AuthenticationException('Invalid PIN');
      }

      if (error.message?.includes('not found')) {
        throw new BusinessLogicException(
          'Digital signature not found. Please setup digital signature first.'
        );
      }

      throw new BusinessLogicException(error.message || 'Failed to sign study');
    }
  }

  /**
   * Verify study signature
   */
  async verifyStudySignature(studyId: string, signatureType: SignatureType) {
    const signature = await this.signatureRepo.findOne({
      where: { studyId, signatureType },
    });

    if (!signature) {
      throw new ResourceNotFoundException(
        'Signature',
        `${studyId}-${signatureType}`
      );
    }

    try {
      // Verify cryptographically using stored public key
      const verify = crypto.createVerify(signature.algorithm);
      verify.update(signature.signedData);
      verify.end();

      const isValid = verify.verify(
        signature.publicKey,
        signature.signatureValue,
        'base64'
      );

      // // Optional: Check certificate revocation via User Service
      // let certificateStatus = null;
      // try {
      //   certificateStatus = await firstValueFrom(
      //     this.userServiceClient.send('digital-signature.checkRevocation', {
      //       certificateSerial: signature.certificateSerial,
      //     })
      //   );
      // } catch (error) {
      //   this.logger.warn(
      //     'Cannot check certificate revocation, User Service unavailable'
      //   );
      // }

      return {
        // isValid: isValid && !certificateStatus?.isRevoked,
        signedAt: signature.signedAt,
        userId: signature.userId,
        certificateSerial: signature.certificateSerial,
        // certificateRevoked: certificateStatus?.isRevoked || false,
      };
    } catch (error: any) {
      this.logger.error('Failed to verify signature', error.stack);
      throw new BusinessLogicException('Failed to verify signature');
    }
  }

  async getStudySignatures(studyId: string) {
    const signatures = await this.signatureRepo.find({
      where: { studyId },
      order: { signedAt: 'ASC' },
    });

    return signatures.map((sig) => ({
      id: sig.id,
      signatureType: sig.signatureType,
      userId: sig.userId,
      signedAt: sig.signedAt,
      certificateSerial: sig.certificateSerial,
    }));
  }
}
