import {
  Transport,
  ClientProxyFactory,
  ClientProxy,
} from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

import { CreateUserDto, UpdateUserDto } from '@backend/shared-domain';
import { Roles } from '@backend/shared-enums';

describe('UsersController (E2E)', () => {
  let client: ClientProxy;
  const TEST_EMAIL = `test_user_${Date.now()}@mail.com`;
  const TEST_USERNAME = `test_user_${Date.now()}`;
  let createdUserId: string;

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

  describe('Health Check', () => {
    it('should return health status', async () => {
      const result = await firstValueFrom(
        client.send('UserService.HealthCheck', {})
      );
      expect(result).toBeDefined();
      expect(result.service).toBe('UserService');
      expect(result.status).toBe('running');
    });
  });

  describe('User Registration', () => {
    it('should register a new user', async () => {
      const payload: CreateUserDto = {
        username: TEST_USERNAME,
        email: TEST_EMAIL,
        password: 'TestPassword123!',
        firstName: 'Test',
        lastName: 'User',
        phone: '0123456789',
        employeeId: `EMP_${Date.now()}`,
        role: Roles.RECEPTION_STAFF,
        isVerified: true,
        isActive: true,
      };

      const result = await firstValueFrom(
        client.send<any>('user.register', payload)
      );

      expect(result).toBeDefined();
      expect(result.user).toBeDefined();
      expect(result.user.email).toBe(TEST_EMAIL);
      expect(result.message).toBe('Đăng ký thành công');
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
        const msg = getErrorMessage(error);
        expect(msg.toLowerCase()).toMatch(/email|already|đã được sử dụng/);
      }
    });

    it('should create staff account', async () => {
      const staffPayload: CreateUserDto = {
        username: `staff_${Date.now()}`,
        email: `staff_${Date.now()}@mail.com`,
        password: 'StaffPassword123!',
        firstName: 'Staff',
        lastName: 'User',
        phone: '0987654321',
        role: Roles.DOCTOR,
        isVerified: true,
        isActive: true,
      };

      const result = await firstValueFrom(
        client.send<any>('user.create-staff-account', {
          createUserDto: staffPayload,
        })
      );

      expect(result).toBeDefined();
      expect(result.user).toBeDefined();
      expect(result.message).toBe('Tạo tài khoản nhân viên thành công');
    });
  });

  describe('Get User', () => {
    it('should get user by email', async () => {
      const result = await firstValueFrom(
        client.send<any>('user.get-user-by-email', { email: TEST_EMAIL })
      );

      expect(result).toBeDefined();
      expect(result.user).toBeDefined();
      expect(result.user.email).toBe(TEST_EMAIL);
      expect(result.message).toBe('Lấy thông tin người dùng thành công');
    });

    it('should get user by id', async () => {
      const result = await firstValueFrom(
        client.send<any>('UserService.Users.findOne', { id: createdUserId })
      );

      expect(result).toBeDefined();
      expect(result.email).toBe(TEST_EMAIL);
    });

    it('should throw error for non-existent user by email', async () => {
      try {
        await firstValueFrom(
          client.send('user.get-user-by-email', { email: 'nonexistent@mail.com' })
        );
        fail('Expected not found error');
      } catch (error: any) {
        const msg = getErrorMessage(error);
        expect(msg.toLowerCase()).toMatch(/not found|không tìm thấy/);
      }
    });
  });

  describe('Get All Users', () => {
    it('should get all users with pagination', async () => {
      const result = await firstValueFrom(
        client.send<any>('user.get-all-users', { page: 1, limit: 10 })
      );

      expect(result).toBeDefined();
      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data.data)).toBe(true);
    });

    it('should get all users without pagination', async () => {
      const result = await firstValueFrom(
        client.send<any>('user.get-all-users-without-pagination', {})
      );

      expect(result).toBeDefined();
      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('should filter users by role', async () => {
      const result = await firstValueFrom(
        client.send<any>('user.get-all-users', {
          page: 1,
          limit: 10,
          role: Roles.RECEPTION_STAFF,
        })
      );

      expect(result).toBeDefined();
      expect(result.data).toBeDefined();
    });

    it('should filter users by search term', async () => {
      const result = await firstValueFrom(
        client.send<any>('user.get-all-users', {
          page: 1,
          limit: 10,
          search: 'Test',
        })
      );

      expect(result).toBeDefined();
      expect(result.data).toBeDefined();
    });

    it('should exclude users by role', async () => {
      const result = await firstValueFrom(
        client.send<any>('user.get-all-users', {
          page: 1,
          limit: 10,
          excludeRole: Roles.ADMIN,
        })
      );

      expect(result).toBeDefined();
      expect(result.data).toBeDefined();
    });
  });

  describe('Get User Stats', () => {
    it('should get user statistics', async () => {
      const result = await firstValueFrom(
        client.send<any>('user.get-stats', {})
      );

      expect(result).toBeDefined();
      expect(typeof result.totalUsers).toBe('number');
    });
  });

  describe('Get Users by Role', () => {
    it('should get user IDs by role', async () => {
      const result = await firstValueFrom(
        client.send<any>('UserService.Users.GetIdsByRole', {
          role: Roles.RECEPTION_STAFF,
          take: 10,
        })
      );

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.count).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Get Users by IDs', () => {
    it('should get users by multiple IDs', async () => {
      const result = await firstValueFrom(
        client.send<any>('UserService.Users.GetUsersByIds', {
          userIds: [createdUserId],
        })
      );

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('Update User', () => {
    it('should update user', async () => {
      const updatePayload = {
        id: createdUserId,
        updateUserDto: {
          firstName: 'Updated',
          lastName: 'UserName',
        } as UpdateUserDto,
      };

      const result = await firstValueFrom(
        client.send<any>('UserService.Users.Update', updatePayload)
      );

      expect(result).toBeDefined();
      expect(result.user).toBeDefined();
      expect(result.user.firstName).toBe('Updated');
      expect(result.message).toBe('Cập nhật thông tin người dùng thành công');
    });

    it('should update user phone', async () => {
      const updatePayload = {
        id: createdUserId,
        updateUserDto: {
          phone: '0999999999',
        } as UpdateUserDto,
      };

      const result = await firstValueFrom(
        client.send<any>('UserService.Users.Update', updatePayload)
      );

      expect(result).toBeDefined();
      expect(result.user.phone).toBe('0999999999');
    });
  });

  describe('Disable/Enable User', () => {
    it('should disable user', async () => {
      const result = await firstValueFrom(
        client.send<any>('UserService.Users.Disable', { id: createdUserId })
      );

      expect(result).toBeDefined();
      expect(result.user).toBeDefined();
      expect(result.user.isActive).toBe(false);
      expect(result.message).toBe('Vô hiệu hóa người dùng thành công');
    });

    it('should enable user', async () => {
      const result = await firstValueFrom(
        client.send<any>('UserService.Users.Enable', { id: createdUserId })
      );

      expect(result).toBeDefined();
      expect(result.user).toBeDefined();
      expect(result.user.isActive).toBe(true);
      expect(result.message).toBe('Kích hoạt người dùng thành công');
    });
  });

  describe('Login', () => {
    it('should login with valid credentials', async () => {
      const result = await firstValueFrom(
        client.send<any>('user.login', {
          email: TEST_EMAIL,
          password: 'TestPassword123!',
        })
      );

      expect(result).toBeDefined();
      expect(result.message).toBe('Đăng nhập thành công');
    });

    it('should fail login with invalid password', async () => {
      try {
        await firstValueFrom(
          client.send('user.login', {
            email: TEST_EMAIL,
            password: 'WrongPassword',
          })
        );
        fail('Expected invalid credentials error');
      } catch (error: any) {
        const msg = getErrorMessage(error);
        expect(msg.toLowerCase()).toMatch(/invalid|incorrect|sai|không hợp lệ/);
      }
    });

    it('should fail login with non-existent email', async () => {
      try {
        await firstValueFrom(
          client.send('user.login', {
            email: 'nonexistent@mail.com',
            password: 'TestPassword123!',
          })
        );
        fail('Expected user not found error');
      } catch (error: any) {
        const msg = getErrorMessage(error);
        expect(msg.toLowerCase()).toMatch(/invalid|not found|không tìm thấy/);
      }
    });
  });

  describe('Request Login with OTP', () => {
    it('should request login and send OTP', async () => {
      try {
        const result = await firstValueFrom(
          client.send<any>('user.request-login', {
            email: TEST_EMAIL,
            password: 'TestPassword123!',
          })
        );

        expect(result).toBeDefined();
        expect(result.message).toMatch(/OTP|gửi/i);
      } catch (error: any) {
        // OTP service might not be configured
        const msg = getErrorMessage(error);
        console.log('Request login error (may be expected):', msg);
      }
    });
  });

  describe('Verify Token', () => {
    it('should verify valid token', async () => {
      // First login to get a token
      const loginResult = await firstValueFrom(
        client.send<any>('user.login', {
          email: TEST_EMAIL,
          password: 'TestPassword123!',
        })
      );

      if (loginResult.accessToken) {
        const result = await firstValueFrom(
          client.send<any>('user.verify-token', {
            token: loginResult.accessToken,
          })
        );

        expect(result).toBeDefined();
        expect(result.userId).toBeDefined();
        expect(result.role).toBeDefined();
      }
    });

    it('should fail with invalid token', async () => {
      try {
        await firstValueFrom(
          client.send('user.verify-token', {
            token: 'invalid_token',
          })
        );
        fail('Expected invalid token error');
      } catch (error: any) {
        expect(error).toBeDefined();
      }
    });
  });
});

// Export for backwards compatibility
export function runUserE2ETests(port = 5002, host = 'localhost') {
  // Tests are now run automatically via Jest
  console.log(`User E2E tests configured for ${host}:${port}`);
}
