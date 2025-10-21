import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ShiftTemplate, Department, Room, User, EmployeeSchedule } from '@backend/shared-domain';
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
    @InjectRepository(EmployeeSchedule)
    private readonly employeeScheduleRepository: Repository<EmployeeSchedule>,
    private readonly dataSource: DataSource,
  ) {}

  async runSeeding(): Promise<void> {
    this.logger.log('🌱 Starting User Service database seeding...');
    
    try {
      await this.seedDepartments();
      await this.seedUsers();
      await this.seedRooms();
      await this.seedShiftTemplates();
      await this.seedEmployeeSchedules();
      
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
    
    // Get first department ID
    const departments = await this.departmentRepository.find({
      order: { createdAt: 'ASC' },
      take: 1
    });
    const firstDepartment = departments[0];
    
    if (!firstDepartment) {
      this.logger.warn('⚠️ No departments found, skipping room seeding');
      return;
    }
    
    const rooms = [
      {
        roomCode: 'P101',
        roomType: 'CT',
        departmentId: firstDepartment.id,
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
        departmentId: firstDepartment.id,
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
        departmentId: firstDepartment.id,
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
        departmentId: firstDepartment.id,
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
        this.logger.log(`✅ Created room: ${room.roomCode} in department: ${firstDepartment.departmentName}`);
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
  async seedEmployeeSchedules(): Promise<void> {
    this.logger.log('📅 Seeding employee schedules...');

    // Get all required data
    const users = await this.userRepository.find({
      where: { isActive: true }
    });
    const rooms = await this.roomRepository.find({
      where: { isActive: true }
    });
    const shiftTemplates = await this.shiftTemplateRepository.find({
      where: { is_active: true }
    });

    this.logger.log(`📊 Found ${users.length} users, ${rooms.length} rooms, ${shiftTemplates.length} shift templates`);

    if (users.length === 0 || rooms.length === 0 || shiftTemplates.length === 0) {
      this.logger.warn('⚠️ Missing required data for schedule seeding');
      this.logger.warn(`Users: ${users.length}, Rooms: ${rooms.length}, ShiftTemplates: ${shiftTemplates.length}`);
      return;
    }

    // Log room details for debugging
    this.logger.log('🏥 Available rooms:');
    rooms.forEach(room => {
      this.logger.log(`  - ${room.roomCode} (ID: ${room.id})`);
    });

    // Filter users by role
    const physicians = users.filter(u => u.role === Roles.PHYSICIAN);
    const receptionStaff = users.filter(u => u.role === Roles.RECEPTION_STAFF);
    const imagingTechs = users.filter(u => u.role === Roles.IMAGING_TECHNICIAN);

    // Get shift templates by type
    const morningShift = shiftTemplates.find(s => s.shift_type === ShiftType.MORNING && s.shift_name === 'Ca Sáng');
    const afternoonShift = shiftTemplates.find(s => s.shift_type === ShiftType.AFTERNOON && s.shift_name === 'Ca Chiều');
    const fullDayShift = shiftTemplates.find(s => s.shift_type === ShiftType.FULL_DAY);
    const nightShift = shiftTemplates.find(s => s.shift_type === ShiftType.NIGHT);

    const today = new Date();

    let schedulesCreated = 0;

    // Helper function to format date as YYYY-MM-DD
    const formatDate = (date: Date): string => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    // Create schedules for the past 7 days and next 14 days
    for (let dayOffset = -7; dayOffset <= 14; dayOffset++) {
      const date = new Date(today);
      date.setDate(today.getDate() + dayOffset);
      const workDate = formatDate(date);

      // Schedule for Physicians (mostly full day shifts)
      for (const physician of physicians) {
        const room = rooms[Math.floor(Math.random() * rooms.length)];
        const shift = dayOffset % 3 === 0 ? morningShift : dayOffset % 3 === 1 ? afternoonShift : fullDayShift;
        
        if (shift) {
          const schedule = {
            employee_id: physician.id,
            room_id: room.id,
            shift_template_id: shift.shift_template_id,
            work_date: workDate,
            actual_start_time: shift.start_time,
            actual_end_time: shift.end_time,
            schedule_status: dayOffset < 0 ? 'completed' : dayOffset === 0 ? 'confirmed' : 'scheduled',
            notes: dayOffset < 0 ? `Đã hoàn thành ca làm việc` : dayOffset === 0 ? 'Ca làm việc hôm nay' : null,
            overtime_hours: dayOffset < -3 && Math.random() > 0.7 ? Math.floor(Math.random() * 3) + 1 : 0,
          };

          this.logger.log(`📅 Creating schedule for ${physician.firstName} ${physician.lastName} on ${workDate} in room ${room.roomCode} (ID: ${room.id})`);

          const existing = await this.employeeScheduleRepository.findOne({
            where: {
              employee_id: physician.id,
              work_date: workDate,
            }
          });

          if (!existing) {
            const newSchedule = this.employeeScheduleRepository.create(schedule as any);
            const savedSchedule = await this.employeeScheduleRepository.save(newSchedule);
            this.logger.log(`✅ Saved physician schedule ID: ${(savedSchedule as any).schedule_id}, room_id: ${(savedSchedule as any).room_id}`);
            schedulesCreated++;
          } else {
            this.logger.log(`⚠️ Schedule already exists for ${physician.firstName} on ${workDate}`);
          }
        }
      }

      // Schedule for Reception Staff (morning and afternoon shifts)
      for (const staff of receptionStaff) {
        const room = rooms[Math.floor(Math.random() * rooms.length)];
        const shift = dayOffset % 2 === 0 ? morningShift : afternoonShift;
        
        if (shift) {
          const schedule = {
            employee_id: staff.id,
            room_id: room.id,
            shift_template_id: shift.shift_template_id,
            work_date: workDate,
            actual_start_time: shift.start_time,
            actual_end_time: shift.end_time,
            schedule_status: dayOffset < 0 ? 'completed' : dayOffset === 0 ? 'confirmed' : 'scheduled',
            notes: dayOffset < 0 ? `Đã hoàn thành ca tiếp tân` : dayOffset === 0 ? 'Ca làm việc hôm nay' : null,
            overtime_hours: dayOffset < -3 && Math.random() > 0.8 ? Math.floor(Math.random() * 2) + 1 : 0,
          };

          this.logger.log(`📅 Creating schedule for ${staff.firstName} ${staff.lastName} on ${workDate} in room ${room.roomCode} (ID: ${room.id})`);

          const existing = await this.employeeScheduleRepository.findOne({
            where: {
              employee_id: staff.id,
              work_date: workDate,
            }
          });

          if (!existing) {
            const newSchedule = this.employeeScheduleRepository.create(schedule as any);
            const savedSchedule = await this.employeeScheduleRepository.save(newSchedule);
            this.logger.log(`✅ Saved reception schedule ID: ${(savedSchedule as any).schedule_id}, room_id: ${(savedSchedule as any).room_id}`);
            schedulesCreated++;
          } else {
            this.logger.log(`⚠️ Schedule already exists for ${staff.firstName} on ${workDate}`);
          }
        }
      }

      // Schedule for Imaging Technicians (varied shifts including night)
      for (const tech of imagingTechs) {
        const room = rooms[Math.floor(Math.random() * rooms.length)];
        const shiftIndex = dayOffset % 4;
        const shift = shiftIndex === 0 ? morningShift : shiftIndex === 1 ? afternoonShift : shiftIndex === 2 ? fullDayShift : nightShift;
        
        if (shift) {
          const schedule = {
            employee_id: tech.id,
            room_id: room.id,
            shift_template_id: shift.shift_template_id,
            work_date: workDate,
            actual_start_time: shift.start_time,
            actual_end_time: shift.end_time,
            schedule_status: dayOffset < 0 ? 'completed' : dayOffset === 0 ? 'confirmed' : 'scheduled',
            notes: dayOffset < 0 ? `Đã hoàn thành ca kỹ thuật viên` : dayOffset === 0 ? 'Ca làm việc hôm nay' : null,
            overtime_hours: dayOffset < -3 && Math.random() > 0.7 ? Math.floor(Math.random() * 3) + 1 : 0,
          };

          this.logger.log(`📅 Creating schedule for ${tech.firstName} ${tech.lastName} on ${workDate} in room ${room.roomCode} (ID: ${room.id})`);

          const existing = await this.employeeScheduleRepository.findOne({
            where: {
              employee_id: tech.id,
              work_date: workDate,
            }
          });

          if (!existing) {
            const newSchedule = this.employeeScheduleRepository.create(schedule as any);
            const savedSchedule = await this.employeeScheduleRepository.save(newSchedule);
            this.logger.log(`✅ Saved imaging tech schedule ID: ${(savedSchedule as any).schedule_id}, room_id: ${(savedSchedule as any).room_id}`);
            schedulesCreated++;
          } else {
            this.logger.log(`⚠️ Schedule already exists for ${tech.firstName} on ${workDate}`);
          }
        }
      }
    }

    this.logger.log(`✅ Created ${schedulesCreated} employee schedules (past 7 days + next 14 days)`);
    
    // Verify the seeding by checking a few schedules
    const sampleSchedules = await this.employeeScheduleRepository.find({
      take: 5,
      relations: ['room', 'employee', 'shift_template']
    });
    
    this.logger.log('🔍 Sample schedules created:');
    sampleSchedules.forEach(schedule => {
      this.logger.log(`  - ${schedule.employee?.firstName} ${schedule.employee?.lastName} on ${schedule.work_date} in room ${schedule.room?.roomCode || 'NULL'} (room_id: ${schedule.room_id})`);
    });
  }

  async clearAllData(): Promise<void> {
    this.logger.log('🗑️ Clearing all User Service data...');
    
    try {
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      
      try {
        // Use TRUNCATE CASCADE to delete all data and handle foreign keys automatically
        await queryRunner.query('TRUNCATE TABLE "schedule_replacements" CASCADE');
        await queryRunner.query('TRUNCATE TABLE "weekly_schedule_patterns" CASCADE');
        await queryRunner.query('TRUNCATE TABLE "employee_schedules" CASCADE');
        await queryRunner.query('TRUNCATE TABLE "shift_templates" CASCADE');
        await queryRunner.query('TRUNCATE TABLE "rooms" CASCADE');
        await queryRunner.query('TRUNCATE TABLE "users" CASCADE');
        await queryRunner.query('TRUNCATE TABLE "departments" CASCADE');
        
        this.logger.log('✅ All User Service data cleared successfully!');
      } finally {
        await queryRunner.release();
      }
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
