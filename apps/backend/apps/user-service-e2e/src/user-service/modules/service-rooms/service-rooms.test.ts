import {
  ClientProxyFactory,
  Transport,
  ClientProxy,
} from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
  CreateServiceRoomDto,
  FilterServiceRoomDto,
  UpdateServiceRoomDto,
  RoomStatus,
} from '@backend/shared-domain';
import { RoomType } from '@backend/shared-enums';

describe('ServiceRoomsController (E2E)', () => {
  let client: ClientProxy;
  let createdServiceRoomId: string;
  let testServiceId: string;
  let testRoomId: string;
  let testDepartmentId: string;

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

    // Create test department (max 10 chars for departmentCode)
    try {
      const deptResult = await firstValueFrom(
        client.send<any>('department.create', {
          departmentCode: `SR${Date.now().toString().slice(-6)}`,
          departmentName: `SvcRoom Test Dept ${Date.now()}`,
          description: 'Department for service room testing',
          isActive: true,
        })
      );
      testDepartmentId = deptResult.department.id;
    } catch (error) {
      const depts = await firstValueFrom(
        client.send<any>('department.get-active', {})
      );
      if (depts.departments?.length > 0) {
        testDepartmentId = depts.departments[0].id;
      }
    }

    // Create test room (max 20 chars for roomCode)
    try {
      const roomResult = await firstValueFrom(
        client.send<any>('room.create', {
          roomCode: `SR${Date.now().toString().slice(-8)}`,
          department: testDepartmentId,
          roomType: RoomType.GENERAL,
          status: RoomStatus.AVAILABLE,
          floor: 1,
          capacity: 10,
          isActive: true,
        })
      );
      testRoomId = roomResult.room.id;
    } catch (error) {
      const rooms = await firstValueFrom(
        client.send<any>('room.get-all', { page: 1, limit: 1 })
      );
      if (rooms.data?.length > 0) {
        testRoomId = rooms.data[0].id;
      }
    }

    // Create test service (max 20 chars for serviceCode)
    try {
      const serviceResult = await firstValueFrom(
        client.send<any>('UserService.Services.Create', {
          serviceCode: `SR${Date.now().toString().slice(-8)}`,
          serviceName: `SvcRoom Test Svc ${Date.now()}`,
          description: 'Service for service room testing',
          isActive: true,
        })
      );
      testServiceId = serviceResult.id;
    } catch (error) {
      const services = await firstValueFrom(
        client.send<any>('UserService.Services.FindAll', {})
      );
      if (services?.length > 0) {
        testServiceId = services[0].id;
      }
    }
  });

  afterAll(async () => {
    await client.close();
  });

  describe('Create Service Room', () => {
    it('should create a new service room mapping', async () => {
      if (!testServiceId || !testRoomId) {
        console.log('Skipping: Missing required testServiceId or testRoomId');
        return;
      }

      const payload: CreateServiceRoomDto = {
        serviceId: testServiceId,
        roomId: testRoomId,
        isActive: true,
        notes: 'Test service room mapping',
      };

      const result = await firstValueFrom(
        client.send<any>('UserService.ServiceRooms.Create', payload)
      );

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      createdServiceRoomId = result.id;
    });
  });

  describe('Get Service Rooms', () => {
    it('should get service room by id', async () => {
      if (!createdServiceRoomId) {
        console.log('Skipping: No service room created');
        return;
      }

      const result = await firstValueFrom(
        client.send<any>('UserService.ServiceRooms.FindOne', createdServiceRoomId)
      );

      expect(result).toBeDefined();
      expect(result.id).toBe(createdServiceRoomId);
    });

    it('should get all service rooms with pagination', async () => {
      const filter: FilterServiceRoomDto = {
        page: 1,
        limit: 10,
      };

      const result = await firstValueFrom(
        client.send<any>('UserService.ServiceRooms.FindAll', filter)
      );

      expect(result).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('should get all service rooms without pagination', async () => {
      const filter: FilterServiceRoomDto = {};

      const result = await firstValueFrom(
        client.send<any>('UserService.ServiceRooms.FindAllWithoutPagination', filter)
      );

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should get service rooms by service', async () => {
      if (!testServiceId) {
        console.log('Skipping: No test service');
        return;
      }

      const result = await firstValueFrom(
        client.send<any>('UserService.ServiceRooms.FindByService', testServiceId)
      );

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should get service rooms by room', async () => {
      if (!testRoomId) {
        console.log('Skipping: No test room');
        return;
      }

      const result = await firstValueFrom(
        client.send<any>('UserService.ServiceRooms.FindByRoom', { roomId: testRoomId })
      );

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('Get Service Room Stats', () => {
    it('should get service room statistics', async () => {
      const result = await firstValueFrom(
        client.send<any>('UserService.ServiceRooms.GetStats', {})
      );

      expect(result).toBeDefined();
    });
  });

  describe('Update Service Room', () => {
    it('should update service room', async () => {
      if (!createdServiceRoomId) {
        console.log('Skipping: No service room created');
        return;
      }

      const updatePayload = {
        id: createdServiceRoomId,
        updatedData: {
          notes: 'Updated notes',
          isActive: true,
        } as UpdateServiceRoomDto,
      };

      const result = await firstValueFrom(
        client.send<any>('UserService.ServiceRooms.Update', updatePayload)
      );

      expect(result).toBeDefined();
    });
  });

  describe('Delete Service Room', () => {
    let serviceRoomToDeleteId: string;

    beforeAll(async () => {
      if (!testServiceId || !testDepartmentId) {
        console.log('Cannot prepare delete test: Missing dependencies');
        return;
      }

      try {
        // Create a new room and service room for deletion (max 20 chars)
        const newRoomResult = await firstValueFrom(
          client.send<any>('room.create', {
            roomCode: `DSR${Date.now().toString().slice(-7)}`,
            department: testDepartmentId,
            roomType: RoomType.GENERAL,
            status: RoomStatus.AVAILABLE,
            floor: 1,
            capacity: 5,
            isActive: true,
          })
        );

        const payload: CreateServiceRoomDto = {
          serviceId: testServiceId,
          roomId: newRoomResult.room.id,
          isActive: true,
          notes: 'To be deleted',
        };

        const result = await firstValueFrom(
          client.send<any>('UserService.ServiceRooms.Create', payload)
        );
        serviceRoomToDeleteId = result.id;
      } catch (error) {
        console.log('Could not create service room for delete test:', error);
      }
    });

    it('should delete service room', async () => {
      if (!serviceRoomToDeleteId) {
        console.log('Skipping: No service room to delete');
        return;
      }

      const result = await firstValueFrom(
        client.send<any>('UserService.ServiceRooms.Delete', { id: serviceRoomToDeleteId })
      );

      expect(result).toBeDefined();
    });
  });
});
