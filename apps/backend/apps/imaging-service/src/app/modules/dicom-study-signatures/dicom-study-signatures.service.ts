import {
  Injectable,
  Logger,
  Inject,
  ConsoleLogger,
  BadRequestException,
} from '@nestjs/common';
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
  DigitalSignatureAlreadyExistsException,
  InvalidStudyStatusException,
  DigitalSignatureSetupRequiredException,
  SignatureCreationFailedException,
  StudySignatureNotFoundException,
  SignatureVerificationFailedException,
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
    @Inject(process.env.USER_SERVICE_NAME || 'USER_SERVICE')
    private readonly userServiceClient: ClientProxy
  ) {}

  private async ensureUserHasDigitalSignature(userId: string): Promise<void> {
    try {
      await firstValueFrom(
        this.userServiceClient.send('digital-signature.getByUserId', {
          userId,
        })
      );
    } catch (error) {
      this.logger.error(
        `User ${userId} does not have digital signature setup`,
        error
      );
      throw new DigitalSignatureSetupRequiredException(userId);
    }
  }

  async technicianVerifyStudy(userId: string, studyId: string, pin: string) {
    await this.ensureUserHasDigitalSignature(userId);
    // Get study
    const study = await this.studyRepo.findOne({
      where: { id: studyId },
      relations: ['studySignatures'],
    });

    console.log('technician study', study);

    if (!study) {
      throw new ResourceNotFoundException('DicomStudy', studyId);
    }

    if (study.studyStatus !== DicomStudyStatus.SCANNED) {
      throw new InvalidStudyStatusException(
        study.studyStatus,
        DicomStudyStatus.SCANNED,
        studyId
      );
    }

    const existingSignature = study.studySignatures?.find(
      (s) => s.signatureType === SignatureType.TECHNICIAN_VERIFY
    );

    if (existingSignature) {
      // throw new BusinessLogicException('Study already verified by technician');
      throw new DigitalSignatureAlreadyExistsException(userId);
    }

    const signature = await this.signStudy(
      userId,
      studyId,
      pin,
      SignatureType.TECHNICIAN_VERIFY,
      study
    );

    console.log('Study signed successfully', signature);
    // Update study status
    await this.studyRepo.update(studyId, {
      studyStatus: DicomStudyStatus.TECHNICIAN_VERIFIED,
      performingTechnicianId: userId,
    });
    this.logger.log(
      `Technician ${userId} verified study ${studyId} successfully`
    );

    return {
      message: 'Study verified successfully',
      study: {
        id: study.id,
        // status: study.studyStatus,
        verifiedAt: signature.signedAt,
      },
    };
  }

  async physicianApproveStudy(userId: string, studyId: string, pin: string) {
    await this.ensureUserHasDigitalSignature(userId);
    const study = await this.studyRepo.findOne({
      where: { id: studyId },
      relations: ['studySignatures'],
    });

    if (!study) {
      throw new ResourceNotFoundException('DicomStudy', studyId);
    }

    // if (study.studyStatus !== DicomStudyStatus.TECHNICIAN_VERIFIED) {
    //   throw new InvalidStudyStatusException(
    //     study.studyStatus,
    //     DicomStudyStatus.SCANNED,
    //     studyId
    //   );
    // }

    const existingSignature = study.studySignatures?.find(
      (s) => s.signatureType === SignatureType.PHYSICIAN_APPROVE
    );

    if (existingSignature) {
      throw new DigitalSignatureAlreadyExistsException(userId);
    }

    // 4. Sign the study
    const signature = await this.signStudy(
      userId,
      studyId,
      pin,
      SignatureType.PHYSICIAN_APPROVE,
      study
    );

    await this.studyRepo.update(studyId, {
      studyStatus: DicomStudyStatus.APPROVED,
      verifyingRadiologistId: userId,
    });
    this.logger.log(
      `Radiologist ${userId} approved study ${studyId} successfully`
    );

    return {
      message: 'Study approved successfully',
      study: {
        id: study.id,
        // status: study.studyStatus,
        approvedAt: signature.signedAt,
      },
    };
  }

  private async signStudy(
    userId: string,
    studyId: string,
    pin: string,
    signatureType: SignatureType,
    study: DicomStudy
  ): Promise<DicomStudySignature> {
    const dataToSign = JSON.stringify({
      studyId: studyId,
      studyInstanceUid: study.studyInstanceUid,
      patientId: study.patientId,
      studyDate: study.studyDate,
      signatureType,
      timestamp: new Date().toISOString(),
    });

    try {
      const signResult = await firstValueFrom(
        this.userServiceClient.send('digital-signature.sign', {
          userId,
          pin,
          data: dataToSign,
        })
      );

      if (!signResult || !signResult.signature) {
        throw new SignatureCreationFailedException(studyId, signatureType);
      }
      console.log('signResult', signResult);

      //  Get digital signature info
      const digitalSignature = await firstValueFrom(
        this.userServiceClient.send('digital-signature.getById', {
          id: signResult.signatureId,
        })
      );

      console.log('digitalSignature', digitalSignature);
      /**
       * digitalSignature {
          message: 'Digital signature retrieved successfully',
          signature: {
            id: '2db00c79-10fd-48b1-8bad-8eda2b8c61ff',
            signedData: '',
            certificateSerial: 'USER_CERT_34f28329-a994-4992-a91d-d8943963ed39',
            algorithm: 'RSA-SHA256',
       */

      const studySignature = this.signatureRepo.create({
        studyId: studyId,
        signatureId: signResult.signatureId,
        // study,
        userId,
        signatureType,
        signedData: dataToSign,
        signatureValue: signResult.signature,
        publicKey: signResult.publicKey,
        certificateSerial: digitalSignature.signature.certificateSerial,
        algorithm: digitalSignature.signature.algorithm || 'RSA-SHA256',
      });

      this.logger.log('Creating study signature:', {
        studyId: studySignature.studyId,
        signatureId: studySignature.signatureId,
        userId: studySignature.userId,
      });

      await this.signatureRepo.save(studySignature);
      this.logger.log('✅ Study signature saved successfully');

      return studySignature;
    } catch (error: any) {
      this.logger.error('Failed to sign study', error.stack);

      if (error.message?.includes('Invalid PIN')) {
        throw new AuthenticationException('Invalid PIN');
      }

      if (error.message?.includes('not found')) {
        throw new DigitalSignatureSetupRequiredException(
          'Digital signature not found. Please setup digital signature first.'
        );
      }

      throw new SignatureCreationFailedException(studyId, signatureType);
    }
  }

  async verifyStudySignature(studyId: string, signatureType: SignatureType) {
    const signature = await this.signatureRepo.findOne({
      where: { studyId, signatureType },
    });

    if (!signature) {
      throw new StudySignatureNotFoundException(studyId, signatureType);
    }

    try {
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
      throw new SignatureVerificationFailedException(studyId, signatureType);
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
