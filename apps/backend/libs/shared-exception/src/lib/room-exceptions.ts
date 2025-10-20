import { RpcException } from '@nestjs/microservices';
import { HttpStatus } from '@nestjs/common';

// ─────────────────────────────────────────────
// ROOM EXCEPTIONS
// ─────────────────────────────────────────────

export class RoomNotFoundException extends RpcException {
  constructor(roomId?: string) {
    super({
      statusCode: HttpStatus.NOT_FOUND,
      message: `Room${roomId ? ` '${roomId}'` : ''} not found`,
      errorCode: 'ROOM_NOT_FOUND',
      details: { roomId },
    });
  }
}

export class RoomAlreadyExistsException extends RpcException {
  constructor(field: string = 'name', value?: string) {
    super({
      statusCode: HttpStatus.CONFLICT,
      message: `Room with ${field}${value ? ` '${value}'` : ''} already exists`,
      errorCode: 'ROOM_ALREADY_EXISTS',
      details: { field, value },
    });
  }
}

export class RoomCreationFailedException extends RpcException {
  constructor(details?: any) {
    super({
      statusCode: HttpStatus.BAD_REQUEST,
      message: 'Failed to create room',
      errorCode: 'ROOM_CREATION_FAILED',
      details,
    });
  }
}

export class RoomUpdateFailedException extends RpcException {
  constructor(roomId?: string, details?: any) {
    super({
      statusCode: HttpStatus.BAD_REQUEST,
      message: `Failed to update room${roomId ? ` '${roomId}'` : ''}`,
      errorCode: 'ROOM_UPDATE_FAILED',
      details: { roomId, ...details },
    });
  }
}

export class RoomDeletionFailedException extends RpcException {
  constructor(roomId?: string, details?: any) {
    super({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: `Failed to delete room${roomId ? ` '${roomId}'` : ''}`,
      errorCode: 'ROOM_DELETION_FAILED',
      details: { roomId, ...details },
    });
  }
}

export class RoomAccessDeniedException extends RpcException {
  constructor(roomId?: string) {
    super({
      statusCode: HttpStatus.FORBIDDEN,
      message: `Access to room${roomId ? ` '${roomId}'` : ''} denied`,
      errorCode: 'ROOM_ACCESS_DENIED',
      details: { roomId },
    });
  }
}

export class RoomNotAvailableException extends RpcException {
  constructor(roomId?: string) {
    super({
      statusCode: HttpStatus.CONFLICT,
      message: `Room${roomId ? ` '${roomId}'` : ''} is not available`,
      errorCode: 'ROOM_NOT_AVAILABLE',
      details: { roomId },
    });
  }
}

export class RoomCapacityExceededException extends RpcException {
  constructor(maxCapacity: number, actual: number) {
    super({
      statusCode: HttpStatus.BAD_REQUEST,
      message: `Room capacity exceeded. Max: ${maxCapacity}, Current: ${actual}`,
      errorCode: 'ROOM_CAPACITY_EXCEEDED',
      details: { maxCapacity, actual },
    });
  }
}

export class InvalidRoomDataException extends RpcException {
  constructor(details?: any) {
    super({
      statusCode: HttpStatus.BAD_REQUEST,
      message: 'Invalid room data provided',
      errorCode: 'INVALID_ROOM_DATA',
      details,
    });
  }
}

export class RoomBookingConflictException extends RpcException {
  constructor(roomId?: string, timeSlot?: any) {
    super({
      statusCode: HttpStatus.CONFLICT,
      message: `Room${roomId ? ` '${roomId}'` : ''} booking conflict`,
      errorCode: 'ROOM_BOOKING_CONFLICT',
      details: { roomId, timeSlot },
    });
  }
}

export class RoomMaintenanceException extends RpcException {
  constructor(roomId?: string) {
    super({
      statusCode: HttpStatus.SERVICE_UNAVAILABLE,
      message: `Room${roomId ? ` '${roomId}'` : ''} is under maintenance`,
      errorCode: 'ROOM_UNDER_MAINTENANCE',
      details: { roomId },
    });
  }
}

export class RoomValidationException extends RpcException {
  constructor(details?: any) {
    super({
      statusCode: HttpStatus.BAD_REQUEST,
      message: 'Room validation failed',
      errorCode: 'ROOM_VALIDATION_FAILED',
      details,
    });
  }
}
