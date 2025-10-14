import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { TokenResponseDto } from './dto/token-response.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { OtpService } from '../otps/otps.service';
import {
  InvalidCredentialsException,
  UserAlreadyExistsException,
  UserNotFoundException,
  OtpVerificationFailedException,
  OtpGenerationFailedException,
  TokenGenerationFailedException,
  DatabaseException,
  ValidationException,
  InvalidTokenException
} from '@backend/shared-exception';
  
@Injectable()
export class UsersService {
  constructor(
    private configService: ConfigService,
    private jwtService: JwtService,
    private otpService: OtpService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) { }

  async findByEmail(email: string): Promise<User | null> {
    try {
      if (!email) {
        throw new ValidationException('Email là bắt buộc');
      }

      return await this.userRepository.findOne({ where: { email } });
    } catch (error) {
      if (error instanceof ValidationException) {
        throw error;
      }
      throw new DatabaseException('Lỗi khi tìm kiếm người dùng theo email');
    }
  }

  async validateUser(email: string, password: string): Promise<any> {
    try {
      if (!email || !password) {
        throw new ValidationException('Email và password là bắt buộc');
      }

      const user = await this.findByEmail(email);
      if (!user) {
        throw new UserNotFoundException('Không tìm thấy người dùng với email này');
      }

      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
      if (!isPasswordValid) {
        throw new InvalidCredentialsException('Mật khẩu không đúng');
      }

      const { passwordHash, ...result } = user;
      return result;
    } catch (error) {
      if (error instanceof ValidationException ||
        error instanceof UserNotFoundException ||
        error instanceof InvalidCredentialsException) {
        throw error;
      }
      throw new DatabaseException('Lỗi khi xác thực người dùng');
    }
  }

  private generateTokens(user: any): TokenResponseDto {
    try {
      if (!user || !user.email || !user.id) {
        throw new ValidationException('Thông tin người dùng không hợp lệ để tạo token');
      }

      const payload = { email: user.email, sub: user.id, role: user.role };

      const jwtSecret = this.configService.get<string>('JWT_SECRET');
      const jwtRefreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET');

      if (!jwtSecret || !jwtRefreshSecret) {
        throw new TokenGenerationFailedException('Cấu hình JWT secret không hợp lệ');
      }

      const accessToken = this.jwtService.sign(payload, {
        secret: jwtSecret,
        expiresIn: this.configService.get<string>('JWT_EXPIRES_IN'),
      });

      const refreshToken = this.jwtService.sign(payload, {
        secret: jwtRefreshSecret,
        expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN'),
      });

      const expiresIn = this.configService.get<string>('JWT_EXPIRES_IN') || '1d';
      const expiresInMs = this.parseExpiresIn(expiresIn);
      const expiresAt = new Date(Date.now() + expiresInMs).toISOString();

      return {
        accessToken,
        refreshToken,
        expiresAt,
      };
    } catch (error) {
      if (error instanceof ValidationException || error instanceof TokenGenerationFailedException) {
        throw error;
      }
      throw new TokenGenerationFailedException('Không thể tạo token');
    }
  }

  private parseExpiresIn(expiresIn: string): number {
    try {
      const time = parseInt(expiresIn);
      const unit = expiresIn.slice(-1);

      if (isNaN(time) || time <= 0) {
        throw new ValidationException('Thời gian hết hạn token không hợp lệ');
      }

      switch (unit) {
        case 's':
          return time * 1000;
        case 'm':
          return time * 60 * 1000;
        case 'h':
          return time * 60 * 60 * 1000;
        case 'd':
          return time * 24 * 60 * 60 * 1000;
        default:
          return 24 * 60 * 60 * 1000;
      }
    } catch (error) {
      return 24 * 60 * 60 * 1000; // Default 1 day
    }
  }

  


