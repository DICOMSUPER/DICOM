import { Controller, Get, Post, Body, Inject, Logger, Res } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import type { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { handleError } from '@backend/shared-utils';

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

      return {
        success: true,
        message: 'Login successful',
        data: result.tokenResponse,
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

      return {
        success: result.success,
        message: result.message,
        requireOtp: result.requireOtp
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
        return {
          success: false,
          message: result?.message || 'OTP verification failed'
        };
      }

      if (result.cookieOptions) {
        const cookieOptions = result.cookieOptions;
        res.cookie(cookieOptions.name, cookieOptions.value, cookieOptions.options);
      }

      return {
        success: true,
        message: result.message,
        data: result.tokenResponse
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
        success: true,
        message: 'Registration successful',
        data: result
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
        success: true,
        message: 'Users retrieved successfully',
        data: result
      };
    } catch (error) {
      this.logger.error('Error fetching users:', error);
      throw handleError(error);
    }
  }
}