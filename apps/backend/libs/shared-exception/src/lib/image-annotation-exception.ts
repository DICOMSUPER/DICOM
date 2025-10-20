import { HttpStatus } from '@nestjs/common';
import { CustomException } from './custom-exceptions';

/**
 * Các exception liên quan đến Image Annotation
 */

export class ImageAnnotationNotFoundException extends CustomException {
  constructor(details?: any) {
    super(
      'Image annotation not found',
      HttpStatus.NOT_FOUND,
      'IMAGE_ANNOTATION_NOT_FOUND',
      details,
    );
  }
}

export class ImageAnnotationInstanceNotFoundException extends CustomException {
  constructor(details?: any) {
    super(
      'Dicom instance not found for annotation',
      HttpStatus.BAD_REQUEST,
      'IMAGE_ANNOTATION_INSTANCE_NOT_FOUND',
      details,
    );
  }
}

export class ImageAnnotationUserNotFoundException extends CustomException {
  constructor(details?: any) {
    super(
      'User not found for annotation',
      HttpStatus.BAD_REQUEST,
      'IMAGE_ANNOTATION_USER_NOT_FOUND',
      details,
    );
  }
}
