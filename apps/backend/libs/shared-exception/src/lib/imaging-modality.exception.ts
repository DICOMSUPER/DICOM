import { RpcException } from '@nestjs/microservices';
import { HttpStatus } from '@nestjs/common';

// ─────────────────────────────────────────────
// Imaging Modality Exceptions (for microservices)
// ─────────────────────────────────────────────

export class ImagingModalityNotFoundException extends RpcException {
  constructor(imagingModalityId?: string) {
    super({
      statusCode: HttpStatus.NOT_FOUND,
      message: `Imaging Modality${imagingModalityId ? ` '${imagingModalityId}'` : ''} not found`,
      errorCode: 'IMAGING_MODALITY_NOT_FOUND',
      details: { imagingModalityId },
    });
  }
}

export class ImagingModalityAlreadyExistsException extends RpcException {
  constructor(field: string = 'code', value?: string) {
    super({
      statusCode: HttpStatus.CONFLICT,
      message: `Imaging Modality with ${field}${value ? ` '${value}'` : ''} already exists`,
      errorCode: 'IMAGING_MODALITY_ALREADY_EXISTS',
      details: { field, value },
    });
  }
}

export class ImagingModalityCreationFailedException extends RpcException {
  constructor(details?: any) {
    super({
      statusCode: HttpStatus.BAD_REQUEST,
      message: 'Failed to create imaging modality',
      errorCode: 'IMAGING_MODALITY_CREATION_FAILED',
      details,
    });
  }
}

export class ImagingModalityUpdateFailedException extends RpcException {
  constructor(imagingModalityId?: string, details?: any) {
    super({
      statusCode: HttpStatus.BAD_REQUEST,
      message: `Failed to update imaging modality${imagingModalityId ? ` '${imagingModalityId}'` : ''}`,
      errorCode: 'IMAGING_MODALITY_UPDATE_FAILED',
      details: { imagingModalityId, ...details },
    });
  }
}

export class ImagingModalityDeletionFailedException extends RpcException {
  constructor(message?: string, imagingModalityId?: string) {
    super({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: message || `Failed to delete imaging modality${imagingModalityId ? ` '${imagingModalityId}'` : ''}`,
      errorCode: 'IMAGING_MODALITY_DELETION_FAILED',
      details: { imagingModalityId },
    });
  }
}
