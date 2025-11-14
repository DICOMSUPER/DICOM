import { RpcException } from '@nestjs/microservices';
import { HttpStatus } from '@nestjs/common';

// ─────────────────────────────────────────────
// USER / AUTH EXCEPTIONS
// ─────────────────────────────────────────────

export class InvalidCredentialsException extends RpcException {
  constructor(details?: any) {
    super({
      statusCode: HttpStatus.UNAUTHORIZED,
      message: 'Invalid credentials',
      errorCode: 'INVALID_CREDENTIALS',
      details,
    });
  }
}

export class UserAlreadyExistsException extends RpcException {
  constructor(username?: string) {
    super({
      statusCode: HttpStatus.CONFLICT,
      message: `User${username ? ` '${username}'` : ''} already exists`,
      errorCode: 'USER_ALREADY_EXISTS',
      details: { username },
    });
  }
}

export class UserNotFoundException extends RpcException {
  constructor(userId?: string, message?: string) {
    console.log(userId)
    console.log(message)
    super({
      statusCode: HttpStatus.NOT_FOUND,
      message: message ?? `User${userId ? ` '${userId}'` : ''} not found`,
      errorCode: 'USER_NOT_FOUND',
      details: { userId },
    });
  }
}

export class OtpVerificationFailedException extends RpcException {
  constructor(details?: any) {
    super({
      statusCode: HttpStatus.BAD_REQUEST,
      message: 'OTP verification failed',
      errorCode: 'OTP_VERIFICATION_FAILED',
      details,
    });
  }
}

export class RegistrationFailedException extends RpcException {
  constructor(details?: any) {
    super({
      statusCode: HttpStatus.BAD_REQUEST,
      message: 'Registration failed',
      errorCode: 'REGISTRATION_FAILED',
      details,
    });
  }
}

export class OtpGenerationFailedException extends RpcException {
  constructor(details?: any) {
    super({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Failed to generate OTP',
      errorCode: 'OTP_GENERATION_FAILED',
      details,
    });
  }
}

export class TokenGenerationFailedException extends RpcException {
  constructor(details?: any) {
    super({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Failed to generate token',
      errorCode: 'TOKEN_GENERATION_FAILED',
      details,
    });
  }
}

export class UnauthorizedException extends RpcException {
  constructor(details?: any) {
    super({
      statusCode: HttpStatus.UNAUTHORIZED,
      message: 'Unauthorized access',
      errorCode: 'UNAUTHORIZED',
      details,
    });
  }
}

export class ForbiddenException extends RpcException {
  constructor(details?: any) {
    super({
      statusCode: HttpStatus.FORBIDDEN,
      message: 'Access forbidden',
      errorCode: 'FORBIDDEN',
      details,
    });
  }
}