  async findAll(): Promise<Omit<User, 'passwordHash'>[]> {
    try {
      const users = await this.userRepository.find({
        select: [
          'id',
          'username',
          'email',
          'firstName',
          'lastName',
          'phone',
          'employeeId',
          'isVerified',
          'role',
          'departmentId',
          'isActive',
          'createdAt',
          'updatedAt',
          'createdBy'
        ]
      });

      return users;
    } catch (error) {
      throw new DatabaseException('Lỗi khi lấy danh sách người dùng');
    }
  }

  async requestLogin(email: string, password: string): Promise<{
    success: boolean;
    message: string;
    requireOtp?: boolean
  }> {
    try {
      const user = await this.validateUser(email, password);

      if (!user) {
        throw new InvalidCredentialsException('Email hoặc mật khẩu không đúng');
      }

      await this.otpService.generateOtp(email);

      return {
        success: true,
        message: 'Mã OTP đã được gửi đến email của bạn',
        requireOtp: true
      };
    } catch (error: any) {
      if (error instanceof InvalidCredentialsException ||
        error instanceof ValidationException ||
        error instanceof UserNotFoundException) {
        throw error;
      }

      if (error?.message?.includes('OTP')) {
        throw new OtpGenerationFailedException('Không thể tạo mã OTP');
      }

      throw new DatabaseException('Lỗi trong quá trình yêu cầu đăng nhập');
    }
  }

  async verifyLoginOtp(email: string, otpCode: string): Promise<{
    tokenResponse?: TokenResponseDto;
    cookieOptions?: {
      name: string;
      value: string;
      options: {
        httpOnly: boolean;
        secure: boolean;
        sameSite: 'strict' | 'lax' | 'none';
        maxAge: number;
        path: string;
      }
    };
    success: boolean;
    message: string;
  } | null> {
    try {
      if (!email || !otpCode) {
        throw new ValidationException('Email và mã OTP là bắt buộc');
      }

      const isOtpValid = await this.otpService.verifyOtp({ email, code: otpCode });

      if (!isOtpValid) {
        throw new OtpVerificationFailedException('Mã OTP không hợp lệ hoặc đã hết hạn');
      }

      const user = await this.findByEmail(email);
      if (!user) {
        throw new UserNotFoundException('Không tìm thấy người dùng');
      }

      const { passwordHash, ...userWithoutPassword } = user;
      const tokenResponse = this.generateTokens(userWithoutPassword);

      const expiresIn = this.configService.get<string>('JWT_EXPIRES_IN') || '1d';
      const maxAge = this.parseExpiresIn(expiresIn);

      return {
        success: true,
        message: 'Đăng nhập thành công',
        tokenResponse,
        cookieOptions: {
          name: 'access_token',
          value: tokenResponse.accessToken,
          options: {
            httpOnly: true,
            secure: this.configService.get<string>('NODE_ENV') === 'production',
            sameSite: 'strict',
            maxAge: maxAge,
            path: '/',
          }
        }
      };
    } catch (error) {
      if (error instanceof ValidationException ||
        error instanceof OtpVerificationFailedException ||
        error instanceof UserNotFoundException ||
        error instanceof TokenGenerationFailedException) {
        throw error;
      }

      throw new DatabaseException('Lỗi trong quá trình xác thực OTP');
    }
  }

