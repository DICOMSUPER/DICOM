import { RpcException } from '@nestjs/microservices';
import { HttpStatus } from '@nestjs/common';

export class InvalidCredentialsException extends RpcException {
    constructor(message: string = 'Invalid credentials') {
        super({
            statusCode: HttpStatus.UNAUTHORIZED,
            message,
            error: 'INVALID_CREDENTIALS'
        });
    }
}

export class UserAlreadyExistsException extends RpcException {
    constructor(message: string = 'User already exists') {
        super({
            statusCode: HttpStatus.CONFLICT,
            message,
            error: 'USER_ALREADY_EXISTS'
        });
    }
}

export class UserNotFoundException extends RpcException {
    constructor(message: string = 'User not found') {
        super({
            statusCode: HttpStatus.NOT_FOUND,
            message,
            error: 'USER_NOT_FOUND'
        });
    }
}

export class OtpVerificationFailedException extends RpcException {
    constructor(message: string = 'OTP verification failed') {
        super({
            statusCode: HttpStatus.BAD_REQUEST,
            message,
            error: 'OTP_VERIFICATION_FAILED'
        });
    }
}

export class RegistrationFailedException extends RpcException {
    constructor(message: string = 'Registration failed') {
        super({
            statusCode: HttpStatus.BAD_REQUEST,
            message,
            error: 'REGISTRATION_FAILED'
        });
    }
}

// Thêm 2 exception mới
export class OtpGenerationFailedException extends RpcException {
    constructor(message: string = 'Failed to generate OTP') {
        super({
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            message,
            error: 'OTP_GENERATION_FAILED'
        });
    }
}

export class TokenGenerationFailedException extends RpcException {
    constructor(message: string = 'Failed to generate token') {
        super({
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            message,
            error: 'TOKEN_GENERATION_FAILED'
        });
    }
}



export class UnauthorizedException extends RpcException {
    constructor(message: string = 'Unauthorized access') {
        super({
            statusCode: HttpStatus.UNAUTHORIZED,
            message,
            error: 'UNAUTHORIZED'
        });
    }
}

export class ForbiddenException extends RpcException {
    constructor(message: string = 'Access forbidden') {
        super({
            statusCode: HttpStatus.FORBIDDEN,
            message,
            error: 'FORBIDDEN'
        });
    }
}

