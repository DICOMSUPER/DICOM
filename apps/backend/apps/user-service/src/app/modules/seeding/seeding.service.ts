import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ShiftTemplate, Department, Room, User } from '@backend/shared-domain';
import { ShiftType, Roles } from '@backend/shared-enums';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SeedingService {
  private readonly logger = new Logger(SeedingService.name);

  constructor(
    @InjectRepository(ShiftTemplate)
    private readonly shiftTemplateRepository: Repository<ShiftTemplate>,
    @InjectRepository(Department)
    private readonly departmentRepository: Repository<Department>,
    @InjectRepository(Room)
    private readonly roomRepository: Repository<Room>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async runSeeding(): Promise<void> {
    this.logger.log('🌱 Starting User Service database seeding...');
    
    try {
      await this.seedDepartments();
      await this.seedUsers();
      await this.seedRooms();
      await this.seedShiftTemplates();
      
      this.logger.log('✅ User Service database seeding completed successfully!');
    } catch (error: any) {
      this.logger.error('❌ User Service database seeding failed:', error);
      throw error;
    }
  }

  async seedDepartments(): Promise<void> {
    this.logger.log('🏢 Seeding departments...');
    
    const departments = [
      {
        departmentName: 'Khoa Nội',
        departmentCode: 'KN',
        description: 'Khoa Nội tổng hợp',
        isActive: true,
      },
      {
        departmentName: 'Khoa Ngoại',
        departmentCode: 'KNG',
        description: 'Khoa Ngoại tổng hợp',
        isActive: true,
      },
      {
        departmentName: 'Khoa Sản',
        departmentCode: 'KS',
        description: 'Khoa Sản phụ khoa',
        isActive: true,
      },
      {
        departmentName: 'Khoa Nhi',
        departmentCode: 'KNH',
        description: 'Khoa Nhi',
        isActive: true,
      },
      {
        departmentName: 'Khoa Cấp Cứu',
        departmentCode: 'KCC',
        description: 'Khoa Cấp cứu',
        isActive: true,
      },
      {
        departmentName: 'Khoa Chẩn Đoán Hình Ảnh',
        departmentCode: 'KCDHA',
        description: 'Khoa Chẩn đoán hình ảnh',
        isActive: true,
      },
    ];

    for (const dept of departments) {
      const existing = await this.departmentRepository.findOne({
        where: { departmentCode: dept.departmentCode }
      });

      if (!existing) {
        const newDept = this.departmentRepository.create(dept);
        await this.departmentRepository.save(newDept);
        this.logger.log(`✅ Created department: ${dept.departmentName}`);
      } else {
        this.logger.log(`⚠️ Department already exists: ${dept.departmentName}`);
      }
    }
  }

  async seedUsers(): Promise<void> {
    this.logger.log('👥 Seeding users...');
    
    // Get first department for admin
    const firstDept = await this.departmentRepository.findOne({
      where: { isActive: true }
    });
    if (!firstDept) {
      this.logger.warn('⚠️ No departments found, skipping user seeding');
      return;
    }

    const users = [
      {
        username: 'system_admin',
        email: 'system_admin@hospital.com',
        password: 'system_admin123',
        firstName: 'System',
        lastName: 'Administrator',
        phone: '0123456789',
        employeeId: 'EMP001',
        isVerified: true,
        role: Roles.SYSTEM_ADMIN,
        departmentId: firstDept.id,
        isActive: true,
      },
      {
        username: 'physician',
        email: 'physician@hospital.com',
        password: 'physician123',
        firstName: 'Nguyễn Văn',
        lastName: 'Bác Sĩ',
        phone: '0123456790',
        employeeId: 'EMP002',
        isVerified: true,
        role: Roles.PHYSICIAN,
        departmentId: firstDept.id,
        isActive: true,
      },
      {
        username: 'imaging_technician',
        email: 'imaging_technician@hospital.com',
        password: 'imaging_tech123',
        firstName: 'Trần Thị',
        lastName: 'Kỹ Thuật Viên',
        phone: '0123456791',
        employeeId: 'EMP003',
        isVerified: true,
        role: Roles.IMAGING_TECHNICIAN,
        departmentId: firstDept.id,
        isActive: true,
      },
      {
        username: 'reception_staff',
        email: 'reception_staff@hospital.com',
        password: 'reception_staff123',
        firstName: 'Lê Thị',
        lastName: 'Lễ Tân',
        phone: '0123456792',
        employeeId: 'EMP004',
        isVerified: true,
        role: Roles.RECEPTION_STAFF,
        departmentId: firstDept.id,
        isActive: true,
      },
    ];

    for (const user of users) {
      const existing = await this.userRepository.findOne({
        where: { username: user.username }
      });

      if (!existing) {
        const passwordHash = await bcrypt.hash(user.password, 10);
        const newUser = this.userRepository.create({
          ...user,
          passwordHash,
        });
        await this.userRepository.save(newUser);
        this.logger.log(`✅ Created user: ${user.username}`);
      } else {
        this.logger.log(`⚠️ User already exists: ${user.username}`);
      }
    }
  }

  async seedRooms(): Promise<void> {
    this.logger.log('🏥 Seeding rooms...');
    
    const rooms = [
      {
        roomCode: 'P101',
        roomType: 'CT',
        department: 'Khoa Nội',
        floor: 1,
        capacity: 2,
        pricePerDay: 500000,
        status: 'AVAILABLE',
        description: 'Phòng tiêu chuẩn tầng 1',
        hasTV: true,
        hasAirConditioning: true,
        hasWiFi: true,
        hasTelephone: true,
        hasAttachedBathroom: true,
        isWheelchairAccessible: true,
        hasOxygenSupply: false,
        hasNurseCallButton: true,
        notes: 'Phòng đầy đủ tiện nghi',
        isActive: true,
      },
      {
        roomCode: 'P102',
        roomType: 'WC',
        department: 'Khoa Nội',
        floor: 1,
        capacity: 1,
        pricePerDay: 800000,
        status: 'AVAILABLE',
        description: 'Phòng cao cấp tầng 1',
        hasTV: true,
        hasAirConditioning: true,
        hasWiFi: true,
        hasTelephone: true,
        hasAttachedBathroom: true,
        isWheelchairAccessible: true,
        hasOxygenSupply: true,
        hasNurseCallButton: true,
        notes: 'Phòng VIP với đầy đủ tiện nghi',
        isActive: true,
      },
      {
        roomCode: 'P201',
        roomType: 'CT',
        department: 'Khoa Ngoại',
        floor: 2,
        capacity: 2,
        pricePerDay: 500000,
        status: 'AVAILABLE',
        description: 'Phòng tiêu chuẩn tầng 2',
        hasTV: true,
        hasAirConditioning: true,
        hasWiFi: true,
        hasTelephone: true,
        hasAttachedBathroom: true,
        isWheelchairAccessible: true,
        hasOxygenSupply: false,
        hasNurseCallButton: true,
        notes: 'Phòng phẫu thuật',
        isActive: true,
      },
      {
        roomCode: 'ICU001',
        roomType: 'WC',
        department: 'Khoa Cấp Cứu',
        floor: 3,
        capacity: 1,
        pricePerDay: 1500000,
        status: 'AVAILABLE',
        description: 'Phòng hồi sức cấp cứu',
        hasTV: false,
        hasAirConditioning: true,
        hasWiFi: true,
        hasTelephone: true,
        hasAttachedBathroom: true,
        isWheelchairAccessible: true,
        hasOxygenSupply: true,
        hasNurseCallButton: true,
        notes: 'Phòng ICU với thiết bị y tế hiện đại',
        isActive: true,
      },
    ];

    for (const room of rooms) {
      const existing = await this.roomRepository.findOne({
        where: { roomCode: room.roomCode }
      });

      if (!existing) {
        const newRoom = this.roomRepository.create(room as any);
        await this.roomRepository.save(newRoom);
        this.logger.log(`✅ Created room: ${room.roomCode}`);
      } else {
        this.logger.log(`⚠️ Room already exists: ${room.roomCode}`);
      }
    }
  }

  async seedShiftTemplates(): Promise<void> {
    this.logger.log('⏰ Seeding shift templates...');
    
    const shiftTemplates = [
      {
        shift_name: 'Ca Sáng',
        shift_type: ShiftType.MORNING,
        start_time: '08:00:00',
        end_time: '12:00:00',
        break_start_time: '10:00:00',
        break_end_time: '10:15:00',
        description: 'Ca làm việc buổi sáng từ 8h-12h, có nghỉ giải lao 15 phút',
        is_active: true,
      },
      {
        shift_name: 'Ca Chiều',
        shift_type: ShiftType.AFTERNOON,
        start_time: '13:00:00',
        end_time: '17:00:00',
        break_start_time: '15:00:00',
        break_end_time: '15:15:00',
        description: 'Ca làm việc buổi chiều từ 13h-17h, có nghỉ giải lao 15 phút',
        is_active: true,
      },
      {
        shift_name: 'Ca Tối',
        shift_type: ShiftType.NIGHT,
        start_time: '18:00:00',
        end_time: '06:00:00',
        break_start_time: '00:00:00',
        break_end_time: '00:30:00',
        description: 'Ca làm việc ban đêm từ 18h-6h sáng hôm sau, có nghỉ giải lao 30 phút',
        is_active: true,
      },
      {
        shift_name: 'Ca Toàn Ngày',
        shift_type: ShiftType.FULL_DAY,
        start_time: '08:00:00',
        end_time: '17:00:00',
        break_start_time: '12:00:00',
        break_end_time: '13:00:00',
        description: 'Ca làm việc toàn ngày từ 8h-17h, có nghỉ trưa 1 tiếng',
        is_active: true,
      },
      {
        shift_name: 'Ca Sáng Mở Rộng',
        shift_type: ShiftType.MORNING,
        start_time: '07:00:00',
        end_time: '15:00:00',
        break_start_time: '10:00:00',
        break_end_time: '10:30:00',
        description: 'Ca sáng mở rộng từ 7h-15h, có nghỉ giải lao 30 phút',
        is_active: true,
      },
      {
        shift_name: 'Ca Chiều Mở Rộng',
        shift_type: ShiftType.AFTERNOON,
        start_time: '14:00:00',
        end_time: '22:00:00',
        break_start_time: '18:00:00',
        break_end_time: '18:30:00',
        description: 'Ca chiều mở rộng từ 14h-22h, có nghỉ giải lao 30 phút',
        is_active: true,
      },
      {
        shift_name: 'Ca Cuối Tuần',
        shift_type: ShiftType.CUSTOM,
        start_time: '09:00:00',
        end_time: '17:00:00',
        break_start_time: '12:00:00',
        break_end_time: '13:00:00',
        description: 'Ca làm việc cuối tuần từ 9h-17h, có nghỉ trưa 1 tiếng',
        is_active: true,
      },
      {
        shift_name: 'Ca Khẩn Cấp',
        shift_type: ShiftType.CUSTOM,
        start_time: '00:00:00',
        end_time: '08:00:00',
        break_start_time: '04:00:00',
        break_end_time: '04:30:00',
        description: 'Ca khẩn cấp ban đêm từ 0h-8h, có nghỉ giải lao 30 phút',
        is_active: true,
      },
      {
        shift_name: 'Ca Bán Thời Gian Sáng',
        shift_type: ShiftType.MORNING,
        start_time: '08:00:00',
        end_time: '11:00:00',
        break_start_time: undefined,
        break_end_time: undefined,
        description: 'Ca bán thời gian buổi sáng từ 8h-11h, không có nghỉ giải lao',
        is_active: true,
      },
      {
        shift_name: 'Ca Bán Thời Gian Chiều',
        shift_type: ShiftType.AFTERNOON,
        start_time: '14:00:00',
        end_time: '17:00:00',
        break_start_time: undefined,
        break_end_time: undefined,
        description: 'Ca bán thời gian buổi chiều từ 14h-17h, không có nghỉ giải lao',
        is_active: true,
      },
      {
        shift_name: 'Ca Linh Hoạt',
        shift_type: ShiftType.CUSTOM,
        start_time: '10:00:00',
        end_time: '18:00:00',
        break_start_time: '14:00:00',
        break_end_time: '14:30:00',
        description: 'Ca làm việc linh hoạt từ 10h-18h, có nghỉ giải lao 30 phút',
        is_active: true,
      },
      {
        shift_name: 'Ca Đặc Biệt',
        shift_type: ShiftType.CUSTOM,
        start_time: '06:00:00',
        end_time: '14:00:00',
        break_start_time: '10:00:00',
        break_end_time: '10:15:00',
        description: 'Ca đặc biệt từ 6h-14h, có nghỉ giải lao 15 phút',
        is_active: true,
      },
    ];

    for (const template of shiftTemplates) {
      const existing = await this.shiftTemplateRepository.findOne({
        where: { shift_name: template.shift_name }
      });

      if (!existing) {
        const newTemplate = this.shiftTemplateRepository.create(template);
        await this.shiftTemplateRepository.save(newTemplate);
        this.logger.log(`✅ Created shift template: ${template.shift_name}`);
      } else {
        this.logger.log(`⚠️ Shift template already exists: ${template.shift_name}`);
      }
    }
  }

  async clearAllData(): Promise<void> {
    this.logger.log('🗑️ Clearing all User Service data...');
    
    try {
      await this.shiftTemplateRepository.delete({});
      await this.roomRepository.delete({});
      await this.userRepository.delete({});
      await this.departmentRepository.delete({});
      
      this.logger.log('✅ All User Service data cleared successfully!');
    } catch (error: any) {
      this.logger.error('❌ Failed to clear User Service data:', error);
      throw error;
    }
  }

  async resetAndSeed(): Promise<void> {
    this.logger.log('🔄 Resetting and seeding User Service database...');
    
    try {
      await this.clearAllData();
      await this.runSeeding();
      
      this.logger.log('✅ User Service database reset and seeded successfully!');
    } catch (error: any) {
      this.logger.error('❌ User Service database reset and seed failed:', error);
      throw error;
    }
  }
}