  async login(email: string, password: string): Promise<{
    tokenResponse: TokenResponseDto;
    cookieOptions: {
      name: string;
      value: string;
      options: {
        httpOnly: boolean;
        secure: boolean;
        sameSite: 'strict' | 'lax' | 'none';
        maxAge: number;
        path: string;
      }
    }
  } | null> {
    try {
      const user = await this.validateUser(email, password);

      if (!user) {
        throw new InvalidCredentialsException('Email hoặc mật khẩu không đúng');
      }

      const tokenResponse = this.generateTokens(user);
      const expiresIn = this.configService.get<string>('JWT_EXPIRES_IN') || '1d';
      const maxAge = this.parseExpiresIn(expiresIn);

      return {
        tokenResponse,
        cookieOptions: {
          name: 'access_token',
          value: tokenResponse.accessToken,
          options: {
            httpOnly: true,
            secure: this.configService.get<string>('NODE_ENV') === 'production',
            sameSite: 'strict',
            maxAge: maxAge,
            path: '/',
          }
        }
      };
    } catch (error) {
      if (error instanceof InvalidCredentialsException ||
        error instanceof ValidationException ||
        error instanceof UserNotFoundException ||
        error instanceof TokenGenerationFailedException) {
        throw error;
      }

      throw new DatabaseException('Lỗi trong quá trình đăng nhập');
    }
  }
  async register(createUserDto: CreateUserDto): Promise<Omit<User, 'passwordHash'> | null> {
    try {
      // Validation
      if (!createUserDto.password) {
        throw new ValidationException('Password là bắt buộc');
      }

      if (!createUserDto.email) {
        throw new ValidationException('Email là bắt buộc');
      }

      if (!createUserDto.username) {
        throw new ValidationException('Username là bắt buộc');
      }

      if (!createUserDto.firstName || !createUserDto.lastName) {
        throw new ValidationException('Họ và tên là bắt buộc');
      }

      // Check existing email
      const existingUserByEmail = await this.findByEmail(createUserDto.email);
      if (existingUserByEmail) {
        throw new UserAlreadyExistsException('Email đã được sử dụng');
      }

      // Check existing username
      const existingUserByUsername = await this.userRepository.findOne({
        where: { username: createUserDto.username }
      });
      if (existingUserByUsername) {
        throw new UserAlreadyExistsException('Tên đăng nhập đã được sử dụng');
      }

      // Check existing employeeId if provided
      if (createUserDto.employeeId) {
        const existingUserByEmployeeId = await this.userRepository.findOne({
          where: { employeeId: createUserDto.employeeId }
        });
        if (existingUserByEmployeeId) {
          throw new UserAlreadyExistsException('Mã nhân viên đã được sử dụng');
        }
      }

      // Hash password
      const passwordHash = await bcrypt.hash(createUserDto.password, 10);

      // Create new user
      const newUser = this.userRepository.create({
        username: createUserDto.username,
        email: createUserDto.email,
        passwordHash,
        firstName: createUserDto.firstName,
        lastName: createUserDto.lastName,
        phone: createUserDto.phone,
        employeeId: createUserDto.employeeId,
        isVerified: createUserDto.isVerified || false,
        role: createUserDto.role,
        departmentId: createUserDto.departmentId,
        isActive: createUserDto.isActive !== undefined ? createUserDto.isActive : true,
        createdBy: createUserDto.createdBy,
      });

      const savedUser = await this.userRepository.save(newUser);
      const { passwordHash: _, ...userWithoutPassword } = savedUser;
      return userWithoutPassword;
    } catch (error: any) {
      if (error instanceof ValidationException ||
        error instanceof UserAlreadyExistsException) {
        throw error;
      }
      if (error?.code === '23505' || error?.message?.includes('duplicate')) {
        if (error?.message?.includes('email')) {
          throw new UserAlreadyExistsException('Email đã được sử dụng');
        }
        if (error?.message?.includes('username')) {
          throw new UserAlreadyExistsException('Tên đăng nhập đã được sử dụng');
        }
        if (error?.message?.includes('employeeId')) {
          throw new UserAlreadyExistsException('Mã nhân viên đã được sử dụng');
        }
        throw new UserAlreadyExistsException('Thông tin đã được sử dụng');
      }

      console.error('Register error:', error);
      throw new DatabaseException('Lỗi trong quá trình đăng ký');
    }
  }

 

  async verifyToken(token: string): Promise<any> {
  try {
    const jwtSecret = this.configService.get<string>('JWT_SECRET');
    if (!jwtSecret) {
      throw new TokenGenerationFailedException('JWT_SECRET không được cấu hình');
    }

    // Xác minh và decode token
    const decoded = this.jwtService.verify(token, { secret: jwtSecret });
    return decoded; // { email, sub: userId, role }
  } catch (error) {
    throw new InvalidTokenException();
  }
}

   

  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}