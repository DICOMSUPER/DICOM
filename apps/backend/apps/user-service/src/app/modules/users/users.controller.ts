import { Controller, Logger, UseInterceptors } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { RpcException } from '@nestjs/microservices';
import {
  InvalidCredentialsException,
  UserAlreadyExistsException,
  UserNotFoundException,
  OtpVerificationFailedException,
  RegistrationFailedException,
  InvalidTokenException,
  ValidationException,
  TokenGenerationFailedException
} from '@backend/shared-exception';
import { handleErrorFromMicroservices } from '@backend/shared-utils';
import { Roles } from '@backend/shared-enums';

@Controller()
export class UsersController {
  private readonly logger = new Logger('UsersController');

  constructor(private readonly usersService: UsersService) { }

  @MessagePattern('user.check-health')
  async checkHealth() {
    return {
      service: 'UserService',
      status: 'running',
      timestamp: new Date().toISOString()
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
        message: 'Đăng nhập thành công'
      };
    } catch (error: unknown) {
      this.logger.error(`Login error: ${(error as Error).message}`);
      if (error instanceof InvalidCredentialsException) {
        throw error;
      }
      handleErrorFromMicroservices(error, 'Login failed', 'UsersController.login');
    }
  }



  @MessagePattern('user.request-login')
  async requestLogin(@Payload() data: { email: string; password: string }) {
    try {
      this.logger.log(`Request login attempt for email: ${data.email}`);
      const result = await this.usersService.requestLogin(data.email, data.password);

      return {
        ...result,
        message: result.message || 'OTP đã được gửi'
      };
    } catch (error: unknown) {
      this.logger.error(`Request login error: ${(error as Error).message}`);
      if (error instanceof UserNotFoundException || error instanceof InvalidCredentialsException) {
        throw error;
      }
      handleErrorFromMicroservices(error, 'Request login failed', 'UsersController.requestLogin');
    }
  }

  @MessagePattern('user.verify-otp')
  async verifyOtp(@Payload() data: { email: string; code: string }) {
    try {
      this.logger.log(`OTP verification attempt for email: ${data.email}`);
      const result = await this.usersService.verifyLoginOtp(data.email, data.code);

      return {
        ...result,
        message: result?.message || 'Xác thực OTP thành công'
      };
    } catch (error: unknown) {
      this.logger.error(`OTP verification error: ${(error as Error).message}`);
      if (error instanceof OtpVerificationFailedException || error instanceof UserNotFoundException) {
        throw error;
      }
      handleErrorFromMicroservices(error, 'OTP verification failed', 'UsersController.verifyOtp');
    }
  }

  @MessagePattern('user.register')
  async register(@Payload() registerDto: {
    username: string;
    email: string;
    password: string;
    role: Roles;
    firstName: string;
    lastName: string;
    phone?: string;
  }) {
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
        message: 'Đăng ký thành công'
      };
    } catch (error: unknown) {
      this.logger.error(`Registration error: ${(error as Error).message}`);
      if (error instanceof UserAlreadyExistsException || error instanceof RegistrationFailedException) {
        throw error;
      }
      handleErrorFromMicroservices(error, 'Registration failed', 'UsersController.register');
    }
  }

  @MessagePattern('user.get-all-users')
  async getAllUsers() {
    try {
      const users = await this.usersService.findAll();

      return {
        users,
        count: users.length,
        message: 'Lấy danh sách người dùng thành công'
      };
    } catch (error: unknown) {
      this.logger.error(`Get all users error: ${(error as Error).message}`);
      handleErrorFromMicroservices(error, 'Failed to get all users', 'UsersController.getAllUsers');
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
        message: 'Lấy thông tin người dùng thành công'
      };
    } catch (error: unknown) {
      this.logger.error(`Get user by email error: ${(error as Error).message}`);
      if (error instanceof UserNotFoundException) {
        throw error;
      }
      handleErrorFromMicroservices(error, 'Failed to get user by email', 'UsersController.getUserByEmail');
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
    this.logger.error(`Token verification failed: ${(error as Error).message}`);
    throw new InvalidTokenException();
  }
}

}