import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { 
  InvalidCredentialsException,
  UserAlreadyExistsException,
  UserNotFoundException,
  OtpVerificationFailedException,
  RegistrationFailedException
} from '@backend/shared-exception';

@Controller()
export class UsersController {
  private readonly logger = new Logger('UsersController');

  constructor(private readonly usersService: UsersService) { }

  @MessagePattern('user.check-health')
  async checkHealth() {
    return { message: 'UserService is running' };
  }

  @MessagePattern('user.login')
  async login(@Payload() data: { email: string; password: string }) {
    try {
      this.logger.log(`Login attempt for email: ${data.email}`);
      const result = await this.usersService.login(data.email, data.password);

      if (!result) {
        throw new InvalidCredentialsException('Invalid email or password');
      }

      return result;
    } catch (error) {
      if (error instanceof InvalidCredentialsException) {
        throw error;
      }
      throw new InvalidCredentialsException('Login failed');
    }
  }

  @MessagePattern('user.request-login')
  async requestLogin(@Payload() data: { email: string; password: string }) {
    try {
      this.logger.log(`Request login attempt for email: ${data.email}`);
      const result = await this.usersService.requestLogin(data.email, data.password);
      return result;
    } catch (error) {
      if (error instanceof UserNotFoundException || error instanceof InvalidCredentialsException) {
        throw error;
      }
      throw new InvalidCredentialsException('Request login failed');
    }
  }

  @MessagePattern('user.verify-otp')
  async verifyOtp(@Payload() data: { email: string; code: string }) {
    try {
      this.logger.log(`OTP verification attempt for email: ${data.email}`);
      const result = await this.usersService.verifyLoginOtp(data.email, data.code);
      return result;
    } catch (error) {
      if (error instanceof OtpVerificationFailedException || error instanceof UserNotFoundException) {
        throw error;
      }
      throw new OtpVerificationFailedException('OTP verification failed');
    }
  }

  @MessagePattern('user.register')
  async register(@Payload() registerDto: {
    username: string;
    email: string;
    password: string;
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
        lastName: registerDto.lastName,
        phone: registerDto.phone,
        isVerified: false,
        isActive: true,
      };

      const result = await this.usersService.register(createUserDto);

      if (!result) {
        throw new RegistrationFailedException('Registration failed');
      }

      return result;
    } catch (error) {
      if (error instanceof UserAlreadyExistsException || error instanceof RegistrationFailedException) {
        throw error;
      }
      throw new RegistrationFailedException('Registration failed');
    }
  }

  @MessagePattern('user.get-all-users')
  async getAllUsers() {
    try {
      const result = await this.usersService.findAll();
      return result;
    } catch (error) {
      throw error;
    }
  }
}