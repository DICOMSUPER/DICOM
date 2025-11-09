import { HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';
import {
  ShiftTemplate,
  Department,
  Room,
  User,
  RoomSchedule,
  EmployeeRoomAssignment,
} from '@backend/shared-domain';
import { ShiftType, Roles, ScheduleStatus } from '@backend/shared-enums';
import * as bcrypt from 'bcrypt';
import { ThrowMicroserviceException } from '@backend/shared-utils';

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
    @InjectRepository(RoomSchedule)
    private readonly RoomScheduleRepository: Repository<RoomSchedule>,
    @InjectRepository(EmployeeRoomAssignment)
    private readonly EmployeeRoomAssignment: Repository<EmployeeRoomAssignment>,
    private readonly dataSource: DataSource
  ) {}

  async runSeeding(): Promise<void> {
    this.logger.log('🌱 Starting User Service database seeding...');

    try {
      await this.seedDepartments();
      await this.seedUsers();
      await this.seedRooms();
      await this.seedShiftTemplates();
      await this.seedRoomSchedules();

      this.logger.log(
        '✅ User Service database seeding completed successfully!'
      );
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
        where: { departmentCode: dept.departmentCode },
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
      where: { isActive: true },
    });
    if (!firstDept) {
      this.logger.warn('⚠️ No departments found, skipping user seeding');
      return;
    }

    const users = [
      {
        username: 'system_admin',
        email: 'system_admin@hospital.com',
        password: 'Password_123!',
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
        password: 'Password_123!',
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
        password: 'Password_123!',
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
        username: 'radiologist',
        email: 'radiologist@hospital.com',
        password: 'Password_123!',
        firstName: 'Phạm',
        lastName: 'Bác Sĩ Chẩn Đoán',
        phone: '0123456793',
        employeeId: 'EMP005',
        isVerified: true,
        role: Roles.RADIOLOGIST,
        departmentId: firstDept.id,
        isActive: true,
      },
      {
        username: 'reception_staff',
        email: 'reception_staff@hospital.com',
        password: 'Password_123!',
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
        where: { username: user.username },
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
      take: 1,
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
        where: { roomCode: room.roomCode },
      });

      if (!existing) {
        const newRoom = this.roomRepository.create(room as any);
        await this.roomRepository.save(newRoom);
        this.logger.log(
          `✅ Created room: ${room.roomCode} in department: ${firstDepartment.departmentName}`
        );
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
        description:
          'Ca làm việc buổi sáng từ 8h-12h, có nghỉ giải lao 15 phút',
        is_active: true,
      },
      {
        shift_name: 'Ca Chiều',
        shift_type: ShiftType.AFTERNOON,
        start_time: '13:00:00',
        end_time: '17:00:00',
        break_start_time: '15:00:00',
        break_end_time: '15:15:00',
        description:
          'Ca làm việc buổi chiều từ 13h-17h, có nghỉ giải lao 15 phút',
        is_active: true,
      },
      {
        shift_name: 'Ca Tối',
        shift_type: ShiftType.NIGHT,
        start_time: '18:00:00',
        end_time: '06:00:00',
        break_start_time: '00:00:00',
        break_end_time: '00:30:00',
        description:
          'Ca làm việc ban đêm từ 18h-6h sáng hôm sau, có nghỉ giải lao 30 phút',
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
        start_time: '15:00:00',
        end_time: '23:00:00',
        break_start_time: '18:00:00',
        break_end_time: '18:30:00',
        description: 'Ca chiều mở rộng từ 14h-22h, có nghỉ giải lao 30 phút',
        is_active: true,
      },
      {
        shift_name: 'Ca Tối Mở rộng',
        shift_type: ShiftType.NIGHT,
        start_time: '23:00:00',
        end_time: '07:00:00',
        break_start_time: '04:00:00',
        break_end_time: '04:30:00',
        description: 'Ca tối mở rộng từ 23h-07h, có nghỉ giải lao 30 phút',
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
        description:
          'Ca bán thời gian buổi sáng từ 8h-11h, không có nghỉ giải lao',
        is_active: true,
      },
      {
        shift_name: 'Ca Bán Thời Gian Chiều',
        shift_type: ShiftType.AFTERNOON,
        start_time: '14:00:00',
        end_time: '17:00:00',
        break_start_time: undefined,
        break_end_time: undefined,
        description:
          'Ca bán thời gian buổi chiều từ 14h-17h, không có nghỉ giải lao',
        is_active: true,
      },
      {
        shift_name: 'Ca Linh Hoạt',
        shift_type: ShiftType.CUSTOM,
        start_time: '10:00:00',
        end_time: '18:00:00',
        break_start_time: '14:00:00',
        break_end_time: '14:30:00',
        description:
          'Ca làm việc linh hoạt từ 10h-18h, có nghỉ giải lao 30 phút',
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
        where: { shift_name: template.shift_name },
      });

      if (!existing) {
        const newTemplate = this.shiftTemplateRepository.create(template);
        await this.shiftTemplateRepository.save(newTemplate);
        this.logger.log(`✅ Created shift template: ${template.shift_name}`);
      } else {
        this.logger.log(
          `⚠️ Shift template already exists: ${template.shift_name}`
        );
      }
    }
  }

  async seedRoomSchedules(): Promise<void> {
    this.logger.log('📅 Seeding employee schedules...');

    // Use a single connection for the entire operation
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Get all required data in parallel using the same connection
      const [users, rooms, shiftTemplates] = await Promise.all([
        queryRunner.manager.find(User, { where: { isActive: true } }),
        queryRunner.manager.find(Room, { where: { isActive: true } }),
        queryRunner.manager.find(ShiftTemplate, { where: { is_active: true } }),
      ]);

      this.logger.log(
        `📊 Found ${users.length} users, ${rooms.length} rooms, ${shiftTemplates.length} shift templates`
      );

      if (
        users.length === 0 ||
        rooms.length === 0 ||
        shiftTemplates.length === 0
      ) {
        this.logger.warn('⚠️ Missing required data for schedule seeding');
        this.logger.warn(
          `Users: ${users.length}, Rooms: ${rooms.length}, ShiftTemplates: ${shiftTemplates.length}`
        );
        await queryRunner.rollbackTransaction();
        return;
      }

      // Log room details for debugging
      this.logger.log('🏥 Available rooms:');
      rooms.forEach((room) => {
        this.logger.log(`  - ${room.roomCode} (ID: ${room.id})`);
      });

      // Filter users by role
      const physicians = users.filter((u) => u.role === Roles.PHYSICIAN);
      const receptionStaff = users.filter(
        (u) => u.role === Roles.RECEPTION_STAFF
      );
      const imagingTechs = users.filter(
        (u) => u.role === Roles.IMAGING_TECHNICIAN
      );

      // Get shift templates by type
      const morningShift = shiftTemplates.find(
        (s) => s.shift_type === ShiftType.MORNING && s.shift_name === 'Ca Sáng'
      );
      const afternoonShift = shiftTemplates.find(
        (s) =>
          s.shift_type === ShiftType.AFTERNOON && s.shift_name === 'Ca Chiều'
      );
      const fullDayShift = shiftTemplates.find(
        (s) => s.shift_type === ShiftType.FULL_DAY
      );
      const nightShift = shiftTemplates.find(
        (s) => s.shift_type === ShiftType.NIGHT
      );

      const today = new Date();
      const dates: string[] = [];

      // Build dates (past 7 days and next 14 days)
      for (let dayOffset = -7; dayOffset <= 14; dayOffset++) {
        const date = new Date(today);
        date.setDate(today.getDate() + dayOffset);
        dates.push(this.formatDate(date));
      }

      // Batch check for existing schedules
      const existingSchedules = await queryRunner.manager.find(RoomSchedule, {
        where: { work_date: In(dates) },
      });

      const existingScheduleKeys = new Set(
        existingSchedules.map(
          (s) =>
            `${s.work_date}|${s.room_id}|${s.actual_start_time}|${s.actual_end_time}`
        )
      );

      const schedulesToCreate: Partial<RoomSchedule>[] = [];

      // Generate schedules more efficiently
      for (const workDate of dates) {
        const dateObj = new Date(workDate);
        const dayOffset = Math.floor(
          (dateObj.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        );

        // Generate schedules for each role
        this.generateSchedulesForRole(
          physicians,
          rooms,
          [morningShift, afternoonShift, fullDayShift],
          workDate,
          dayOffset,
          schedulesToCreate,
          existingScheduleKeys
        );

        this.generateSchedulesForRole(
          receptionStaff,
          rooms,
          [morningShift, afternoonShift],
          workDate,
          dayOffset,
          schedulesToCreate,
          existingScheduleKeys
        );

        this.generateSchedulesForRole(
          imagingTechs,
          rooms,
          [morningShift, afternoonShift, fullDayShift, nightShift],
          workDate,
          dayOffset,
          schedulesToCreate,
          existingScheduleKeys
        );
      }

      // Batch insert in smaller chunks
      if (schedulesToCreate.length > 0) {
        const chunkSize = 50; // Smaller chunks to avoid memory issues
        for (let i = 0; i < schedulesToCreate.length; i += chunkSize) {
          const chunk = schedulesToCreate.slice(i, i + chunkSize);
          await queryRunner.manager.save(RoomSchedule, chunk);
          this.logger.log(
            `✅ Inserted chunk ${Math.floor(i / chunkSize) + 1} of ${Math.ceil(
              schedulesToCreate.length / chunkSize
            )}`
          );
        }
      }

      await queryRunner.commitTransaction();
      this.logger.log(
        `✅ Created ${schedulesToCreate.length} employee schedules (past 7 days + next 14 days)`
      );

      // Verify the seeding by checking a few schedules
      const sampleSchedules = await queryRunner.manager.find(RoomSchedule, {
        where: { work_date: In(dates.slice(0, 5)) },
        relations: ['room'],
        take: 5,
      });

      this.logger.log('🔍 Sample schedules created:');
      sampleSchedules.forEach((schedule) => {
        this.logger.log(
          `  - Schedule on ${schedule.work_date} in room ${
            schedule.room?.roomCode || 'NULL'
          } (room_id: ${schedule.room_id})`
        );
      });
    } catch (error: any) {
      await queryRunner.rollbackTransaction();
      this.logger.error('❌ Failed to seed room schedules:', error);
      throw error;
    } finally {
      await queryRunner.release(); // CRITICAL: Always release the connection
    }
  }

  private generateSchedulesForRole(
    employees: User[],
    rooms: Room[],
    shifts: (ShiftTemplate | undefined)[],
    workDate: string,
    dayOffset: number,
    schedulesToCreate: Partial<RoomSchedule>[],
    existingScheduleKeys: Set<string>
  ): void {
    // Generate schedules for each employee in this role
    for (const _employee of employees) {
      const room = rooms[Math.floor(Math.random() * rooms.length)];
      const shift = shifts[Math.abs(dayOffset) % shifts.length];

      if (shift && room) {
        const scheduleKey = `${workDate}|${room.id}|${shift.start_time}|${shift.end_time}`;

        if (!existingScheduleKeys.has(scheduleKey)) {
          schedulesToCreate.push({
            room_id: room.id,
            shift_template_id: shift.shift_template_id,
            work_date: workDate,
            actual_start_time: shift.start_time,
            actual_end_time: shift.end_time,
            schedule_status:
              dayOffset < 0
                ? ScheduleStatus.COMPLETED
                : dayOffset === 0
                ? ScheduleStatus.CONFIRMED
                : ScheduleStatus.SCHEDULED,
            notes:
              dayOffset < 0
                ? `Đã hoàn thành ca làm việc`
                : dayOffset === 0
                ? 'Ca làm việc hôm nay'
                : null,
            overtime_hours:
              dayOffset < -3 && Math.random() > 0.7
                ? Math.floor(Math.random() * 3) + 1
                : 0,
          } as any);
        }
      }
    }
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  async seedRoomSchedules2(
    roomId: string,
    from: string,
    to: string,
    shiftTemplateIds: string[]
  ): Promise<void> {
    this.logger.log(
      `Seeding room schedules for room ${roomId} from ${from} to ${to}`
    );

    // Validate room exists
    const room = await this.roomRepository.findOne({
      where: { id: roomId, isActive: true },
    });

    if (!room) {
      this.logger.warn(`Room with ID ${roomId} not found or inactive`);
      throw new Error(`Room with ID ${roomId} not found or inactive`);
    }

    // Validate and get shift templates
    if (!shiftTemplateIds || shiftTemplateIds.length === 0) {
      this.logger.warn('No shift template IDs provided');
      throw ThrowMicroserviceException(
        HttpStatus.NOT_FOUND,
        'At least one shift template ID is required',
        'USER_SERVICE'
      );
    }

    const shiftTemplates = await this.shiftTemplateRepository.find({
      where: {
        shift_template_id: In(shiftTemplateIds),
        is_active: true,
      },
    });

    if (shiftTemplates.length === 0) {
      this.logger.warn('No valid shift templates found');
      throw ThrowMicroserviceException(
        HttpStatus.NOT_FOUND,
        'No valid shift templates found',
        'USER_SERVICE'
      );
    }

    if (shiftTemplates.length !== shiftTemplateIds.length) {
      this.logger.warn(
        `Only ${shiftTemplates.length} out of ${shiftTemplateIds.length} shift templates found`
      );
    }

    // Parse date range
    const fromDate = new Date(from);
    const toDate = new Date(to);

    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
      throw ThrowMicroserviceException(
        HttpStatus.BAD_REQUEST,
        'Invalid date format. Use YYYY-MM-DD format',
        'USER_SERVICE'
      );
    }

    if (fromDate > toDate) {
      throw ThrowMicroserviceException(
        HttpStatus.BAD_REQUEST,
        'Start date must be before or equal to end date',
        'USER_SERVICE'
      );
    }

    // Helper function to format date as YYYY-MM-DD
    const formatDate = (date: Date): string => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    // Use transaction to batch operations and avoid connection pool exhaustion
    return await this.dataSource.transaction(
      async (transactionalEntityManager) => {
        let schedulesCreated = 0;
        let schedulesSkipped = 0;

        // Build all dates first
        const dates: string[] = [];
        const currentDate = new Date(fromDate);
        while (currentDate <= toDate) {
          dates.push(formatDate(currentDate));
          currentDate.setDate(currentDate.getDate() + 1);
        }

        // Batch check for existing schedules
        const existingSchedules = await transactionalEntityManager.find(
          RoomSchedule,
          {
            where: {
              room_id: roomId,
              work_date: In(dates),
            },
          }
        );

        // Create a Set for fast lookup of existing schedules
        const existingScheduleKeys = new Set(
          existingSchedules.map(
            (s) => `${s.work_date}|${s.actual_start_time}|${s.actual_end_time}`
          )
        );

        // Prepare schedules to create
        const schedulesToCreate: Partial<RoomSchedule>[] = [];

        for (const workDate of dates) {
          for (const shiftTemplate of shiftTemplates) {
            const scheduleKey = `${workDate}|${shiftTemplate.start_time}|${shiftTemplate.end_time}`;

            if (existingScheduleKeys.has(scheduleKey)) {
              schedulesSkipped++;
              continue;
            }

            schedulesToCreate.push({
              room_id: roomId,
              shift_template_id: shiftTemplate.shift_template_id,
              work_date: workDate,
              actual_start_time: shiftTemplate.start_time,
              actual_end_time: shiftTemplate.end_time,
              schedule_status: ScheduleStatus.SCHEDULED,
              overtime_hours: 0,
              notes: `Auto-seeded schedule for ${shiftTemplate.shift_name}`,
            });
          }
        }

        // Batch insert schedules in chunks to avoid memory issues
        if (schedulesToCreate.length > 0) {
          const chunkSize = 100;
          for (let i = 0; i < schedulesToCreate.length; i += chunkSize) {
            const chunk = schedulesToCreate.slice(i, i + chunkSize);
            await transactionalEntityManager.save(RoomSchedule, chunk);
            schedulesCreated += chunk.length;
          }
        }

        this.logger.log(
          ` Room schedule seeding completed: ${schedulesCreated} schedules created, ${schedulesSkipped} skipped (duplicates)`
        );
      }
    );
  }

  async seedingEmployeeRoomAssignment(
    employeeId: string,
    roomScheduleIds: string[]
  ): Promise<void> {
    this.logger.log(
      ` Seeding employee room assignments for employee ${employeeId} with ${roomScheduleIds.length} room schedules`
    );

    // Validate employee exists
    const employee = await this.userRepository.findOne({
      where: { id: employeeId, isActive: true },
    });

    if (!employee) {
      throw ThrowMicroserviceException(
        HttpStatus.NOT_FOUND,
        `Employee with ID ${employeeId} not found or inactive`,
        'USER_SERVICE'
      );
    }

    // Validate and get room schedules
    if (!roomScheduleIds || roomScheduleIds.length === 0) {
      throw ThrowMicroserviceException(
        HttpStatus.BAD_REQUEST,
        'At least one room schedule ID is required',
        'USER_SERVICE'
      );
    }

    const roomSchedules = await this.RoomScheduleRepository.find({
      where: { schedule_id: In(roomScheduleIds), isDeleted: false },
    });

    if (roomSchedules.length === 0) {
      throw ThrowMicroserviceException(
        HttpStatus.BAD_REQUEST,
        'No valid room schedules found',
        'USER_SERVICE'
      );
    }

    if (roomSchedules.length < roomScheduleIds.length) {
      this.logger.warn(
        `Only ${roomSchedules.length} out of ${roomScheduleIds.length} room schedules found`
      );
    }

    // Use transaction to batch operations and avoid connection pool exhaustion
    return await this.dataSource.transaction(
      async (transactionalEntityManager) => {
        let assignmentsCreated = 0;
        let assignmentsSkipped = 0;

        const roomScheduleIdList = roomSchedules.map((rs) => rs.schedule_id);

        // Batch check for existing assignments
        const existingAssignments = await transactionalEntityManager.find(
          EmployeeRoomAssignment,
          {
            where: {
              employeeId: employeeId,
              roomScheduleId: In(roomScheduleIdList),
              isDeleted: false,
            },
          }
        );

        // Create a Set for fast lookup of existing assignments
        const existingAssignmentKeys = new Set(
          existingAssignments.map((a) => a.roomScheduleId)
        );

        // Prepare assignments to create
        const assignmentsToCreate: Partial<EmployeeRoomAssignment>[] = [];

        for (const roomSchedule of roomSchedules) {
          if (existingAssignmentKeys.has(roomSchedule.schedule_id)) {
            assignmentsSkipped++;
            continue;
          }

          assignmentsToCreate.push({
            employeeId: employeeId,
            roomScheduleId: roomSchedule.schedule_id,
            isActive: true,
          });
        }

        // Batch insert assignments in chunks to avoid memory issues
        if (assignmentsToCreate.length > 0) {
          const chunkSize = 100;
          for (let i = 0; i < assignmentsToCreate.length; i += chunkSize) {
            const chunk = assignmentsToCreate.slice(i, i + chunkSize);
            await transactionalEntityManager.save(
              EmployeeRoomAssignment,
              chunk
            );
            assignmentsCreated += chunk.length;
          }
        }

        this.logger.log(
          ` Employee room assignment seeding completed: ${assignmentsCreated} assignments created, ${assignmentsSkipped} skipped (duplicates)`
        );
      }
    );
  }

  async clearAllData(): Promise<void> {
    this.logger.log('🗑️ Clearing all User Service data...');

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      await queryRunner.startTransaction();

      // Use TRUNCATE CASCADE to delete all data and handle foreign keys automatically
      await queryRunner.query(
        'TRUNCATE TABLE "weekly_schedule_patterns" CASCADE'
      );
      await queryRunner.query('TRUNCATE TABLE "employee_schedules" CASCADE');
      await queryRunner.query('TRUNCATE TABLE "shift_templates" CASCADE');
      await queryRunner.query('TRUNCATE TABLE "rooms" CASCADE');
      await queryRunner.query('TRUNCATE TABLE "users" CASCADE');
      await queryRunner.query('TRUNCATE TABLE "departments" CASCADE');

      await queryRunner.commitTransaction();
      this.logger.log('✅ All User Service data cleared successfully!');
    } catch (error: any) {
      await queryRunner.rollbackTransaction();
      this.logger.error('❌ Failed to clear User Service data:', error);
      throw error;
    } finally {
      await queryRunner.release(); // IMPORTANT: Release connection
    }
  }

  async resetAndSeed(): Promise<void> {
    this.logger.log('🔄 Resetting and seeding User Service database...');

    try {
      await this.clearAllData();
      await this.runSeeding();

      this.logger.log(
        '✅ User Service database reset and seeded successfully!'
      );
    } catch (error: any) {
      this.logger.error(
        '❌ User Service database reset and seed failed:',
        error
      );
      throw error;
    }
  }
}
