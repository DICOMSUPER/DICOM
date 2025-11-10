import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { SeedingService } from './seeding.service';

@Controller()
export class SeedingController {
  constructor(private readonly seedingService: SeedingService) {}

  // Microservice Message Patterns for API Gateway
  @MessagePattern('UserService.Seeding.Run')
  async microserviceRunSeeding(@Payload() data: any) {
    try {
      await this.seedingService.runSeeding();
      return {
        success: true,
        message: 'User Service database seeding completed successfully!',
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      throw {
        statusCode: 500,
        message: error.message || 'User Service seeding failed',
        error: error.stack || error.toString(),
        timestamp: new Date().toISOString(),
      };
    }
  }

  // @MessagePattern('UserService.Seeding.ResetAndSeed')
  // async microserviceResetAndSeed(@Payload() data: any) {
  //   try {
  //     await this.seedingService.resetAndSeed();
  //     return {
  //       success: true,
  //       message: 'User Service database reset and seeded successfully!',
  //       timestamp: new Date().toISOString(),
  //     };
  //   } catch (error: any) {
  //     throw {
  //       statusCode: 500,
  //       message: error.message || 'User Service reset and seed failed',
  //       error: error.stack || error.toString(),
  //       timestamp: new Date().toISOString(),
  //     };
  //   }
  // }

  @MessagePattern('UserService.Seeding.ClearAllData')
  async microserviceClearAllData(@Payload() data: any) {
    try {
      await this.seedingService.clearAllData();
      return {
        success: true,
        message: 'User Service data cleared successfully!',
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      throw {
        statusCode: 500,
        message: error.message || 'User Service clear data failed',
        error: error.stack || error.toString(),
        timestamp: new Date().toISOString(),
      };
    }
  }

  @MessagePattern('UserService.Seeding.SeedDepartments')
  async microserviceSeedDepartments(@Payload() data: any) {
    await this.seedingService.seedDepartments();
    return {
      success: true,
      message: 'Departments seeded successfully!',
      timestamp: new Date().toISOString(),
    };
  }

  @MessagePattern('UserService.Seeding.SeedUsers')
  async microserviceSeedUsers(@Payload() data: any) {
    await this.seedingService.seedUsers();
    return {
      success: true,
      message: 'Users seeded successfully!',
      timestamp: new Date().toISOString(),
    };
  }

  @MessagePattern('UserService.Seeding.SeedRooms')
  async microserviceSeedRooms(@Payload() data: any) {
    await this.seedingService.seedRooms();
    return {
      success: true,
      message: 'Rooms seeded successfully!',
      timestamp: new Date().toISOString(),
    };
  }

  @MessagePattern('UserService.Seeding.SeedRoomSchedules')
  async microserviceSeedRoomSchedules() {
    await this.seedingService.seedRoomSchedules();
  }

  @MessagePattern('UserService.Seeding.SeedRoomSchedules2')
  async seedRoomSchedules2(
    @Payload()
    data: {
      roomId: string;
      from: string;
      to: string;
      shiftTemplateIds: string[];
    }
  ) {
    await this.seedingService.seedRoomSchedules2(
      data.roomId,
      data.from,
      data.to,
      data.shiftTemplateIds
    );

    return {
      success: true,
      message: 'Room schedules seeded successfully!',
      timestamp: new Date().toISOString(),
    };
  }

  @MessagePattern('UserService.Seeding.SeedEmployeeRoomAssignment')
  async seedEmployeeRoomAssignment(
    @Payload() data: { employeeId: string; roomScheduleIds: string[] }
  ) {
    await this.seedingService.seedingEmployeeRoomAssignment(
      data.employeeId,
      data.roomScheduleIds
    );

    return {
      success: true,
      message: 'Employee room assignment seeded successfully!',
      timestamp: new Date().toISOString(),
    };
  }

  @MessagePattern('UserService.Seeding.SeedShiftTemplates')
  async microserviceSeedShiftTemplates(@Payload() data: any) {
    await this.seedingService.seedShiftTemplates();
    return {
      success: true,
      message: 'Shift templates seeded successfully!',
      timestamp: new Date().toISOString(),
    };
  }

  @MessagePattern('UserService.Seeding.GetStatus')
  async microserviceGetStatus(@Payload() data: any) {
    return {
      service: 'UserService',
      status: 'healthy',
      seededData: {
        departments: 'available',
        users: 'available',
        rooms: 'available',
        shiftTemplates: 'available',
      },
      timestamp: new Date().toISOString(),
    };
  }
}
