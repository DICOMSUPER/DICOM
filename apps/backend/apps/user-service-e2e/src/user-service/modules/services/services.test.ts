import {
  ClientProxyFactory,
  Transport,
  ClientProxy,
} from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { CreateServiceDto } from '@backend/shared-domain';

describe('ServicesController (E2E)', () => {
  let client: ClientProxy;

  jest.setTimeout(20000); // tăng timeout nếu microservice phản hồi chậm

  beforeAll(() => {
    client = ClientProxyFactory.create({
      transport: Transport.TCP,
      options: { host: 'localhost', port: 5002 },
    });
  });

  afterAll(async () => {
    await client.close();
  });

  // Helper: Tạo service và trả về id
  const createTestService = async (suffix: string) => {
    const payload: CreateServiceDto = {
      serviceCode: `S_${Date.now()}_${suffix}`,
      serviceName: `Test${Date.now()}_${suffix}`,
      description: 'Test description',
      isActive: true,
    };
    const result = await firstValueFrom(
      client.send<any>('UserService.Services.Create', payload)
    );
    return { ...payload, id: result.id };
  };

  // Helper: Xử lý lỗi RpcException
  const getErrorMessage = (error: any) => {
    return error?.message || error?.response?.message || JSON.stringify(error);
  };

  it('should create a new service', async () => {
    const service = await createTestService('c');
    expect(service.id).toBeDefined();
  });

  it('should not allow duplicate service code', async () => {
    const original = await createTestService('d');
    const payload: CreateServiceDto = {
      serviceCode: original.serviceCode,
      serviceName: original.serviceName + '_other',
      description: 'Duplicate code test',
      isActive: true,
    };
    try {
      await firstValueFrom(client.send('UserService.Services.Create', payload));
      fail('Expected duplicate code error');
    } catch (error: any) {
      const msg = getErrorMessage(error);
      expect(msg.toLowerCase()).toMatch(/already exists|code/);
    }
  });

  it('should not allow duplicate service name', async () => {
    const original = await createTestService('dN');
    const payload: CreateServiceDto = {
      serviceCode: original.serviceCode + '_new',
      serviceName: original.serviceName,
      description: 'Duplicate name test',
      isActive: true,
    };
    try {
      await firstValueFrom(client.send('UserService.Services.Create', payload));
      fail('Expected duplicate name error');
    } catch (error: any) {
      const msg = getErrorMessage(error);
      expect(msg.toLowerCase()).toMatch(/already exists|name/);
    }
  });

  it('should get all services', async () => {
    const result = await firstValueFrom(
      client.send('UserService.Services.FindAll', {})
    );
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
  });

  it('should update and delete service', async () => {
    const service = await createTestService('uD');
    // update
    const updatePayload = {
      id: service.id,
      updateServiceDto: {
        serviceName: service.serviceName + ' Updated',
        description: 'Updated',
      },
    };
    const updated = await firstValueFrom(
      client.send('UserService.Services.Update', updatePayload)
    );
    expect(updated.serviceName).toBe(service.serviceName + ' Updated');

    // delete
    const deleted = await firstValueFrom(
      client.send('UserService.Services.Delete', { id: service.id })
    );
    expect(deleted).toBe(true);

    // check not found
    try {
      await firstValueFrom(
        client.send('UserService.Services.FindOne', { id: service.id })
      );
      fail('Expected not found error');
    } catch (error: any) {
      const msg = getErrorMessage(error);
      expect(msg.toLowerCase()).toMatch(/not found/);
    }
  });

  it('should get paginated services and stats', async () => {
    const paginated = await firstValueFrom(
      client.send('UserService.Services.FindMany', {
        paginationDto: { page: 1, limit: 5 },
      })
    );
    expect(paginated).toBeDefined();
    expect(Array.isArray(paginated.data)).toBe(true);

    const stats = await firstValueFrom(
      client.send('UserService.Services.GetStats', {})
    );
    expect(stats.totalServices).toBeDefined();
  });
});
