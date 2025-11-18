import { RpcException } from '@nestjs/microservices';
import { HttpStatus } from '@nestjs/common';

export class StudySignatureNotFoundException extends RpcException {
  constructor(studyId?: string, signatureType?: string) {
    super({
      statusCode: HttpStatus.NOT_FOUND,
      message: `Study signature${studyId ? ` for study '${studyId}'` : ''}${signatureType ? ` with type '${signatureType}'` : ''} not found`,
      errorCode: 'STUDY_SIGNATURE_NOT_FOUND',
      details: { studyId, signatureType },
    });
  }
}

export class StudySignatureAlreadyExistsException extends RpcException {
  constructor(studyId?: string, signatureType?: string) {
    super({
      statusCode: HttpStatus.CONFLICT,
      message: `Study${studyId ? ` '${studyId}'` : ''} already has ${signatureType || 'this type of'} signature`,
      errorCode: 'STUDY_SIGNATURE_ALREADY_EXISTS',
      details: { studyId, signatureType },
    });
  }
}

export class InvalidStudyStatusException extends RpcException {
  constructor(currentStatus: string, requiredStatus: string, studyId?: string) {
    super({
      statusCode: HttpStatus.BAD_REQUEST,
      message: `Study${studyId ? ` '${studyId}'` : ''} cannot be signed. Current status: '${currentStatus}', required: '${requiredStatus}'`,
      errorCode: 'INVALID_STUDY_STATUS',
      details: { studyId, currentStatus, requiredStatus },
    });
  }
}

export class TechnicianVerificationNotAllowedException extends RpcException {
  constructor(studyId?: string, reason?: string) {
    super({
      statusCode: HttpStatus.FORBIDDEN,
      message: `Technician verification not allowed${studyId ? ` for study '${studyId}'` : ''}${reason ? `: ${reason}` : ''}`,
      errorCode: 'TECHNICIAN_VERIFICATION_NOT_ALLOWED',
      details: { studyId, reason },
    });
  }
}

export class PhysicianApprovalNotAllowedException extends RpcException {
  constructor(studyId?: string, reason?: string) {
    super({
      statusCode: HttpStatus.FORBIDDEN,
      message: `Physician approval not allowed${studyId ? ` for study '${studyId}'` : ''}${reason ? `: ${reason}` : ''}`,
      errorCode: 'PHYSICIAN_APPROVAL_NOT_ALLOWED',
      details: { studyId, reason },
    });
  }
}

export class StudyNotVerifiedByTechnicianException extends RpcException {
  constructor(studyId?: string) {
    super({
      statusCode: HttpStatus.BAD_REQUEST,
      message: `Study${studyId ? ` '${studyId}'` : ''} must be verified by technician before physician approval`,
      errorCode: 'STUDY_NOT_VERIFIED_BY_TECHNICIAN',
      details: { studyId },
    });
  }
}

export class SignatureVerificationFailedException extends RpcException {
  constructor(studyId?: string, signatureType?: string, details?: any) {
    super({
      statusCode: HttpStatus.BAD_REQUEST,
      message: `Signature verification failed${studyId ? ` for study '${studyId}'` : ''}${signatureType ? ` with type '${signatureType}'` : ''}`,
      errorCode: 'SIGNATURE_VERIFICATION_FAILED',
      details: { studyId, signatureType, ...details },
    });
  }
}

export class DigitalSignatureSetupRequiredException extends RpcException {
  constructor(userId?: string) {
    super({
      statusCode: HttpStatus.PRECONDITION_FAILED,
      message: `User${userId ? ` '${userId}'` : ''} must setup digital signature before signing studies`,
      errorCode: 'DIGITAL_SIGNATURE_SETUP_REQUIRED',
      details: { userId },
    });
  }
}

export class InvalidSignaturePinException extends RpcException {
  constructor(userId?: string) {
    super({
      statusCode: HttpStatus.UNAUTHORIZED,
      message: 'Invalid PIN provided for digital signature',
      errorCode: 'INVALID_SIGNATURE_PIN',
      details: { userId },
    });
  }
}

export class SignatureCreationFailedException extends RpcException {
  constructor(studyId?: string, signatureType?: string, details?: any) {
    super({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: `Failed to create signature${studyId ? ` for study '${studyId}'` : ''}${signatureType ? ` with type '${signatureType}'` : ''}`,
      errorCode: 'SIGNATURE_CREATION_FAILED',
      details: { studyId, signatureType, ...details },
    });
  }
}