import { Controller, Get, Post, Body, Inject, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { handleError } from '@backend/shared-utils';

// DTOs for API Gateway
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
  async login(@Body() loginDto: LoginDto) {
    try {
      const result = await firstValueFrom(
        this.userClient.send('user.login', loginDto)
      );

      if (!result) {
        throw new Error('Invalid credentials');
      }

      return {
        success: true,
        message: 'Login successful',
        data: result
      };
    } catch (error) {
      this.logger.error('Error during login:', error);
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