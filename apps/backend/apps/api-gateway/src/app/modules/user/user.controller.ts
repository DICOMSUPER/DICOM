import { Controller, Get, Post, Body, Inject, Logger, Res, UseInterceptors } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import type { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { handleError } from '@backend/shared-utils';
import { TransformInterceptor } from '@backend/shared-interceptor';


class LoginDto {
  email!: string;
  password!: string;
}

class RegisterDto {
  username!: string;
  email!: string;
  password!: string;
  firstName!: string;
  lastName!: string;
  phone?: string;
}

class VerifyOtpDto {
  email!: string;
  code!: string;
}


@ApiTags('User Management')
@Controller('user')
@UseInterceptors(TransformInterceptor)
export class UserController {
  private readonly logger = new Logger('UserController');

  constructor(
    @Inject('UserService') private readonly userClient: ClientProxy,
  ) { }

  @Post('login')
  @ApiOperation({ summary: 'User login' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) res: Response) {
    try {
      const result = await firstValueFrom(
        this.userClient.send('user.login', loginDto)
      );

      if (!result) {
        throw new Error('Invalid credentials');
      }

      const cookieOptions = result.cookieOptions;
      res.cookie(cookieOptions.name, cookieOptions.value, cookieOptions.options);

      // ✅ Chỉ return data, TransformInterceptor sẽ wrap nó
      return {
        tokenResponse: result.tokenResponse,
        message: 'Đăng nhập thành công'
      };
    } catch (error) {
      this.logger.error('Error during login:', error);
      throw handleError(error);
    }
  }

  @Post('request-login')
  @ApiOperation({ summary: 'Request login with OTP verification' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'OTP sent successfully' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async requestLogin(@Body() requestLoginDto: LoginDto) {
    try {
      this.logger.log(`Request login attempt for email: ${requestLoginDto.email}`);
      const result = await firstValueFrom(
        this.userClient.send('user.request-login', requestLoginDto)
      );

      // ✅ Return clean data
      return {
        success: result.success,
        requireOtp: result.requireOtp,
        message: result.message || 'OTP đã được gửi'
      };
    } catch (error) {
      this.logger.error('Error during request login:', error);
      throw handleError(error);
    }
  }

  @Post('verify-otp')
  @ApiOperation({ summary: 'Verify OTP and complete login' })
  @ApiBody({ type: VerifyOtpDto })
  @ApiResponse({ status: 200, description: 'OTP verified and login successful' })
  @ApiResponse({ status: 400, description: 'Invalid or expired OTP' })
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto, @Res({ passthrough: true }) res: Response) {
    try {
      this.logger.log(`OTP verification attempt for email: ${verifyOtpDto.email}`);

      const result = await firstValueFrom(
        this.userClient.send('user.verify-otp', verifyOtpDto)
      );

      if (!result || !result.success) {
        throw new Error(result?.message || 'OTP verification failed');
      }

      if (result.cookieOptions) {
        const cookieOptions = result.cookieOptions;
        res.cookie(cookieOptions.name, cookieOptions.value, cookieOptions.options);
      }

      return {
        tokenResponse: result.tokenResponse,
        message: result.message || 'Xác thực OTP thành công'
      };
    } catch (error) {
      this.logger.error('Error during OTP verification:', error);
      throw handleError(error);
    }
  }

  @Post('register')
  @ApiOperation({ summary: 'User registration' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({ status: 201, description: 'Registration successful' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async register(@Body() registerDto: RegisterDto) {
    try {
      const result = await firstValueFrom(
        this.userClient.send('user.register', registerDto)
      );

      if (!result) {
        throw new Error('Registration failed');
      }

      return {
        user: result.user,
        message: 'Đăng ký thành công'
      };
    } catch (error) {
      this.logger.error('Error during registration:', error);
      throw handleError(error);
    }
  }

  @Get('users')
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  async getAllUsers() {
    try {
      const result = await firstValueFrom(
        this.userClient.send('user.get-all-users', {})
      );

      return {
        users: result.users,
        count: result.count,
        message: 'Lấy danh sách người dùng thành công'
      };
    } catch (error) {
      this.logger.error('Error fetching users:', error);
      throw handleError(error);
    }
  }
}