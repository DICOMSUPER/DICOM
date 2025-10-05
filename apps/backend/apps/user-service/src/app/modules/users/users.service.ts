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
    return this.userRepository.findOne({ where: { email } });
  }

  async validateUser(email: string, password: string): Promise<any> {
    try {
      const user = await this.findByEmail(email);
      if (!user) return null;

      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

      if (isPasswordValid) {
        const { passwordHash, ...result } = user;
        return result;
      }

      return null;
    } catch (error) {
      return null;
    }
  }

  private generateTokens(user: any): TokenResponseDto {
    const payload = { email: user.email, sub: user.id, role: user.role };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: this.configService.get<string>('JWT_EXPIRES_IN'),
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
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
  }

  private parseExpiresIn(expiresIn: string): number {
    const time = parseInt(expiresIn);
    const unit = expiresIn.slice(-1);

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
  }
  async findAll(): Promise<Omit<User, 'passwordHash'>[]> {
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
  }

async requestLogin(email: string, password: string): Promise<{ 
  success: boolean; 
  message: string; 
  requireOtp?: boolean 
}> {
  const user = await this.validateUser(email, password);

  if (!user) {
    return { 
      success: false, 
      message: 'Email hoặc mật khẩu không đúng' 
    };
  }

  await this.otpService.generateOtp(email);

  return {
    success: true,
    message: 'Mã OTP đã được gửi đến email của bạn',
    requireOtp: true
  };
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
  const isOtpValid = await this.otpService.verifyOtp({ email, code: otpCode });
  
  if (!isOtpValid) {
    return {
      success: false,
      message: 'Mã OTP không hợp lệ hoặc đã hết hạn'
    };
  }

  const user = await this.findByEmail(email);
  if (!user) {
    return {
      success: false,
      message: 'Không tìm thấy người dùng'
    };
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
    const user = await this.validateUser(email, password);

    if (!user) {
      return null;
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
  }


  async register(createUserDto: CreateUserDto): Promise<Omit<User, 'passwordHash'> | null> {
    try {
      if (!createUserDto.password) {
        throw new Error('Password là bắt buộc');
      }

      const existingUserByEmail = await this.findByEmail(createUserDto.email);
      if (existingUserByEmail) {
        throw new Error('Email đã được sử dụng');
      }

      const existingUserByUsername = await this.userRepository.findOne({
        where: { username: createUserDto.username }
      });
      if (existingUserByUsername) {
        throw new Error('Tên đăng nhập đã được sử dụng');
      }

      if (createUserDto.employeeId) {
        const existingUserByEmployeeId = await this.userRepository.findOne({
          where: { employeeId: createUserDto.employeeId }
        });
        if (existingUserByEmployeeId) {
          throw new Error('Mã nhân viên đã được sử dụng');
        }
      }

      const passwordHash = await bcrypt.hash(createUserDto.password, 10);

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
    } catch (error) {
      console.error('Register error:', error);
      throw error;
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