import { HttpStatus } from '@nestjs/common';
import { CustomException } from './custom-exceptions';

/**
 * Các lỗi liên quan đến xử lý DICOM, viết lại đúng theo cấu trúc CustomException
 */

export class DicomInstanceNotFoundException extends CustomException {
  constructor(details?: any) {
    super(
      'Dicom instance not found',
      HttpStatus.NOT_FOUND,
      'DICOM_INSTANCE_NOT_FOUND',
      details,
    );
  }
}

export class DicomInstanceSeriesNotFoundException extends CustomException {
  constructor(details?: any) {
    super(
      'Dicom series not found',
      HttpStatus.BAD_REQUEST,
      'DICOM_SERIES_NOT_FOUND',
      details,
    );
  }
}

export class DicomInstanceInvalidModeException extends CustomException {
  constructor(details?: any) {
    super(
      'Invalid mode for updating number of instances',
      HttpStatus.BAD_REQUEST,
      'DICOM_INVALID_MODE',
      details,
    );
  }
}

export class DicomInstanceSeriesProcessException extends CustomException {
  constructor(details?: any) {
    super(
      'Failed to process dicom series',
      HttpStatus.BAD_REQUEST,
      'DICOM_SERIES_PROCESS_ERROR',
      details,
    );
  }
}

export class DicomInstanceInternalException extends CustomException {
  constructor(details?: any) {
    super(
      'Internal Server Error while processing DICOM instance',
      HttpStatus.INTERNAL_SERVER_ERROR,
      'DICOM_INTERNAL_ERROR',
      details,
    );
  }
}
