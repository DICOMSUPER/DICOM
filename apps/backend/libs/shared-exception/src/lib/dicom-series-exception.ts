import { HttpStatus } from '@nestjs/common';
import { CustomException } from './custom-exceptions';

/**
 * Các exception liên quan đến xử lý DICOM Series
 */

export class DicomSeriesNotFoundException extends CustomException {
  constructor(details?: any) {
    super(
      'Dicom series not found',
      HttpStatus.NOT_FOUND,
      'DICOM_SERIES_NOT_FOUND',
      details,
    );
  }
}

export class DicomSeriesStudyNotFoundException extends CustomException {
  constructor(details?: any) {
    super(
      'Dicom study not found',
      HttpStatus.BAD_REQUEST,
      'DICOM_STUDY_NOT_FOUND',
      details,
    );
  }
}

export class DicomSeriesInvalidModeException extends CustomException {
  constructor(details?: any) {
    super(
      'Invalid mode for updating number of series',
      HttpStatus.BAD_REQUEST,
      'DICOM_SERIES_INVALID_MODE',
      details,
    );
  }
}

export class DicomSeriesStudyProcessException extends CustomException {
  constructor(details?: any) {
    super(
      'Failed to process dicom study',
      HttpStatus.BAD_REQUEST,
      'DICOM_STUDY_PROCESS_ERROR',
      details,
    );
  }
}

export class DicomSeriesInternalException extends CustomException {
  constructor(details?: any) {
    super(
      'Internal Server Error while processing DICOM series',
      HttpStatus.INTERNAL_SERVER_ERROR,
      'DICOM_SERIES_INTERNAL_ERROR',
      details,
    );
  }
}
