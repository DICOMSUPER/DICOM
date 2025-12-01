import {
  Transport,
  ClientProxyFactory,
  ClientProxy,
} from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

import { CreateUserDto, User } from '@backend/shared-domain';
import { Roles } from '@backend/shared-enums';

export function runUserE2ETests(port = 5002, host = 'localhost') {
  describe('UserController (e2e)', () => {
    let client: ClientProxy;
    const TEST_EMAIL = `anh_${Date.now()}@mail.com`;
    const TEST_USERNAME = `anh_${Date.now()}`;
    let createdUserId: string;

    beforeAll(async () => {
      client = ClientProxyFactory.create({
        transport: Transport.TCP,
        options: {
          host,
          port,
        },
      });
    });

    afterAll(async () => {
      await client.close();
    });

    it('should register a new user', async () => {
      const payload: CreateUserDto = {
        username: TEST_USERNAME,
        email: TEST_EMAIL,
        password: 'TestPassword123!',
        firstName: 'Test',
        lastName: 'User',
        phone: '0123456789',
        employeeId: 'PHY01',
        role: Roles.RECEPTION_STAFF,
        isVerified: true,
        isActive: true,
      };

      const result = await firstValueFrom(
        client.send<any>('user.register', payload)
      );
  console.log('Update user result:', result);
      expect(result).toBeDefined();
      expect(result.user).toBeDefined();
      expect(result.user.email).toBe(TEST_EMAIL);
      createdUserId = result.user.id;
    });

    it('should not register a user with duplicate email', async () => {
      const payload: CreateUserDto = {
        username: TEST_USERNAME + '_dup',
        email: TEST_EMAIL,
        password: 'TestPassword123!',
        firstName: 'Test',
        lastName: 'User',
        role: Roles.RECEPTION_STAFF,
        isVerified: false,
        isActive: true,
      };

      try {
        await firstValueFrom(client.send<any>('user.register', payload));
        fail('Should throw error for duplicate email');
      } catch (error: any) {
        expect(error).toBeDefined();
        expect(
          error.message?.includes('Email đã được sử dụng') ||
            error.message?.includes('already')
        ).toBeTruthy();
      }
    });

    it('should get user by email', async () => {
      const result = await firstValueFrom(
        client.send<any>('user.get-user-by-email', { email: TEST_EMAIL })
      );
      expect(result).toBeDefined();
      expect(result.user).toBeDefined();
      expect(result.user.email).toBe(TEST_EMAIL);
    });

    it('should get user by id', async () => {
      const result = await firstValueFrom(
        client.send<any>('UserService.Users.findOne', { id: createdUserId })
      );
      expect(result).toBeDefined();
      expect(result.email).toBe(TEST_EMAIL);
    });

    it('should get all users', async () => {
      const result = await firstValueFrom(
        client.send<any>('user.get-all-users', { page: 1, limit: 10 })
      );
      expect(result).toBeDefined();
      expect(Array.isArray(result.data?.data)).toBe(true);
    });

    it('should update user', async () => {
      const updatePayload = {
        id: createdUserId,
        updateUserDto: {
          firstName: 'Updated',
          lastName: 'User',
        },
      };
      const result = await firstValueFrom(
        client.send<any>('UserService.Users.Update', updatePayload)
      );
      expect(result).toBeDefined();
      expect(result.user.firstName).toBe('Updated');
    });

    it('should disable user', async () => {
      const result = await firstValueFrom(
        client.send<any>('UserService.Users.Disable', { id: createdUserId })
      );
      expect(result).toBeDefined();
      expect(result.user.isActive).toBe(false);
    });

    it('should enable user', async () => {
      const result = await firstValueFrom(
        client.send<any>('UserService.Users.Enable', { id: createdUserId })
      );
      expect(result).toBeDefined();
      expect(result.user.isActive).toBe(true);
    });
  });
}
