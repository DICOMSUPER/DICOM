import { RpcException } from '@nestjs/microservices';
import { HttpStatus } from '@nestjs/common';

export class DigitalSignatureNotFoundException extends RpcException {
  constructor(userId?: string) {
    super({
      statusCode: HttpStatus.NOT_FOUND,
      message: `Digital signature${userId ? ` for user '${userId}'` : ''} not found`,
      errorCode: 'DIGITAL_SIGNATURE_NOT_FOUND',
      details: { userId },
    });
  }
}

export class DigitalSignatureAlreadyExistsException extends RpcException {
  constructor(userId?: string) {
    super({
      statusCode: HttpStatus.CONFLICT,
      message: `Digital signature for user${userId ? ` '${userId}'` : ''} already exists`,
      errorCode: 'DIGITAL_SIGNATURE_ALREADY_EXISTS',
      details: { userId },
    });
  }
}

export class InvalidPinException extends RpcException {
  constructor() {
    super({
      statusCode: HttpStatus.UNAUTHORIZED,
      message: 'Invalid PIN provided',
      errorCode: 'INVALID_PIN',
      details: {},
    });
  }
}

export class KeyGenerationFailedException extends RpcException {
  constructor(details?: any) {
    super({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Failed to generate cryptographic keys',
      errorCode: 'KEY_GENERATION_FAILED',
      details,
    });
  }
}

export class EncryptionFailedException extends RpcException {
  constructor(details?: any) {
    super({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Failed to encrypt private key',
      errorCode: 'ENCRYPTION_FAILED',
      details,
    });
  }
}

export class DecryptionFailedException extends RpcException {
  constructor(details?: any) {
    super({
      statusCode: HttpStatus.BAD_REQUEST,
      message: 'Failed to decrypt private key. PIN may be incorrect.',
      errorCode: 'DECRYPTION_FAILED',
      details,
    });
  }
}

export class SigningFailedException extends RpcException {
  constructor(details?: any) {
    super({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Failed to sign data',
      errorCode: 'SIGNING_FAILED',
      details,
    });
  }
}

export class VerificationFailedException extends RpcException {
  constructor(details?: any) {
    super({
      statusCode: HttpStatus.BAD_REQUEST,
      message: 'Signature verification failed',
      errorCode: 'VERIFICATION_FAILED',
      details,
    });
  }
}