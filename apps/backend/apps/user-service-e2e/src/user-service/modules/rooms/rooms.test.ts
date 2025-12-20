import {
  ClientProxyFactory,
  Transport,
  ClientProxy,
} from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { CreateRoomDto, UpdateRoomDto, RoomStatus } from '@backend/shared-domain';
import { RoomType } from '@backend/shared-enums';

describe('RoomsController (E2E)', () => {
  let client: ClientProxy;
  let createdRoomId: string;
  let testDepartmentId: string;
  // Note: roomCode max 20 chars, so use shorter format
  const TEST_ROOM_CODE = `RM${Date.now().toString().slice(-8)}`;

  jest.setTimeout(30000);

  beforeAll(async () => {
    client = ClientProxyFactory.create({
      transport: Transport.TCP,
      options: {
        host: process.env.HOST ?? 'localhost',
        port: process.env.PORT ? Number(process.env.PORT) : 5002,
      },
    });
    await client.connect();

    // Create a test department for room tests (max 10 chars for departmentCode)
    try {
      const deptResult = await firstValueFrom(
        client.send<any>('department.create', {
          departmentCode: `R${Date.now().toString().slice(-7)}`,
          departmentName: `Room Test Dept ${Date.now()}`,
          description: 'Department for room testing',
          isActive: true,
        })
      );
      testDepartmentId = deptResult.department.id;
    } catch (error) {
      // Use existing department if creation fails
      const depts = await firstValueFrom(
        client.send<any>('department.get-active', {})
      );
      if (depts.departments && depts.departments.length > 0) {
        testDepartmentId = depts.departments[0].id;
      }
    }
  });

  afterAll(async () => {
    await client.close();
  });

  // Helper: Get error message from RPC exception
  const getErrorMessage = (error: any): string => {
    return error?.message || error?.response?.message || JSON.stringify(error);
  };

  describe('Health Check', () => {
    it('should return health status', async () => {
      const result = await firstValueFrom(
        client.send('room.check-health', {})
      );
      expect(result).toBeDefined();
      expect(result.service).toBe('RoomService');
      expect(result.status).toBe('running');
    });
  });

  describe('Create Room', () => {
    it('should create a new room', async () => {
      if (!testDepartmentId) {
        console.log('Skipping: No test department available');
        return;
      }

      const payload: CreateRoomDto = {
        roomCode: TEST_ROOM_CODE,
        department: testDepartmentId,
        roomType: RoomType.GENERAL,
        status: RoomStatus.AVAILABLE,
        floor: 1,
        capacity: 10,
        description: 'Test room description',
        isActive: true,
      };

      try {
        const result = await firstValueFrom(
          client.send<any>('room.create', payload)
        );

        expect(result).toBeDefined();
        expect(result.room).toBeDefined();
        expect(result.room.roomCode).toBe(TEST_ROOM_CODE);
        expect(result.message).toBe('Tạo phòng thành công');
        createdRoomId = result.room.id;
      } catch (error: any) {
        // May fail if room already exists
        const msg = getErrorMessage(error);
        if (msg.toLowerCase().includes('already') || msg.toLowerCase().includes('exists')) {
          console.log('Room already exists, trying to get existing');
          return;
        }
        throw error;
      }
    });

    it('should not create room with duplicate code', async () => {
      const payload: CreateRoomDto = {
        roomCode: TEST_ROOM_CODE,
        department: testDepartmentId,
        roomType: RoomType.GENERAL,
        status: RoomStatus.AVAILABLE,
        floor: 1,
        capacity: 10,
        isActive: true,
      };

      try {
        await firstValueFrom(client.send('room.create', payload));
        fail('Expected duplicate code error');
      } catch (error: any) {
        const msg = getErrorMessage(error);
        expect(msg.toLowerCase()).toMatch(/already|exists|đã tồn tại/);
      }
    });
  });

  describe('Get Room', () => {
    it('should get room by id', async () => {
      const result = await firstValueFrom(
        client.send<any>('room.get-by-id', { id: createdRoomId })
      );

      expect(result).toBeDefined();
      expect(result.room).toBeDefined();
      expect(result.room.id).toBe(createdRoomId);
      expect(result.message).toBe('Lấy thông tin phòng thành công');
    });

    it('should throw error for non-existent room', async () => {
      try {
        await firstValueFrom(
          client.send('room.get-by-id', { id: '00000000-0000-0000-0000-000000000000' })
        );
        fail('Expected not found error');
      } catch (error: any) {
        const msg = getErrorMessage(error);
        expect(msg.toLowerCase()).toMatch(/not found|không tìm thấy/);
      }
    });
  });

  describe('Get All Rooms', () => {
    it('should get all rooms with pagination', async () => {
      const result = await firstValueFrom(
        client.send<any>('room.get-all', { page: 1, limit: 10 })
      );

      expect(result).toBeDefined();
      expect(result.data).toBeDefined();
      // PaginatedResponseDto returns { data: T[], total, page, limit, ... }
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('should get all rooms without pagination', async () => {
      const result = await firstValueFrom(
        client.send<any>('room.get-all-without-pagination', {})
      );

      expect(result).toBeDefined();
      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('should filter rooms by department', async () => {
      const result = await firstValueFrom(
        client.send<any>('room.get-all', {
          page: 1,
          limit: 10,
          departmentId: testDepartmentId,
        })
      );

      expect(result).toBeDefined();
      expect(result.data).toBeDefined();
    });

    it('should filter rooms by status', async () => {
      const result = await firstValueFrom(
        client.send<any>('room.get-all', {
          page: 1,
          limit: 10,
          status: RoomStatus.AVAILABLE,
        })
      );

      expect(result).toBeDefined();
      expect(result.data).toBeDefined();
    });

    it('should filter rooms by type', async () => {
      const result = await firstValueFrom(
        client.send<any>('room.get-all', {
          page: 1,
          limit: 10,
          type: RoomType.GENERAL,
        })
      );

      expect(result).toBeDefined();
      expect(result.data).toBeDefined();
    });
  });

  describe('Get Rooms by Department', () => {
    it('should get rooms by department id', async () => {
      const result = await firstValueFrom(
        client.send<any>('room.get-by-department-id', { departmentId: testDepartmentId })
      );

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('should get rooms by department id with advanced options', async () => {
      const result = await firstValueFrom(
        client.send<any>('UserService.Room.GetRoomByDepartmentId', {
          id: testDepartmentId,
          applyScheduleFilter: false,
        })
      );

      expect(result).toBeDefined();
    });
  });

  describe('Get Room Stats', () => {
    it('should get room statistics', async () => {
      const result = await firstValueFrom(
        client.send<any>('room.get-stats', {})
      );

      expect(result).toBeDefined();
      expect(typeof result.totalRooms).toBe('number');
    });
  });

  describe('Get Room IDs', () => {
    it('should get room IDs', async () => {
      const result = await firstValueFrom(
        client.send<any>('UserService.Rooms.GetIds', { take: 10, isActive: true })
      );

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.count).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Get Rooms by IDs', () => {
    it('should get rooms by multiple IDs', async () => {
      const result = await firstValueFrom(
        client.send<any>('UserService.Room.GetRoomsByIds', { ids: [createdRoomId] })
      );

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('Update Room', () => {
    it('should update room', async () => {
      const updatePayload = {
        id: createdRoomId,
        updateRoomDto: {
          description: 'Updated description',
          capacity: 15,
        } as UpdateRoomDto,
      };

      const result = await firstValueFrom(
        client.send<any>('room.update', updatePayload)
      );

      expect(result).toBeDefined();
      expect(result.room).toBeDefined();
      expect(result.room.capacity).toBe(15);
      expect(result.message).toBe('Cập nhật phòng thành công');
    });

    it('should throw error when updating non-existent room', async () => {
      const updatePayload = {
        id: '00000000-0000-0000-0000-000000000000',
        updateRoomDto: {
          description: 'Non-existent',
        } as UpdateRoomDto,
      };

      try {
        await firstValueFrom(client.send('room.update', updatePayload));
        fail('Expected not found error');
      } catch (error: any) {
        const msg = getErrorMessage(error);
        expect(msg.toLowerCase()).toMatch(/not found|không tìm thấy/);
      }
    });
  });

  describe('Delete Room', () => {
    let roomToDeleteId: string;

    beforeAll(async () => {
      if (!testDepartmentId) {
        console.log('Skipping Delete Room setup: No test department');
        return;
      }

      // Create a room specifically for deletion test
      try {
        const payload: CreateRoomDto = {
          roomCode: `DR${Date.now().toString().slice(-8)}`,
          department: testDepartmentId,
          roomType: RoomType.GENERAL,
          status: RoomStatus.AVAILABLE,
          floor: 1,
          capacity: 5,
          isActive: true,
        };

        const result = await firstValueFrom(
          client.send<any>('room.create', payload)
        );
        roomToDeleteId = result.room.id;
      } catch (error) {
        console.log('Could not create room for delete test:', getErrorMessage(error));
      }
    });

    it('should delete room', async () => {
      if (!roomToDeleteId) {
        console.log('Skipping: No room created for deletion');
        return;
      }

      const result = await firstValueFrom(
        client.send<any>('room.delete', { id: roomToDeleteId })
      );

      expect(result).toBeDefined();
      expect(result.message).toBe('Xóa phòng thành công');
    });

    it('should throw error when deleting non-existent room', async () => {
      try {
        await firstValueFrom(
          client.send('room.delete', { id: '00000000-0000-0000-0000-000000000000' })
        );
        fail('Expected not found error');
      } catch (error: any) {
        const msg = getErrorMessage(error);
        expect(msg.toLowerCase()).toMatch(/not found|không tìm thấy/);
      }
    });
  });
});
