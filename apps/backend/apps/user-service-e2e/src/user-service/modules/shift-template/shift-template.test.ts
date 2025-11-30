import { ClientProxyFactory, Transport } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { CreateShiftTemplateDto } from '@backend/shared-domain';
import { ShiftType } from '@backend/shared-enums';

describe('ShiftTemplateController (e2e)', () => {
  let client: ReturnType<typeof ClientProxyFactory.create>;
  let createdId: string;

  beforeAll(async () => {
    client = ClientProxyFactory.create({
      transport: Transport.TCP,
      options: { host: 'localhost', port: 5002 }, // adjust port if needed
    });
  });

  afterAll(async () => {
    await client.close();
  });

  it('should create a shift template', async () => {
    const payload: CreateShiftTemplateDto = {
      shift_name: 'Morning Shift',
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
    expect(result.shift_name).toBe('Morning Shift');
    createdId = result.shift_template_id;
  });

  it('should get all shift templates', async () => {
    const result = await firstValueFrom(
      client.send<any>('UserService.ShiftTemplate.FindMany', {
        paginationDto: { page: 1, limit: 10 }
      })
    );
    expect(result).toBeDefined();
    expect(Array.isArray(result.data)).toBe(true);
  });

  it('should get shift template by id', async () => {
    const result = await firstValueFrom(
      client.send<any>('UserService.ShiftTemplate.FindOne', { id: createdId })
    );
    expect(result).toBeDefined();
    expect(result.shift_template_id).toBe(createdId);
  });

  it('should update shift template', async () => {
    const updatePayload = {
      id: createdId,
      updateDto: {
        shift_name: 'Updated Morning Shift',
        description: 'Updated description',
      },
    };
    const result = await firstValueFrom(
      client.send<any>('UserService.ShiftTemplate.Update', updatePayload)
    );
    expect(result).toBeDefined();
    expect(result.shift_name).toBe('Updated Morning Shift');
  });

  it('should delete shift template', async () => {
    const result = await firstValueFrom(
      client.send<any>('UserService.ShiftTemplate.Delete', { id: createdId })
    );
    expect(result).toBe(true);
  });
});