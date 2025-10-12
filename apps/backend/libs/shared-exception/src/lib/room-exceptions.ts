import { RpcException } from '@nestjs/microservices';
import { HttpStatus } from '@nestjs/common';

export class RoomNotFoundException extends RpcException {
  constructor(message: string = 'Room not found') {
    super({
      message,
      statusCode: HttpStatus.NOT_FOUND,
      error: 'ROOM_NOT_FOUND'
    });
  }
}

export class RoomAlreadyExistsException extends RpcException {
  constructor(message: string = 'Room already exists') {
    super({
      message,
      statusCode: HttpStatus.CONFLICT,
      error: 'ROOM_ALREADY_EXISTS'
    });
  }
}

export class RoomCreationFailedException extends RpcException {
  constructor(message: string = 'Failed to create room') {
    super({
      message,
      statusCode: HttpStatus.BAD_REQUEST,
      error: 'ROOM_CREATION_FAILED'
    });
  }
}

export class RoomUpdateFailedException extends RpcException {
  constructor(message: string = 'Failed to update room') {
    super({
      message,
      statusCode: HttpStatus.BAD_REQUEST,
      error: 'ROOM_UPDATE_FAILED'
    });
  }
}

export class RoomDeletionFailedException extends RpcException {
  constructor(message: string = 'Failed to delete room') {
    super({
      message,
      statusCode: HttpStatus.BAD_REQUEST,
      error: 'ROOM_DELETION_FAILED'
    });
  }
}

export class RoomAccessDeniedException extends RpcException {
  constructor(message: string = 'Access to room denied') {
    super({
      message,
      statusCode: HttpStatus.FORBIDDEN,
      error: 'ROOM_ACCESS_DENIED'
    });
  }
}

export class RoomNotAvailableException extends RpcException {
  constructor(message: string = 'Room is not available') {
    super({
      message,
      statusCode: HttpStatus.CONFLICT,
      error: 'ROOM_NOT_AVAILABLE'
    });
  }
}

export class RoomCapacityExceededException extends RpcException {
  constructor(message: string = 'Room capacity exceeded') {
    super({
      message,
      statusCode: HttpStatus.BAD_REQUEST,
      error: 'ROOM_CAPACITY_EXCEEDED'
    });
  }
}

export class InvalidRoomDataException extends RpcException {
  constructor(message: string = 'Invalid room data provided') {
    super({
      message,
      statusCode: HttpStatus.BAD_REQUEST,
      error: 'INVALID_ROOM_DATA'
    });
  }
}

export class RoomBookingConflictException extends RpcException {
  constructor(message: string = 'Room booking conflict') {
    super({
      message,
      statusCode: HttpStatus.CONFLICT,
      error: 'ROOM_BOOKING_CONFLICT'
    });
  }
}

export class RoomMaintenanceException extends RpcException {
  constructor(message: string = 'Room is under maintenance') {
    super({
      message,
      statusCode: HttpStatus.SERVICE_UNAVAILABLE,
      error: 'ROOM_UNDER_MAINTENANCE'
    });
  }
}

export class RoomValidationException extends RpcException {
  constructor(message: string = 'Room validation failed') {
    super({
      message,
      statusCode: HttpStatus.BAD_REQUEST,
      error: 'ROOM_VALIDATION_FAILED'
    });
  }
}