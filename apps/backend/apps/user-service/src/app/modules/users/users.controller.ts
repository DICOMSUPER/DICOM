import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload, RpcException } from '@nestjs/microservices';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from '@backend/shared-domain';

import {
  InvalidCredentialsException,
  UserAlreadyExistsException,
  UserNotFoundException,
  OtpVerificationFailedException,
  RegistrationFailedException,
  InvalidTokenException,
  ValidationException,
  DatabaseException,
} from '@backend/shared-exception';
import { handleErrorFromMicroservices } from '@backend/shared-utils';
import { Roles } from '@backend/shared-enums';

@Controller()
export class UsersController {
  private readonly logger = new Logger('UsersController');

  constructor(private readonly usersService: UsersService) {}

  @MessagePattern('user.check-health')
  async checkHealth() {
    return {
      service: 'UserService',
      status: 'running',
      timestamp: new Date().toISOString(),
    };
  }

  @MessagePattern('user.login')
  async login(@Payload() data: { email: string; password: string }) {
    try {
      this.logger.log(`Login attempt for email: ${data.email}`);
      const result = await this.usersService.login(data.email, data.password);

      if (!result) {
        throw new InvalidCredentialsException('Invalid email or password');
      }

      return {
        ...result,
        message: 'Đăng nhập thành công',
      };
    } catch (error: unknown) {
      this.logger.error(`Login error: ${(error as Error).message}`);
      if (error instanceof InvalidCredentialsException) {
        throw error;
      }
      handleErrorFromMicroservices(
        error,
        'Login failed',
        'UsersController.login'
      );
    }
  }

  @MessagePattern('user.request-login')
  async requestLogin(@Payload() data: { email: string; password: string }) {
    try {
      this.logger.log(`Request login attempt for email: ${data.email}`);
      const result = await this.usersService.requestLogin(
        data.email,
        data.password
      );

      return {
        ...result,
        message: result.message || 'OTP đã được gửi',
      };
    } catch (error: unknown) {
      this.logger.error(`Request login error: ${(error as Error).message}`);
      if (
        error instanceof UserNotFoundException ||
        error instanceof InvalidCredentialsException
      ) {
        throw error;
      }
      handleErrorFromMicroservices(
        error,
        'Request login failed',
        'UsersController.requestLogin'
      );
    }
  }

  @MessagePattern('user.verify-otp')
  async verifyOtp(@Payload() data: { email: string; code: string }) {
    try {
      this.logger.log(`OTP verification attempt for email: ${data.email}`);
      const result = await this.usersService.verifyLoginOtp(
        data.email,
        data.code
      );

      return {
        ...result,
        message: result?.message || 'Xác thực OTP thành công',
      };
    } catch (error: unknown) {
      this.logger.error(`OTP verification error: ${(error as Error).message}`);
      if (
        error instanceof OtpVerificationFailedException ||
        error instanceof UserNotFoundException
      ) {
        throw error;
      }
      handleErrorFromMicroservices(
        error,
        'OTP verification failed',
        'UsersController.verifyOtp'
      );
    }
  }

  @MessagePattern('user.register')
  async register(
    @Payload()
    registerDto: {
      username: string;
      email: string;
      password: string;
      role: Roles;
      firstName: string;
      lastName: string;
      phone?: string;
    }
  ) {
    try {
      this.logger.log(`Registration attempt for email: ${registerDto.email}`);

      const createUserDto: CreateUserDto = {
        username: registerDto.username,
        email: registerDto.email,
        password: registerDto.password,
        firstName: registerDto.firstName,
        role: Roles.RECEPTION_STAFF,
        lastName: registerDto.lastName,
        phone: registerDto.phone,
        isVerified: false,
        isActive: true,
      };

      const result = await this.usersService.register(createUserDto);

      if (!result) {
        throw new RegistrationFailedException('Registration failed');
      }

      return {
        user: result,
        message: 'Đăng ký thành công',
      };
    } catch (error: unknown) {
      this.logger.error(`Registration error: ${(error as Error).message}`);
      if (
        error instanceof UserAlreadyExistsException ||
        error instanceof RegistrationFailedException
      ) {
        throw error;
      }
      handleErrorFromMicroservices(
        error,
        'Registration failed',
        'UsersController.register'
      );
    }
  }

