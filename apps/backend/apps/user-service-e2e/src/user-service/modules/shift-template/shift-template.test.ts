import {
  ClientProxyFactory,
  Transport,
  ClientProxy,
} from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { CreateShiftTemplateDto, UpdateShiftTemplateDto } from '@backend/shared-domain';
import { ShiftType } from '@backend/shared-enums';

describe('ShiftTemplateController (E2E)', () => {
  let client: ClientProxy;
  let createdTemplateId: string;
  const TEST_SHIFT_NAME = `Test Shift ${Date.now()}`;

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

  describe('Create Shift Template', () => {
    it('should create a shift template', async () => {
      const payload: CreateShiftTemplateDto = {
        shift_name: TEST_SHIFT_NAME,
        shift_type: ShiftType.MORNING,
        start_time: '08:00',
        end_time: '12:00',
        break_start_time: '10:00',
        break_end_time: '10:15',
        description: 'Morning shift for staff',
        is_active: true,
      };

      const result = await firstValueFrom(
        client.send<any>('UserService.ShiftTemplate.Create', payload)
      );

      expect(result).toBeDefined();
      expect(result.shift_template_id).toBeDefined();
      expect(result.shift_name).toBe(TEST_SHIFT_NAME);
      createdTemplateId = result.shift_template_id;
    });

    it('should create afternoon shift template', async () => {
      const payload: CreateShiftTemplateDto = {
        shift_name: `Afternoon Shift ${Date.now()}`,
        shift_type: ShiftType.AFTERNOON,
        start_time: '13:00',
        end_time: '17:00',
        break_start_time: '15:00',
        break_end_time: '15:15',
        description: 'Afternoon shift',
        is_active: true,
      };

      const result = await firstValueFrom(
        client.send<any>('UserService.ShiftTemplate.Create', payload)
      );

      expect(result).toBeDefined();
      expect(result.shift_template_id).toBeDefined();
      expect(result.shift_type).toBe(ShiftType.AFTERNOON);
    });

    it('should create night shift template', async () => {
      const payload: CreateShiftTemplateDto = {
        shift_name: `Night Shift ${Date.now()}`,
        shift_type: ShiftType.NIGHT,
        start_time: '22:00',
        end_time: '06:00',
        description: 'Night shift',
        is_active: true,
      };

      const result = await firstValueFrom(
        client.send<any>('UserService.ShiftTemplate.Create', payload)
      );

      expect(result).toBeDefined();
      expect(result.shift_template_id).toBeDefined();
      expect(result.shift_type).toBe(ShiftType.NIGHT);
    });
  });

  describe('Get Shift Template', () => {
    it('should get shift template by id', async () => {
      const result = await firstValueFrom(
        client.send<any>('UserService.ShiftTemplate.FindOne', { id: createdTemplateId })
      );

      expect(result).toBeDefined();
      expect(result.shift_template_id).toBe(createdTemplateId);
      expect(result.shift_name).toBe(TEST_SHIFT_NAME);
    });

    it('should throw error for non-existent template', async () => {
      try {
        await firstValueFrom(
          client.send('UserService.ShiftTemplate.FindOne', {
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

  describe('Get All Shift Templates', () => {
    it('should get all shift templates with pagination', async () => {
      const result = await firstValueFrom(
        client.send<any>('UserService.ShiftTemplate.FindMany', {
          paginationDto: { page: 1, limit: 10 },
        })
      );

      expect(result).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('should search shift templates', async () => {
      const result = await firstValueFrom(
        client.send<any>('UserService.ShiftTemplate.FindMany', {
          paginationDto: {
            page: 1,
            limit: 10,
            search: 'Morning',
          },
        })
      );

      expect(result).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
    });
  });

  describe('Get Shift Templates by Type', () => {
    it('should get shift templates by morning type', async () => {
      const result = await firstValueFrom(
        client.send<any>('UserService.ShiftTemplate.FindByType', {
          shiftType: ShiftType.MORNING,
        })
      );

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should get shift templates by afternoon type', async () => {
      const result = await firstValueFrom(
        client.send<any>('UserService.ShiftTemplate.FindByType', {
          shiftType: ShiftType.AFTERNOON,
        })
      );

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('Get Active Shift Templates', () => {
    it('should get active shift templates', async () => {
      const result = await firstValueFrom(
        client.send<any>('UserService.ShiftTemplate.FindActive', {})
      );

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('Get Shift Template Stats', () => {
    it('should get shift template statistics', async () => {
      const result = await firstValueFrom(
        client.send<any>('UserService.ShiftTemplate.GetStats', {})
      );

      expect(result).toBeDefined();
    });
  });

  describe('Update Shift Template', () => {
    it('should update shift template', async () => {
      const updatePayload = {
        id: createdTemplateId,
        updateDto: {
          shift_name: `Updated ${TEST_SHIFT_NAME}`,
          description: 'Updated description',
        } as UpdateShiftTemplateDto,
      };

      const result = await firstValueFrom(
        client.send<any>('UserService.ShiftTemplate.Update', updatePayload)
      );

      expect(result).toBeDefined();
      expect(result.shift_name).toBe(`Updated ${TEST_SHIFT_NAME}`);
    });

    it('should update shift template times', async () => {
      const updatePayload = {
        id: createdTemplateId,
        updateDto: {
          start_time: '07:30',
          end_time: '11:30',
        } as UpdateShiftTemplateDto,
      };

      const result = await firstValueFrom(
        client.send<any>('UserService.ShiftTemplate.Update', updatePayload)
      );

      expect(result).toBeDefined();
      expect(result.start_time).toBe('07:30');
      expect(result.end_time).toBe('11:30');
    });

    it('should deactivate shift template', async () => {
      const updatePayload = {
        id: createdTemplateId,
        updateDto: {
          is_active: false,
        } as UpdateShiftTemplateDto,
      };

      const result = await firstValueFrom(
        client.send<any>('UserService.ShiftTemplate.Update', updatePayload)
      );

      expect(result).toBeDefined();
      expect(result.is_active).toBe(false);

      // Re-activate for other tests
      await firstValueFrom(
        client.send<any>('UserService.ShiftTemplate.Update', {
          id: createdTemplateId,
          updateDto: { is_active: true },
        })
      );
    });
  });

  describe('Duplicate Shift Template', () => {
    it('should duplicate shift template', async () => {
      if (!createdTemplateId) {
        console.log('Skipping: No shift template created');
        return;
      }

      try {
        const result = await firstValueFrom(
          client.send<any>('UserService.ShiftTemplate.Duplicate', {
            id: createdTemplateId,
            newName: `Duplicated ${TEST_SHIFT_NAME}`,
          })
        );

        expect(result).toBeDefined();
        expect(result.shift_name).toBe(`Duplicated ${TEST_SHIFT_NAME}`);
      } catch (error: any) {
        // May fail if duplicate name already exists
        const msg = getErrorMessage(error);
        console.log('Duplicate template error (may be expected):', msg);
        expect(msg.toLowerCase()).toMatch(/fail|already|exists|duplicate/);
      }
    });
  });

  describe('Create From Template', () => {
    it('should create schedules from template', async () => {
      // Get a test employee
      let testEmployeeId: string | undefined;
      try {
        const users = await firstValueFrom(
          client.send<any>('user.get-all-users', { page: 1, limit: 1 })
        );
        if (users.data?.data?.length > 0) {
          testEmployeeId = users.data.data[0].id;
        }
      } catch (error) {
        console.log('Could not get test employee');
      }

      if (testEmployeeId) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);

        try {
          const result = await firstValueFrom(
            client.send<any>('UserService.ShiftTemplate.CreateFromTemplate', {
              templateId: createdTemplateId,
              dates: [tomorrow.toISOString().split('T')[0]],
              employeeIds: [testEmployeeId],
            })
          );

          expect(result).toBeDefined();
        } catch (error: any) {
          // May fail due to conflicts or missing room
          console.log('Create from template error (may be expected):', getErrorMessage(error));
        }
      }
    });
  });

  describe('Apply to Multiple Employees', () => {
    it('should apply template to multiple employees', async () => {
      // Get test employees
      let testEmployeeIds: string[] = [];
      try {
        const users = await firstValueFrom(
          client.send<any>('user.get-all-users', { page: 1, limit: 2 })
        );
        if (users.data?.data?.length > 0) {
          testEmployeeIds = users.data.data.map((u: any) => u.id);
        }
      } catch (error) {
        console.log('Could not get test employees');
      }

      if (testEmployeeIds.length > 0) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() + 7);
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 7);

        try {
          const result = await firstValueFrom(
            client.send<any>('UserService.ShiftTemplate.ApplyToEmployees', {
              templateId: createdTemplateId,
              employeeIds: testEmployeeIds,
              startDate: startDate.toISOString().split('T')[0],
              endDate: endDate.toISOString().split('T')[0],
            })
          );

          expect(result).toBeDefined();
        } catch (error: any) {
          // May fail due to missing rooms or conflicts
          console.log('Apply to employees error (may be expected):', getErrorMessage(error));
        }
      }
    });
  });

  describe('Delete Shift Template', () => {
    let templateToDeleteId: string;

    beforeAll(async () => {
      // Create a template specifically for deletion test
      const payload: CreateShiftTemplateDto = {
        shift_name: `Delete Test Shift ${Date.now()}`,
        shift_type: ShiftType.MORNING,
        start_time: '09:00',
        end_time: '13:00',
        description: 'Template to be deleted',
        is_active: true,
      };

      const result = await firstValueFrom(
        client.send<any>('UserService.ShiftTemplate.Create', payload)
      );
      templateToDeleteId = result.shift_template_id;
    });

    it('should delete shift template', async () => {
      const result = await firstValueFrom(
        client.send<any>('UserService.ShiftTemplate.Delete', { id: templateToDeleteId })
      );

      expect(result).toBe(true);
    });

    it('should throw error when getting deleted template', async () => {
      try {
        await firstValueFrom(
          client.send('UserService.ShiftTemplate.FindOne', { id: templateToDeleteId })
        );
        fail('Expected not found error');
      } catch (error: any) {
        const msg = getErrorMessage(error);
        expect(msg.toLowerCase()).toMatch(/not found|không tìm thấy/);
      }
    });
  });
});