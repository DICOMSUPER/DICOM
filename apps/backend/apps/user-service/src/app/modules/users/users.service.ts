import { Injectable } from '@nestjs/common';
import { CreateUserDto, Department } from '@backend/shared-domain';
import { UpdateUserDto } from '@backend/shared-domain';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { TokenResponseDto } from '@backend/shared-domain';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '@backend/shared-domain';
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
  InvalidTokenException,
} from '@backend/shared-exception';
import { Roles } from '@backend/shared-enums';

@Injectable()
export class UsersService {
  constructor(
    private configService: ConfigService,
    private jwtService: JwtService,
    private otpService: OtpService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Department)
    private departmentRepository: Repository<Department>
  ) {}

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
        throw new UserNotFoundException(
          undefined,
          'Không tìm thấy người dùng với email này'
        );
      }

      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
      if (!isPasswordValid) {
        throw new InvalidCredentialsException('Mật khẩu không đúng');
      }

      const { passwordHash, ...result } = user;
      return result;
    } catch (error) {
      if (
        error instanceof ValidationException ||
        error instanceof UserNotFoundException ||
        error instanceof InvalidCredentialsException
      ) {
        throw error;
      }
      throw new DatabaseException('Lỗi khi xác thực người dùng');
    }
  }

  private generateTokens(user: any): TokenResponseDto {
    try {
      if (!user || !user.email || !user.id) {
        throw new ValidationException(
          'Thông tin người dùng không hợp lệ để tạo token'
        );
      }

      const payload = { email: user.email, sub: user.id, role: user.role };

      const jwtSecret = this.configService.get<string>('JWT_SECRET');
      const jwtRefreshSecret =
        this.configService.get<string>('JWT_REFRESH_SECRET');

      if (!jwtSecret || !jwtRefreshSecret) {
        throw new TokenGenerationFailedException(
          'Cấu hình JWT secret không hợp lệ'
        );
      }

      const accessToken = this.jwtService.sign(payload, {
        secret: jwtSecret,
        expiresIn: this.configService.get<string>('JWT_EXPIRES_IN'),
      });
      const refreshToken = this.jwtService.sign(payload, {
        secret: jwtRefreshSecret,
        expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN'),
      });

      const expiresIn =
        this.configService.get<string>('JWT_EXPIRES_IN') || '1d';
      const expiresInMs = this.parseExpiresIn(expiresIn);
      const expiresAt = new Date(Date.now() + expiresInMs).toISOString();
      return {
        accessToken,
        refreshToken,
        expiresAt,
      };
    } catch (error) {
      if (
        error instanceof ValidationException ||
        error instanceof TokenGenerationFailedException
      ) {
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

  async findAll(query: {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean;
    role?: string;
    excludeRole?: string;
    departmentId?: string;
    includeInactive?: boolean;
    includeDeleted?: boolean;
    sortField?: string;
    order?: 'asc' | 'desc';
  }) {
    try {
      const page = query.page ?? 1;
      const limit = query.limit ?? 10;
      const skip = (page - 1) * limit;

      const qb = this.userRepository
        .createQueryBuilder('user')
        .leftJoinAndSelect('user.department', 'department')
        .select([
          'user.id',
          'user.username',
          'user.email',
          'user.firstName',
          'user.lastName',
          'user.phone',
          'user.employeeId',
          'user.isVerified',
          'user.role',
          'user.departmentId',
          'user.isActive',
          'user.createdAt',
          'user.updatedAt',
          'user.createdBy',
          'department.id',
          'department.departmentName',
          'department.departmentCode',
          'department.description',
          'department.isActive',
        ])
        .skip(skip)
        .take(limit);

      const mapSortField = (fieldName: string): string => {
        const allowedSortFields = ['username', 'email', 'employeeId'];

        if (!allowedSortFields.includes(fieldName)) {
          return 'user.createdAt';
        }

        return `user.${fieldName}`;
      };

      if (query.sortField && query.order) {
        const field = mapSortField(query.sortField);
        const direction = query.order.toUpperCase() as 'ASC' | 'DESC';
        qb.orderBy(field, direction);
      } else {
        qb.orderBy('user.createdAt', 'DESC');
      }

      if (!query.includeDeleted) {
        qb.where('user.isDeleted = :isDeleted', { isDeleted: false });
      }

      if (query.search) {
        qb.andWhere(
          '(user.username ILIKE :search OR user.email ILIKE :search OR user.firstName ILIKE :search OR user.lastName ILIKE :search)',
          { search: `%${query.search}%` }
        );
      }

      if (query.isActive !== undefined && !query.includeInactive) {
        qb.andWhere('user.isActive = :isActive', { isActive: query.isActive });
      } else if (!query.includeInactive) {
        qb.andWhere('user.isActive = :isActive', { isActive: true });
      }

      if (query.role) {
        qb.andWhere('user.role = :role', { role: query.role });
      }

      if (query.excludeRole) {
        qb.andWhere('user.role != :excludeRole', {
          excludeRole: query.excludeRole,
        });
      }

      if (query.departmentId) {
        qb.andWhere('user.departmentId = :departmentId', {
          departmentId: query.departmentId,
        });
      }

      const [data, total] = await qb.getManyAndCount();

      return {
        data: {
          data,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
          count: data.length,
        },
        message: 'Lấy danh sách người dùng thành công',
      };
    } catch (error) {
      throw new DatabaseException('Lỗi khi lấy danh sách người dùng');
    }
  }

  async findAllWithoutPagination(query?: {
    search?: string;
    isActive?: boolean;
    role?: string;
    excludeRole?: string;
    departmentId?: string;
    includeInactive?: boolean;
    includeDeleted?: boolean;
  }): Promise<User[]> {
    try {
      const qb = this.userRepository
        .createQueryBuilder('user')
        .leftJoinAndSelect('user.department', 'department')
        .orderBy('user.createdAt', 'DESC');

      if (!query?.includeDeleted) {
        qb.where('user.isDeleted = :isDeleted', { isDeleted: false });
      }

      if (query?.search) {
        qb.andWhere(
          '(user.username ILIKE :search OR user.email ILIKE :search OR user.firstName ILIKE :search OR user.lastName ILIKE :search)',
          { search: `%${query.search}%` }
        );
      }

      if (query?.isActive !== undefined && !query.includeInactive) {
        qb.andWhere('user.isActive = :isActive', { isActive: query.isActive });
      } else if (!query?.includeInactive) {
        qb.andWhere('user.isActive = :isActive', { isActive: true });
      }

      if (query?.role) {
        qb.andWhere('user.role = :role', { role: query.role });
      }

      if (query?.excludeRole) {
        qb.andWhere('user.role != :excludeRole', {
          excludeRole: query.excludeRole,
        });
      }

      if (query?.departmentId) {
        qb.andWhere('user.departmentId = :departmentId', {
          departmentId: query.departmentId,
        });
      }

      const data = await qb.getMany();
      return data;
    } catch (error: any) {
      console.error(
        `Error in findAllWithoutPagination: ${error?.message}`,
        error?.stack
      );
      throw new DatabaseException('Lỗi khi lấy danh sách người dùng');
    }
  }

  async requestLogin(
    email: string,
    password: string
  ): Promise<{
    success: boolean;
    message: string;
    requireOtp?: boolean;
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
        requireOtp: true,
      };
    } catch (error: any) {
      if (
        error instanceof InvalidCredentialsException ||
        error instanceof ValidationException ||
        error instanceof UserNotFoundException
      ) {
        throw error;
      }

      if (error?.message?.includes('OTP')) {
        throw new OtpGenerationFailedException('Không thể tạo mã OTP');
      }

      throw new DatabaseException('Lỗi trong quá trình yêu cầu đăng nhập');
    }
  }

  async verifyLoginOtp(
    email: string,
    otpCode: string
  ): Promise<{
    tokenResponse?: TokenResponseDto;
    cookieOptions?: {
      name: string;
      value: string;
      options: {
        httpOnly: boolean;
        secure: boolean;
        sameSite: 'none';
        maxAge: number;
        path: string;
      };
    };
    success: boolean;
    message: string;
  } | null> {
    try {
      if (!email || !otpCode) {
        throw new ValidationException('Email và mã OTP là bắt buộc');
      }

      const isOtpValid = await this.otpService.verifyOtp({
        email,
        code: otpCode,
      });

      if (!isOtpValid) {
        throw new OtpVerificationFailedException(
          'Mã OTP không hợp lệ hoặc đã hết hạn'
        );
      }

      const user = await this.findByEmail(email);
      if (!user) {
        throw new UserNotFoundException(undefined, 'Không tìm thấy người dùng');
      }

      const { passwordHash, ...userWithoutPassword } = user;
      const tokenResponse = this.generateTokens(userWithoutPassword);

      const expiresIn =
        this.configService.get<string>('JWT_EXPIRES_IN') || '1d';
      const maxAge = this.parseExpiresIn(expiresIn);

      const isProduction = this.configService.get<string>('NODE_ENV') === 'production';
      
      return {
        success: true,
        message: 'Đăng nhập thành công',
        tokenResponse,
        cookieOptions: {
          name: 'accessToken',
          value: tokenResponse.accessToken,
          options: {
            httpOnly: true,
            secure: isProduction, // true in production (HTTPS), false in dev (HTTP)
            sameSite: isProduction ? 'none' : 'lax', // 'none' requires secure:true
            maxAge: maxAge,
            path: '/',
          },
        },
      };
    } catch (error) {
      if (
        error instanceof ValidationException ||
        error instanceof OtpVerificationFailedException ||
        error instanceof UserNotFoundException ||
        error instanceof TokenGenerationFailedException
      ) {
        throw error;
      }

      throw new DatabaseException('Lỗi trong quá trình xác thực OTP');
    }
  }

  async login(
    email: string,
    password: string
  ): Promise<{
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
      };
    };
  } | null> {
    try {
      const user = await this.validateUser(email, password);

      if (!user) {
        throw new InvalidCredentialsException('Email hoặc mật khẩu không đúng');
      }

      const tokenResponse = this.generateTokens(user);
      const expiresIn =
        this.configService.get<string>('JWT_EXPIRES_IN') || '1d';
      const maxAge = this.parseExpiresIn(expiresIn);

      // Cookie settings must be consistent for login/logout to work properly
      const isProduction = this.configService.get<string>('NODE_ENV') === 'production';
      
      return {
        tokenResponse,
        cookieOptions: {
          name: 'accessToken',
          value: tokenResponse.accessToken,
          options: {
            httpOnly: true,
            secure: isProduction, // true in production (HTTPS), false in dev (HTTP)
            sameSite: isProduction ? 'none' : 'lax', // 'none' requires secure:true
            maxAge: maxAge,
            path: '/',
          },
        },
      };
    } catch (error) {
      if (
        error instanceof InvalidCredentialsException ||
        error instanceof ValidationException ||
        error instanceof UserNotFoundException ||
        error instanceof TokenGenerationFailedException
      ) {
        throw error;
      }

      throw new DatabaseException('Lỗi trong quá trình đăng nhập');
    }
  }
  async register(
    createUserDto: CreateUserDto
  ): Promise<Omit<User, 'passwordHash'> | null> {
    try {
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

      const existingUserByEmail = await this.findByEmail(createUserDto.email);
      if (existingUserByEmail) {
        throw new UserAlreadyExistsException('Email đã được sử dụng');
      }

      const existingUserByUsername = await this.userRepository.findOne({
        where: { username: createUserDto.username },
      });
      if (existingUserByUsername) {
        throw new UserAlreadyExistsException('Tên đăng nhập đã được sử dụng');
      }

      if (createUserDto.employeeId) {
        const existingUserByEmployeeId = await this.userRepository.findOne({
          where: { employeeId: createUserDto.employeeId },
        });
        if (existingUserByEmployeeId) {
          throw new UserAlreadyExistsException('Mã nhân viên đã được sử dụng');
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
        isActive:
          createUserDto.isActive !== undefined ? createUserDto.isActive : true,
        createdBy: createUserDto.createdBy,
      });

      const savedUser = await this.userRepository.save(newUser);
      const { passwordHash: _, ...userWithoutPassword } = savedUser;
      return userWithoutPassword as Omit<User, 'passwordHash'>;
    } catch (error: any) {
      if (
        error instanceof ValidationException ||
        error instanceof UserAlreadyExistsException
      ) {
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

      throw new DatabaseException('Lỗi trong quá trình đăng ký');
    }
  }

  async createStaffAccount(
    createUserDto: CreateUserDto,
    createdBy?: string
  ): Promise<Omit<User, 'passwordHash'> | null> {
    const staffAccountDto: CreateUserDto = {
      ...createUserDto,
      isVerified:
        createUserDto.isVerified !== undefined
          ? createUserDto.isVerified
          : true,
      createdBy: createdBy || createUserDto.createdBy,
    };
    return this.register(staffAccountDto);
  }

  async verifyToken(token: string): Promise<any> {
    try {
      const jwtSecret = this.configService.get<string>('JWT_SECRET');
      if (!jwtSecret) {
        throw new TokenGenerationFailedException(
          'JWT_SECRET không được cấu hình'
        );
      }

      const decoded = this.jwtService.verify(token, { secret: jwtSecret });

      return decoded; // { email, sub: userId, role }
    } catch (error) {
      throw new InvalidTokenException();
    }
  }

  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }

  async findOne(id: string) {
    try {
      const user = await this.userRepository.findOne({
        where: { id, isActive: true },
        relations: ['department'],
      });
      if (!user) {
        throw new UserNotFoundException(undefined, 'Không tìm thấy người dùng');
      }
      const { passwordHash, ...userWithoutPassword } = user;
      if (userWithoutPassword) {
        return userWithoutPassword;
      }
      throw new UserNotFoundException(undefined, 'Người dùng đã bị xóa');
    } catch (error) {
      // Re-throw UserNotFoundException to preserve the original error
      if (error instanceof UserNotFoundException) {
        throw error;
      }
      // Only throw DatabaseException for actual database errors
      throw new DatabaseException('Lỗi khi lấy người dùng');
    }
  }

  async findByRole(role: Roles, take: number = 10): Promise<User[]> {
    try {
      if (!role) {
        throw new ValidationException('Role is required');
      }

      const users = await this.userRepository.find({
        where: { role, isActive: true },
        take,
        order: { createdAt: 'ASC' },
      });

      return users;
    } catch (error) {
      if (error instanceof ValidationException) {
        throw error;
      }
      throw new DatabaseException(`Error finding users by role: ${role}`);
    }
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto
  ): Promise<Omit<User, 'passwordHash'>> {
    try {
      if (!id) {
        throw new ValidationException('User ID is required');
      }

      const user = await this.userRepository.findOne({
        where: { id },
        relations: ['department'],
      });

      if (!user) {
        throw new UserNotFoundException(undefined, 'Không tìm thấy người dùng');
      }

      if (updateUserDto.email && updateUserDto.email !== user.email) {
        const existingUserByEmail = await this.findByEmail(updateUserDto.email);
        if (existingUserByEmail && existingUserByEmail.id !== id) {
          throw new UserAlreadyExistsException('Email đã được sử dụng');
        }
      }

      if (updateUserDto.username && updateUserDto.username !== user.username) {
        const existingUserByUsername = await this.userRepository.findOne({
          where: { username: updateUserDto.username },
        });
        if (existingUserByUsername && existingUserByUsername.id !== id) {
          throw new UserAlreadyExistsException('Tên đăng nhập đã được sử dụng');
        }
      }

      if (
        updateUserDto.employeeId &&
        updateUserDto.employeeId !== user.employeeId
      ) {
        const existingUserByEmployeeId = await this.userRepository.findOne({
          where: { employeeId: updateUserDto.employeeId },
        });
        if (existingUserByEmployeeId && existingUserByEmployeeId.id !== id) {
          throw new UserAlreadyExistsException('Mã nhân viên đã được sử dụng');
        }
      }

      const targetDepartmentId = updateUserDto.targetDepartmentId;
      const sentDepartmentId = updateUserDto.departmentId;
      const isChangingDepartment =
        sentDepartmentId !== undefined &&
        sentDepartmentId !== user.departmentId;
      const effectiveDepartmentId =
        sentDepartmentId !== undefined ? sentDepartmentId : user.departmentId;

      if (targetDepartmentId !== undefined) {
        if (targetDepartmentId) {
          const targetDepartment = await this.departmentRepository.findOne({
            where: { id: targetDepartmentId },
          });
          if (!targetDepartment) {
            throw new ValidationException('Phòng ban không tồn tại');
          }

          if (targetDepartmentId !== effectiveDepartmentId) {
            if (isChangingDepartment) {
              throw new ValidationException(
                `Phòng ban làm việc mới phải khớp với phòng ban trưởng phòng. Người dùng chỉ có thể là trưởng phòng của phòng ban mà họ đang làm việc.`
              );
            } else {
              throw new ValidationException(
                `Phòng ban trưởng phòng phải khớp với phòng ban làm việc hiện tại. Người dùng chỉ có thể là trưởng phòng của phòng ban mà họ đang làm việc.`
              );
            }
          }
        }
      }

      const currentHeadDepartments = await this.departmentRepository.find({
        where: { headDepartmentId: id },
      });

      if (isChangingDepartment && currentHeadDepartments.length > 0) {
        if (
          targetDepartmentId === undefined ||
          (targetDepartmentId !== null &&
            targetDepartmentId !== sentDepartmentId)
        ) {
          const departmentNames = currentHeadDepartments
            .map((dept) => dept.departmentName)
            .join(', ');
          throw new ValidationException(
            `Người dùng đang là trưởng phòng của ${departmentNames}. Khi thay đổi phòng ban, phải đặt người dùng làm trưởng phòng của phòng ban mới hoặc bổ nhiệm trưởng phòng mới trước khi thay đổi.`
          );
        }
      }

      const departmentsToUpdate: {
        departmentId: string;
        headUserId: string | null;
      }[] = [];

      if (targetDepartmentId !== undefined) {
        for (const dept of currentHeadDepartments) {
          if (dept.id !== targetDepartmentId) {
            departmentsToUpdate.push({
              departmentId: dept.id,
              headUserId: null,
            });
          }
        }

        if (targetDepartmentId) {
          const existingUpdate = departmentsToUpdate.find(
            (d) => d.departmentId === targetDepartmentId
          );
          if (!existingUpdate) {
            departmentsToUpdate.push({
              departmentId: targetDepartmentId,
              headUserId: id,
            });
          } else {
            existingUpdate.headUserId = id;
          }
        } else {
          for (const dept of currentHeadDepartments) {
            departmentsToUpdate.push({
              departmentId: dept.id,
              headUserId: null,
            });
          }
        }
      }

      for (const deptUpdate of departmentsToUpdate) {
        try {
          const department = await this.departmentRepository.findOne({
            where: { id: deptUpdate.departmentId },
          });
          if (!department) {
            throw new ValidationException(
              `Không tìm thấy phòng ban với ID: ${deptUpdate.departmentId}`
            );
          }
          department.headDepartmentId = deptUpdate.headUserId;
          await this.departmentRepository.save(department);
        } catch (deptError: any) {
          if (deptError instanceof ValidationException) {
            throw deptError;
          }
          throw new DatabaseException(
            `Lỗi khi cập nhật phòng ban: ${
              deptError?.message || 'Unknown error'
            }`
          );
        }
      }

      const {
        targetDepartmentId: _,
        departmentId: departmentIdToUpdate,
        ...userUpdateData
      } = updateUserDto;

      if (userUpdateData.password) {
        try {
          const hashedPassword = await bcrypt.hash(userUpdateData.password, 10);
          user.passwordHash = hashedPassword;
          delete userUpdateData.password;
        } catch (hashError: any) {
          throw new DatabaseException(
            `Lỗi khi mã hóa mật khẩu: ${hashError?.message || 'Unknown error'}`
          );
        }
      }

      try {
        Object.assign(user, userUpdateData);
        if (departmentIdToUpdate !== undefined) {
          user.departmentId = departmentIdToUpdate;
          user.department && (user.department.id = departmentIdToUpdate!);
        }
        const updatedUser = await this.userRepository.save(user);
        if (
          departmentIdToUpdate !== undefined &&
          updatedUser.departmentId !== departmentIdToUpdate
        ) {
          throw new DatabaseException(
            `Failed to update departmentId. Expected: ${departmentIdToUpdate}, Got: ${updatedUser.departmentId}`
          );
        }
        const { passwordHash, ...userWithoutPassword } = updatedUser;
        return userWithoutPassword as Omit<User, 'passwordHash'>;
      } catch (saveError: any) {
        if (
          saveError?.code === '23505' ||
          saveError?.message?.includes('duplicate')
        ) {
          if (
            saveError?.message?.includes('email') ||
            saveError?.constraint?.includes('email')
          ) {
            throw new UserAlreadyExistsException('Email đã được sử dụng');
          }
          if (
            saveError?.message?.includes('username') ||
            saveError?.constraint?.includes('username')
          ) {
            throw new UserAlreadyExistsException(
              'Tên đăng nhập đã được sử dụng'
            );
          }
          if (
            saveError?.message?.includes('employeeId') ||
            saveError?.constraint?.includes('employee_id')
          ) {
            throw new UserAlreadyExistsException(
              'Mã nhân viên đã được sử dụng'
            );
          }
          throw new UserAlreadyExistsException('Thông tin đã được sử dụng');
        }
        throw new DatabaseException(
          `Lỗi khi lưu thông tin người dùng: ${
            saveError?.message || 'Unknown error'
          }`
        );
      }
    } catch (error: any) {
      if (
        error instanceof ValidationException ||
        error instanceof UserNotFoundException ||
        error instanceof UserAlreadyExistsException ||
        error instanceof DatabaseException
      ) {
        throw error;
      }
      throw new DatabaseException(
        `Lỗi khi cập nhật người dùng: ${error?.message || 'Unknown error'}`
      );
    }
  }

  async disable(id: string): Promise<Omit<User, 'passwordHash'>> {
    try {
      if (!id) {
        throw new ValidationException('User ID is required');
      }

      const user = await this.userRepository.findOne({
        where: { id },
        relations: ['department'],
      });

      if (!user) {
        throw new UserNotFoundException(undefined, 'Không tìm thấy người dùng');
      }

      user.isActive = false;

      const updatedUser = await this.userRepository.save(user);
      const { passwordHash, ...userWithoutPassword } = updatedUser;
      return userWithoutPassword as Omit<User, 'passwordHash'>;
    } catch (error: any) {
      if (
        error instanceof ValidationException ||
        error instanceof UserNotFoundException
      ) {
        throw error;
      }
      throw new DatabaseException('Lỗi khi vô hiệu hóa người dùng');
    }
  }

  async enable(id: string): Promise<Omit<User, 'passwordHash'>> {
    try {
      if (!id) {
        throw new ValidationException('User ID is required');
      }

      const user = await this.userRepository.findOne({
        where: { id },
        relations: ['department'],
      });

      if (!user) {
        throw new UserNotFoundException(undefined, 'Không tìm thấy người dùng');
      }

      user.isActive = true;

      const updatedUser = await this.userRepository.save(user);
      const { passwordHash, ...userWithoutPassword } = updatedUser;
      return userWithoutPassword as Omit<User, 'passwordHash'>;
    } catch (error: any) {
      if (
        error instanceof ValidationException ||
        error instanceof UserNotFoundException
      ) {
        throw error;
      }
      throw new DatabaseException('Lỗi khi kích hoạt người dùng');
    }
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  findUsersByIds = async (userIds: string[]): Promise<User[]> => {
    if (!userIds || userIds.length === 0) {
      return [];
    }
    const users = await this.userRepository
      .createQueryBuilder('user')
      .andWhere('user.id IN (:...userIds)', { userIds })
      .getMany();

    return users;
  };

  async getStats(): Promise<{
    totalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
    verifiedUsers: number;
  }> {
    try {
      const [totalUsers, activeUsers, inactiveUsers, verifiedUsers] =
        await Promise.all([
          this.userRepository.count({ where: { isDeleted: false } }),
          this.userRepository.count({
            where: { isActive: true, isDeleted: false },
          }),
          this.userRepository.count({
            where: { isActive: false, isDeleted: false },
          }),
          this.userRepository.count({
            where: { isVerified: true, isDeleted: false },
          }),
        ]);

      return {
        totalUsers,
        activeUsers,
        inactiveUsers,
        verifiedUsers,
      };
    } catch (error) {
      throw new DatabaseException('Lỗi khi lấy thống kê người dùng');
    }
  }
}
