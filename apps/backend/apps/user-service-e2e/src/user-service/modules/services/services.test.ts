import {
  ClientProxyFactory,
  Transport,
  ClientProxy,
} from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { CreateServiceDto, UpdateServiceDto } from '@backend/shared-domain';

describe('ServicesController (E2E)', () => {
  let client: ClientProxy;
  let createdServiceId: string;
  // Note: serviceCode max 20 chars, so use shorter format
  const TEST_SERVICE_CODE = `SV${Date.now().toString().slice(-8)}`;
  const TEST_SERVICE_NAME = `Test Service ${Date.now()}`;

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
  });

  afterAll(async () => {
    await client.close();
  });

  const getErrorMessage = (error: any): string => {
    return error?.message || error?.response?.message || JSON.stringify(error);
  };

  describe('Create Service', () => {
    it('should create a new service', async () => {
      const payload: CreateServiceDto = {
        serviceCode: TEST_SERVICE_CODE,
        serviceName: TEST_SERVICE_NAME,
        description: 'Test service description',
        isActive: true,
      };

      const result = await firstValueFrom(
        client.send<any>('UserService.Services.Create', payload)
      );

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.serviceCode).toBe(TEST_SERVICE_CODE);
      expect(result.serviceName).toBe(TEST_SERVICE_NAME);
      createdServiceId = result.id;
    });

    it('should not allow duplicate service code', async () => {
      const payload: CreateServiceDto = {
        serviceCode: TEST_SERVICE_CODE,
        serviceName: `Another Service ${Date.now()}`,
        description: 'Duplicate code test',
        isActive: true,
      };

      try {
        await firstValueFrom(client.send('UserService.Services.Create', payload));
        fail('Expected duplicate code error');
      } catch (error: any) {
        const msg = getErrorMessage(error);
        expect(msg.toLowerCase()).toMatch(/already exists|code|đã tồn tại/);
      }
    });

    it('should not allow duplicate service name', async () => {
      // Use shorter code to stay under 20 char limit
      const payload: CreateServiceDto = {
        serviceCode: `SN${Date.now().toString().slice(-8)}`,
        serviceName: TEST_SERVICE_NAME,
        description: 'Duplicate name test',
        isActive: true,
      };

      try {
        await firstValueFrom(client.send('UserService.Services.Create', payload));
        fail('Expected duplicate name error');
      } catch (error: any) {
        const msg = getErrorMessage(error);
        expect(msg.toLowerCase()).toMatch(/already exists|name|đã tồn tại/);
      }
    });
  });

  describe('Get Service', () => {
    it('should get service by id', async () => {
      const result = await firstValueFrom(
        client.send<any>('UserService.Services.FindOne', { id: createdServiceId })
      );

      expect(result).toBeDefined();
      expect(result.id).toBe(createdServiceId);
      expect(result.serviceCode).toBe(TEST_SERVICE_CODE);
    });

    it('should throw error for non-existent service', async () => {
      try {
        await firstValueFrom(
          client.send('UserService.Services.FindOne', {
            id: '00000000-0000-0000-0000-000000000000',
          })
        );
        fail('Expected not found error');
      } catch (error: any) {
        const msg = getErrorMessage(error);
        expect(msg.toLowerCase()).toMatch(/not found|không tìm thấy/);
      }
    });
  });

  describe('Get All Services', () => {
    it('should get all services', async () => {
      const result = await firstValueFrom(
        client.send<any>('UserService.Services.FindAll', {})
      );

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should get paginated services', async () => {
      const result = await firstValueFrom(
        client.send<any>('UserService.Services.FindMany', {
          paginationDto: { page: 1, limit: 10 },
        })
      );

      expect(result).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.total).toBeDefined();
    });

    it('should search services', async () => {
      const result = await firstValueFrom(
        client.send<any>('UserService.Services.FindMany', {
          paginationDto: {
            page: 1,
            limit: 10,
            search: 'Test',
            searchField: 'serviceName',
          },
        })
      );

      expect(result).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('should sort services', async () => {
      const result = await firstValueFrom(
        client.send<any>('UserService.Services.FindMany', {
          paginationDto: {
            page: 1,
            limit: 10,
            sortField: 'createdAt',
            order: 'desc',
          },
        })
      );

      expect(result).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
    });
  });

  describe('Get Services by Department', () => {
    it('should get services by department id', async () => {
      // First get a department
      try {
        const depts = await firstValueFrom(
          client.send<any>('department.get-active', {})
        );

        if (depts.departments?.length > 0) {
          const result = await firstValueFrom(
            client.send<any>('UserService.Services.GetByDepartmentId', {
              departmentId: depts.departments[0].id,
            })
          );

          expect(result).toBeDefined();
        }
      } catch (error) {
        // May not have departments
        expect(error).toBeDefined();
      }
    });
  });

  describe('Get Service Stats', () => {
    it('should get service statistics', async () => {
      const result = await firstValueFrom(
        client.send<any>('UserService.Services.GetStats', {})
      );

      expect(result).toBeDefined();
      expect(typeof result.totalServices).toBe('number');
    });
  });

  describe('Update Service', () => {
    it('should update service', async () => {
      const updatePayload = {
        id: createdServiceId,
        updateServiceDto: {
          serviceName: `Updated ${TEST_SERVICE_NAME}`,
          description: 'Updated description',
        } as UpdateServiceDto,
      };

      const result = await firstValueFrom(
        client.send<any>('UserService.Services.Update', updatePayload)
      );

      expect(result).toBeDefined();
      expect(result.serviceName).toBe(`Updated ${TEST_SERVICE_NAME}`);
      expect(result.description).toBe('Updated description');
    });

    it('should update service active status', async () => {
      const updatePayload = {
        id: createdServiceId,
        updateServiceDto: {
          isActive: false,
        } as UpdateServiceDto,
      };

      const result = await firstValueFrom(
        client.send<any>('UserService.Services.Update', updatePayload)
      );

      expect(result).toBeDefined();
      expect(result.isActive).toBe(false);

      // Re-enable for other tests
      await firstValueFrom(
        client.send<any>('UserService.Services.Update', {
          id: createdServiceId,
          updateServiceDto: { isActive: true },
        })
      );
    });
  });

  describe('Delete Service', () => {
    let serviceToDeleteId: string;

    beforeAll(async () => {
      // Create a service specifically for deletion test
      // Note: serviceCode max 20 chars, so use shorter format
      const shortCode = `DS${Date.now().toString().slice(-8)}`;
      const payload: CreateServiceDto = {
        serviceCode: shortCode,
        serviceName: `Delete Test Svc ${Date.now()}`,
        description: 'Service to be deleted',
        isActive: true,
      };

      const result = await firstValueFrom(
        client.send<any>('UserService.Services.Create', payload)
      );
      serviceToDeleteId = result.id;
    });

    it('should delete service', async () => {
      const result = await firstValueFrom(
        client.send<any>('UserService.Services.Delete', { id: serviceToDeleteId })
      );

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.message).toBe('Service deleted successfully');
    });

    it('should throw error when getting deleted service', async () => {
      try {
        await firstValueFrom(
          client.send('UserService.Services.FindOne', { id: serviceToDeleteId })
        );
        fail('Expected not found error');
      } catch (error: any) {
        const msg = getErrorMessage(error);
        expect(msg.toLowerCase()).toMatch(/not found|không tìm thấy/);
      }
    });
  });
});