  @MessagePattern('user.get-all-users')
  async getAllUsers(
    @Payload()
    query?: {
      page?: number;
      limit?: number;
      search?: string;
      isActive?: boolean;
      role?: string;
      excludeRole?: string;
      departmentId?: string;
    }
  ) {
    try {
      const result = await this.usersService.findAll(query || {});
      return result;
    } catch (error) {
      this.logger.error(`Get all users error: ${(error as Error).message}`);
      handleErrorFromMicroservices(
        error,
        'Failed to get users',
        'UsersController.getAllUsers'
      );
    }
  }

  @MessagePattern('user.get-all-users-without-pagination')
  async getAllUsersWithoutPagination(
    @Payload()
    query?: {
      search?: string;
      isActive?: boolean;
      role?: string;
      excludeRole?: string;
      departmentId?: string;
    }
  ) {
    try {
      const result = await this.usersService.findAllWithoutPagination(query);
      return { data: result };
    } catch (error) {
      this.logger.error(`Get all users without pagination error: ${(error as Error).message}`);
      handleErrorFromMicroservices(
        error,
        'Failed to get users',
        'UsersController.getAllUsersWithoutPagination'
      );
    }
  }

  @MessagePattern('user.get-stats')
  async getStats() {
    try {
      return await this.usersService.getStats();
    } catch (error) {
      this.logger.error(`Get user stats error: ${(error as Error).message}`);
      handleErrorFromMicroservices(
        error,
        'Failed to get user stats',
        'UsersController.getStats'
      );
    }
  }

  @MessagePattern('user.get-user-by-email')
  async getUserByEmail(@Payload() data: { email: string }) {
    try {
      this.logger.log(`Get user by email: ${data.email}`);
      const user = await this.usersService.findByEmail(data.email);

      if (!user) {
        throw new UserNotFoundException('Không tìm thấy người dùng');
      }

      const { passwordHash, ...userWithoutPassword } = user;

      return {
        user: userWithoutPassword,
        message: 'Lấy thông tin người dùng thành công',
      };
    } catch (error: unknown) {
      this.logger.error(`Get user by email error: ${(error as Error).message}`);
      if (error instanceof UserNotFoundException) {
        throw error;
      }
      handleErrorFromMicroservices(
        error,
        'Failed to get user by email',
        'UsersController.getUserByEmail'
      );
    }
  }

  @MessagePattern('user.verify-token')
  async verifyToken(@Payload() data: { token: string }) {
    try {
      const decoded = await this.usersService.verifyToken(data.token);
      return {
        userId: decoded.sub,
        role: decoded.role,
      };
    } catch (error) {
      this.logger.error(
        `Token verification failed: ${(error as Error).message}`
      );
      throw new InvalidTokenException();
    }
  }

  @MessagePattern('UserService.Users.findOne')
  async getUserInfoByToken(@Payload() data: { id: string }) {
    try {
      const user = await this.usersService.findOne(data.id);
      return user;
    } catch (error) {
      this.logger.error(`Get user info error: ${(error as Error).message}`);
      if (error instanceof UserNotFoundException) {
        throw error;
      }
      throw handleErrorFromMicroservices(
        error,
        'Failed to get user info',
        'UsersController.getUserInfoByToken'
      );
    }
  }

  @MessagePattern('UserService.Users.GetIdsByRole')
  async getUserIdsByRole(
    @Payload() data: { role: Roles; take?: number }
  ): Promise<{ success: boolean; data: string[]; count: number }> {
    this.logger.log(
      `Getting user IDs for role: ${data.role}, take: ${data.take || 10}`
    );
    try {
      const { role, take = 10 } = data;
      const users = await this.usersService.findByRole(role, take);

      const userIds = users.map((u) => u.id);

      this.logger.log(`Returning ${userIds.length} user IDs for role: ${role}`);

      return {
        success: true,
        data: userIds,
        count: userIds.length,
      };
    } catch (error) {
      this.logger.error(
        `Get user IDs by role error: ${(error as Error).message}`
      );
      throw handleErrorFromMicroservices(
        error,
        `Failed to get user IDs for role: ${data.role}`,
        'UsersController.getUserIdsByRole'
      );
    }
  }

