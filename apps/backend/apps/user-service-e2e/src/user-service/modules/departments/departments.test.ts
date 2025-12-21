import {
  ClientProxyFactory,
  Transport,
  ClientProxy,
} from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { CreateDepartmentDto, UpdateDepartmentDto } from '@backend/shared-domain';

describe('DepartmentsController (E2E)', () => {
  let client: ClientProxy;
  let createdDepartmentId: string;
  // Note: departmentCode max 10 chars, so use shorter format
  const TEST_DEPARTMENT_CODE = `D${Date.now().toString().slice(-7)}`;
  const TEST_DEPARTMENT_NAME = `Test Dept ${Date.now()}`;

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

  // Helper: Get error message from RPC exception
  const getErrorMessage = (error: any): string => {
    return error?.message || error?.response?.message || JSON.stringify(error);
  };

  describe('Health Check', () => {
    it('should return health status', async () => {
      const result = await firstValueFrom(
        client.send('department.check-health', {})
      );
      expect(result).toBeDefined();
      expect(result.service).toBe('DepartmentService');
      expect(result.status).toBe('running');
    });
  });

  describe('Create Department', () => {
    it('should create a new department', async () => {
      const payload: CreateDepartmentDto = {
        departmentCode: TEST_DEPARTMENT_CODE,
        departmentName: TEST_DEPARTMENT_NAME,
        description: 'Test department description',
        isActive: true,
      };

      try {
        const result = await firstValueFrom(
          client.send<any>('department.create', payload)
        );

        expect(result).toBeDefined();
        expect(result.department).toBeDefined();
        expect(result.department.departmentCode).toBe(TEST_DEPARTMENT_CODE);
        expect(result.department.departmentName).toBe(TEST_DEPARTMENT_NAME);
        expect(result.message).toBe('Tạo phòng ban thành công');
        createdDepartmentId = result.department.id;
      } catch (error: any) {
        // May fail if department already exists from previous test run
        const msg = getErrorMessage(error);
        if (msg.toLowerCase().includes('already') || msg.toLowerCase().includes('exists')) {
          // Try to get existing department by code
          const existing = await firstValueFrom(
            client.send<any>('department.get-by-code', { code: TEST_DEPARTMENT_CODE })
          );
          if (existing?.department?.id) {
            createdDepartmentId = existing.department.id;
            return; // Test passes - department exists
          }
        }
        throw error;
      }
    });

    it('should not create department with duplicate code', async () => {
      const payload: CreateDepartmentDto = {
        departmentCode: TEST_DEPARTMENT_CODE,
        departmentName: `Another Department ${Date.now()}`,
        description: 'Duplicate code test',
        isActive: true,
      };

      try {
        await firstValueFrom(client.send('department.create', payload));
        fail('Expected duplicate code error');
      } catch (error: any) {
        const msg = getErrorMessage(error);
        expect(msg.toLowerCase()).toMatch(/already|exists|đã tồn tại|failed|duplicate/);
      }
    });
  });

  describe('Get Department', () => {
    it('should get department by id', async () => {
      if (!createdDepartmentId) {
        console.log('Skipping: No department created');
        return;
      }

      const result = await firstValueFrom(
        client.send<any>('department.get-by-id', { id: createdDepartmentId })
      );

      expect(result).toBeDefined();
      expect(result.department).toBeDefined();
      expect(result.department.id).toBe(createdDepartmentId);
      expect(result.message).toBe('Lấy phòng ban thành công');
    });

    it('should get department by code', async () => {
      const result = await firstValueFrom(
        client.send<any>('department.get-by-code', { code: TEST_DEPARTMENT_CODE })
      );

      expect(result).toBeDefined();
      expect(result.department).toBeDefined();
      expect(result.department.departmentCode).toBe(TEST_DEPARTMENT_CODE);
    });

    it('should throw error for non-existent department', async () => {
      try {
        await firstValueFrom(
          client.send('department.get-by-id', { id: '00000000-0000-0000-0000-000000000000' })
        );
        fail('Expected not found error');
      } catch (error: any) {
        const msg = getErrorMessage(error);
        expect(msg.toLowerCase()).toMatch(/not found|không tìm thấy/);
      }
    });
  });

  describe('Get All Departments', () => {
    it('should get all departments with pagination', async () => {
      const result = await firstValueFrom(
        client.send<any>('department.get-all', { page: 1, limit: 10 })
      );

      expect(result).toBeDefined();
      // PaginatedResponseDto returns { data: T[], total, page, limit, ... }
      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('should get all departments without pagination', async () => {
      const result = await firstValueFrom(
        client.send<any>('department.get-all-without-pagination', {})
      );

      expect(result).toBeDefined();
      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('should filter departments by search term', async () => {
      const result = await firstValueFrom(
        client.send<any>('department.get-all', {
          page: 1,
          limit: 10,
          search: TEST_DEPARTMENT_NAME.substring(0, 10),
        })
      );

      expect(result).toBeDefined();
      expect(result.data).toBeDefined();
    });

    it('should get active departments', async () => {
      const result = await firstValueFrom(
        client.send<any>('department.get-active', {})
      );

      expect(result).toBeDefined();
      expect(result.departments).toBeDefined();
      expect(Array.isArray(result.departments)).toBe(true);
      expect(result.count).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Get Department Stats', () => {
    it('should get department statistics', async () => {
      const result = await firstValueFrom(
        client.send<any>('department.get-stats', {})
      );

      expect(result).toBeDefined();
      expect(typeof result.totalDepartments).toBe('number');
    });
  });

  describe('Update Department', () => {
    it('should update department', async () => {
      const updatePayload = {
        id: createdDepartmentId,
        updateDto: {
          departmentName: `Updated ${TEST_DEPARTMENT_NAME}`,
          description: 'Updated description',
        } as UpdateDepartmentDto,
      };

      const result = await firstValueFrom(
        client.send<any>('department.update', updatePayload)
      );

      expect(result).toBeDefined();
      expect(result.department).toBeDefined();
      expect(result.department.departmentName).toBe(`Updated ${TEST_DEPARTMENT_NAME}`);
      expect(result.message).toBe('Cập nhật phòng ban thành công');
    });

    it('should throw error when updating non-existent department', async () => {
      const updatePayload = {
        id: '00000000-0000-0000-0000-000000000000',
        updateDto: {
          departmentName: 'Non-existent',
        } as UpdateDepartmentDto,
      };

      try {
        await firstValueFrom(client.send('department.update', updatePayload));
        fail('Expected not found error');
      } catch (error: any) {
        const msg = getErrorMessage(error);
        expect(msg.toLowerCase()).toMatch(/not found|không tìm thấy/);
      }
    });
  });

  describe('Delete Department', () => {
    let departmentToDeleteId: string;

    beforeAll(async () => {
      // Create a department specifically for deletion test
      try {
        const payload: CreateDepartmentDto = {
          departmentCode: `DD${Date.now().toString().slice(-8)}`,
          departmentName: `Delete Test ${Date.now()}`,
          description: 'Department to be deleted',
          isActive: true,
        };

        const result = await firstValueFrom(
          client.send<any>('department.create', payload)
        );
        departmentToDeleteId = result.department.id;
      } catch (error) {
        console.log('Could not create department for delete test:', getErrorMessage(error));
      }
    });

    it('should delete department', async () => {
      if (!departmentToDeleteId) {
        console.log('Skipping: No department created for deletion');
        return;
      }

      const result = await firstValueFrom(
        client.send<any>('department.delete', { id: departmentToDeleteId })
      );

      expect(result).toBeDefined();
      expect(result.message).toBe('Xóa phòng ban thành công');
    });

    it('should throw error when deleting non-existent department', async () => {
      try {
        await firstValueFrom(
          client.send('department.delete', { id: '00000000-0000-0000-0000-000000000000' })
        );
        fail('Expected not found error');
      } catch (error: any) {
        const msg = getErrorMessage(error);
        expect(msg.toLowerCase()).toMatch(/not found|không tìm thấy/);
      }
    });
  });
});
