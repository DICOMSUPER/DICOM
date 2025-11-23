import {
  Controller,
  Get,
  Post,
  Body,
  Inject,
  Logger,
  Res,
  UseInterceptors,
  UseGuards,
  Query,
  Req,
  Param,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import type { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { handleError } from '@backend/shared-utils';
import {
  TransformInterceptor,
  RequestLoggingInterceptor,
} from '@backend/shared-interceptor';
import { Roles } from '@backend/shared-enums';
import { Public } from '@backend/shared-decorators';
import { Role } from '@backend/shared-decorators';
import type { IAuthenticatedRequest } from '@backend/shared-interfaces';
import { AuthGuard } from '@backend/shared-guards';
// removed unused import
import { RoomSchedule, User, CreateUserDto } from '@backend/shared-domain';
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
@UseInterceptors(RequestLoggingInterceptor, TransformInterceptor)
export class UserController {
  private readonly logger = new Logger('UserController');

  constructor(
    @Inject('USER_SERVICE') private readonly userClient: ClientProxy,
    @Inject('PATIENT_SERVICE') private readonly _patientService: ClientProxy
  ) {}

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'User login' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response
  ) {
    try {
      this.logger.log(`🔐 Login attempt for email: ${loginDto.email}`);

      const result = await firstValueFrom(
        this.userClient.send('user.login', loginDto)
      );

      if (!result) {
        throw new Error('Invalid credentials');
      }

      const cookieOptions = result.cookieOptions;
      res.cookie(
        cookieOptions.name,
        cookieOptions.value,
        cookieOptions.options
      );

      this.logger.log(`✅ Login successful for email: ${loginDto.email}`);

      return {
        tokenResponse: result.tokenResponse,
        message: 'Đăng nhập thành công',
      };
    } catch (error) {
      this.logger.error(`❌ Login failed for email: ${loginDto.email}`, error);
      throw handleError(error);
    }
  }

  @Public()
  @Post('logout')
  @ApiOperation({ summary: 'User logout' })
  @ApiResponse({ status: 200, description: 'Logout successful' })
  async logoutUser(@Res({ passthrough: true }) res: Response) {
    try {
      const secure = process.env.NODE_ENV === 'production';
      res.cookie('accessToken', '', {
        httpOnly: true,
        secure,
        sameSite: 'strict',
        maxAge: 0,
        path: '/',
      });

      this.logger.log('✅ User logged out successfully');

      return {
        message: 'Đăng xuất thành công',
      };
    } catch (error) {
      this.logger.error('❌ Logout failed', error);
      throw handleError(error);
    }
  }

  @Public()
  @Post('request-login')
  @ApiOperation({ summary: 'Request login with OTP verification' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'OTP sent successfully' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async requestLogin(@Body() requestLoginDto: LoginDto) {
    try {
      this.logger.log(
        `📧 Request login with OTP for email: ${requestLoginDto.email}`
      );

      const result = await firstValueFrom(
        this.userClient.send('user.request-login', requestLoginDto)
      );

      this.logger.log(`✅ OTP sent successfully to: ${requestLoginDto.email}`);

      return {
        success: result.success,
        requireOtp: result.requireOtp,
        message: result.message || 'OTP đã được gửi',
      };
    } catch (error) {
      this.logger.error(
        `❌ Request login failed for email: ${requestLoginDto.email}`,
        error
      );
      throw handleError(error);
    }
  }

  @Public()
  @Post('verify-otp')
  @ApiOperation({ summary: 'Verify OTP and complete login' })
  @ApiBody({ type: VerifyOtpDto })
  @ApiResponse({
    status: 200,
    description: 'OTP verified and login successful',
  })
  @ApiResponse({ status: 400, description: 'Invalid or expired OTP' })
  async verifyOtp(
    @Body() verifyOtpDto: VerifyOtpDto,
    @Res({ passthrough: true }) res: Response
  ) {
    try {
      this.logger.log(
        `🔢 OTP verification attempt for email: ${verifyOtpDto.email}`
      );

      const result = await firstValueFrom(
        this.userClient.send('user.verify-otp', verifyOtpDto)
      );

      if (!result || !result.success) {
        throw new Error(result?.message || 'OTP verification failed');
      }

      if (result.cookieOptions) {
        const cookieOptions = result.cookieOptions;
        res.cookie(
          cookieOptions.name,
          cookieOptions.value,
          cookieOptions.options
        );
      }

      this.logger.log(
        `✅ OTP verified successfully for email: ${verifyOtpDto.email}`
      );

      return {
        tokenResponse: result.tokenResponse,
        message: result.message || 'Xác thực OTP thành công',
      };
    } catch (error) {
      this.logger.error(
        `❌ OTP verification failed for email: ${verifyOtpDto.email}`,
        error
      );
      throw handleError(error);
    }
  }

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'User registration' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({ status: 201, description: 'Registration successful' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async register(@Body() registerDto: RegisterDto) {
    try {
      this.logger.log(
        `👤 Registration attempt for email: ${registerDto.email}`
      );

      const result = await firstValueFrom(
        this.userClient.send('user.register', registerDto)
      );

      if (!result) {
        throw new Error('Registration failed');
      }

      this.logger.log(
        `✅ Registration successful for email: ${registerDto.email}`
      );

      return {
        user: result.user,
        message: 'Đăng ký thành công',
      };
    } catch (error) {
      this.logger.error(
        `❌ Registration failed for email: ${registerDto.email}`,
        error
      );
      throw handleError(error);
    }
  }
    @Get('profile')
  @Role(
    Roles.SYSTEM_ADMIN,
    Roles.PHYSICIAN,
    Roles.RECEPTION_STAFF,
    Roles.IMAGING_TECHNICIAN,
    Roles.RADIOLOGIST
  )
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: 200,
    description: 'Current user profile retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  async getCurrentProfile(@Req() req: IAuthenticatedRequest) {
    try {
      const userId = req['userInfo'].userId;

      this.logger.log(`📋 Fetching current profile for user ID: ${userId}`);

      const result = await firstValueFrom(
        this.userClient.send('UserService.Users.findOne', { id: userId })
      );

      if (!result) {
        throw new Error('User profile not found');
      }

      this.logger.log(
        `✅ Profile retrieved successfully for user ID: ${userId}`
      );

      return result;
    } catch (error) {
      this.logger.error(`❌ Failed to get current profile`, error);
      throw handleError(error);
    }
  }

  @Get('users')
  @Role(Roles.SYSTEM_ADMIN)
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({
    status: 200,
    description: 'Lấy danh sách người dùng thành công',
  })
  async getAllUsers(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('role') role?: string,
    @Query('excludeRole') excludeRole?: string,
    @Query('departmentId') departmentId?: string
  ) {
    try {
      const pageNum = page ? Number(page) : 1;
      const limitNum = limit ? Number(limit) : 10;

      this.logger.log(`Fetching users - Page: ${pageNum}, Limit: ${limitNum}`);

      const result = await firstValueFrom(
        this.userClient.send('user.get-all-users', {
          page: pageNum,
          limit: limitNum,
          search,
          role,
          excludeRole,
          departmentId,
        })
      );

      this.logger.log(
        `Retrieved ${result.data?.length || 0} users (Total: ${
          result.total || 0
        })`
      );

      return {
        data: result.data,
        count: result.total || result.data?.length || 0,
        message: 'Lấy danh sách người dùng thành công',
      };
    } catch (error) {
      this.logger.error('❌ Failed to fetch users', error);
      throw handleError(error);
    }
  }

  @Post('users')
  @UseGuards(AuthGuard)
  @Role(Roles.SYSTEM_ADMIN)
  @ApiOperation({ summary: 'Create user account (System Admin only)' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({
    status: 201,
    description: 'User account created successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Only system admin can create user accounts',
  })
  async createUser(
    @Body() createUserDto: CreateUserDto,
    @Req() req: IAuthenticatedRequest
  ) {
    try {
      const userId = req['userInfo'].userId;

      this.logger.log(
        `👤 Creating user account for email: ${createUserDto.email} by user: ${userId}`
      );

      const result = await firstValueFrom(
        this.userClient.send('user.create-staff-account', {
          createUserDto,
          createdBy: userId,
        })
      );

      if (!result) {
        throw new Error('Failed to create user account');
      }

      this.logger.log(
        `✅ User account created successfully for email: ${createUserDto.email}`
      );

      return {
        user: result.user,
        message: result.message || 'Tạo tài khoản người dùng thành công',
      };
    } catch (error) {
      this.logger.error(
        `❌ Failed to create user account for email: ${createUserDto.email}`,
        error
      );
      throw handleError(error);
    }
  }

  @Get('me')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get user info by token' })
  @ApiResponse({ status: 200, description: 'User info retrieved successfully' })
  async getUserInfoByToken(@Req() req: IAuthenticatedRequest) {
    try {
      const userId = req['userInfo'].userId;
      const result = await firstValueFrom(
        this.userClient.send('UserService.Users.findOne', { id: userId })
      );
      return result;
    } catch (error) {
      this.logger.error(`❌ Failed to get user info by token`, error);
      throw handleError(error);
    }
  }

  @Get(':id/room')
  @Role(Roles.SYSTEM_ADMIN, Roles.RECEPTION_STAFF, Roles.PHYSICIAN)
  async getUserByRoomIdAndSchedule(
    @Param('id') id: string,
    @Query('role') role: Roles,
    @Query('search') search: string
  ) {
    //Get schedule for current time
    try {
      const scheduleArray = await firstValueFrom(
        this.userClient.send(
          'UserService.RoomSchedule.GetOverlappingSchedule',
          { id, role, search }
        )
      );
      //map user from schedule's employeeRoomAssignments
      const userArray: User[] = [];
      scheduleArray.forEach((schedule: RoomSchedule) => {
        if (schedule.employeeRoomAssignments && schedule.employeeRoomAssignments.length > 0) {
          schedule.employeeRoomAssignments.forEach((assignment) => {
            if (assignment.employee && assignment.isActive) {
              // Avoid duplicates
              if (!userArray.find(u => u.id === assignment.employee.id)) {
                userArray.push(assignment.employee);
              }
            }
          });
        }
      });

      //get queue order to map over
      const userIds = userArray.map((user: User) => {
        return user.id;
      });

      const queueStats = await firstValueFrom(
        this._patientService.send(
          'PatientService.QueueAssignment.GetQueueStatus',
          { userIds }
        )
      );
      // Join them based on id
      const combined = userArray.map((user: any) => ({
        ...user,
        queueStats: queueStats[user.id] || null, // Fallback to null if no stats for this user
      }));

      return combined;
    } catch (error) {
      this.logger.error(` Failed to get user with queue info`, error);
      throw handleError(error);
    }
  }

  @Get('/:id')
  async getUserById(@Param('id') id: string) {
    try {
      const result = await firstValueFrom(
        this.userClient.send('UserService.Users.findOne', { id })
      );
      return result;
    } catch (error) {
      this.logger.error(` Failed to get user by id`, error);
      throw handleError(error);
    }
  }

  // ...existing code...


}