  @MessagePattern('UserService.Users.GetUsersByIds')
  async getUsersByIds(@Payload() data: { userIds: string[] }) {
    this.logger.log('Using pattern: UserService.Users.GetUsersByIds');
    try {
      return await this.usersService.findUsersByIds(data.userIds);
    } catch (error) {
      this.logger.error(
        `Get user IDs by role error: ${(error as Error).message}`
      );
      throw handleErrorFromMicroservices(
        error,
        `Failed to get user by userIds ${JSON.stringify(data.userIds)}`,
        'UsersController.getUserIdsByRole'
      );
    }
  }

  @MessagePattern('user.create-staff-account')
  async createStaffAccount(
    @Payload()
    data: {
      createUserDto: CreateUserDto;
      createdBy?: string;
    }
  ) {
    try {
      this.logger.log(`Creating staff account for email: ${data.createUserDto.email}`);

      const result = await this.usersService.createStaffAccount(
        data.createUserDto,
        data.createdBy
      );

      if (!result) {
        throw new RegistrationFailedException('Failed to create staff account');
      }

      return {
        user: result,
        message: 'Tạo tài khoản nhân viên thành công',
      };
    } catch (error: unknown) {
      this.logger.error(`Create staff account error: ${(error as Error).message}`);
      if (
        error instanceof UserAlreadyExistsException ||
        error instanceof RegistrationFailedException ||
        error instanceof ValidationException
      ) {
        throw error;
      }
      handleErrorFromMicroservices(
        error,
        'Failed to create staff account',
        'UsersController.createStaffAccount'
      );
    }
  }

  @MessagePattern('UserService.Users.Update')
  async update(
    @Payload()
    data: {
      id: string;
      updateUserDto: UpdateUserDto;
    }
  ) {
    try {
      this.logger.log(`Updating user with id: ${data.id}`);
      this.logger.log(`Received updateUserDto: ${JSON.stringify(data.updateUserDto, null, 2)}`);

      const result = await this.usersService.update(data.id, data.updateUserDto);

      return {
        user: result,
        message: 'Cập nhật thông tin người dùng thành công',
      };
    } catch (error: unknown) {
      this.logger.error(`Update user error: ${(error as Error).message}`);
      if (error instanceof ValidationException || error instanceof DatabaseException) {
        const errorResponse = (error as any).getResponse();
        const message = typeof errorResponse === 'object' && errorResponse !== null && 'message' in errorResponse
          ? (errorResponse as { message: string }).message
          : (error as Error).message || 'An error occurred';
        const statusCode = (error as any).getStatus();
        throw new RpcException({
          code: statusCode,
          message: message,
          errorCode: error instanceof ValidationException ? 'VALIDATION_ERROR' : 'DATABASE_ERROR',
        });
      }
      throw handleErrorFromMicroservices(
        error,
        'Failed to update user',
        'UsersController.update'
      );
    }
  }

  @MessagePattern('UserService.Users.Disable')
  async disable(@Payload() data: { id: string }) {
    try {
      this.logger.log(`Disabling user with id: ${data.id}`);

      const result = await this.usersService.disable(data.id);

      return {
        user: result,
        message: 'Vô hiệu hóa người dùng thành công',
      };
    } catch (error: unknown) {
      this.logger.error(`Disable user error: ${(error as Error).message}`);
      if (
        error instanceof ValidationException ||
        error instanceof UserNotFoundException
      ) {
        throw error;
      }
      handleErrorFromMicroservices(
        error,
        'Failed to disable user',
        'UsersController.disable'
      );
    }
  }

  @MessagePattern('UserService.Users.Enable')
  async enable(@Payload() data: { id: string }) {
    try {
      this.logger.log(`Enabling user with id: ${data.id}`);

      const result = await this.usersService.enable(data.id);

      return {
        user: result,
        message: 'Kích hoạt người dùng thành công',
      };
    } catch (error: unknown) {
      this.logger.error(`Enable user error: ${(error as Error).message}`);
      if (
        error instanceof ValidationException ||
        error instanceof UserNotFoundException
      ) {
        throw error;
      }
      handleErrorFromMicroservices(
        error,
        'Failed to enable user',
        'UsersController.enable'
      );
    }
  }
}
