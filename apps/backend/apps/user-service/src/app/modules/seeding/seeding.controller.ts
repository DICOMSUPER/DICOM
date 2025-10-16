import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { SeedingService } from './seeding.service';

@Controller()
export class SeedingController {
  constructor(private readonly seedingService: SeedingService) {}

  // Microservice Message Patterns for API Gateway
  @MessagePattern('UserService.Seeding.Run')
  async microserviceRunSeeding(@Payload() data: any) {
    await this.seedingService.runSeeding();
    return { 
      success: true,
      message: 'User Service database seeding completed successfully!',
      timestamp: new Date().toISOString()
    };
  }

  @MessagePattern('UserService.Seeding.ResetAndSeed')
  async microserviceResetAndSeed(@Payload() data: any) {
    await this.seedingService.resetAndSeed();
    return { 
      success: true,
      message: 'User Service database reset and seeded successfully!',
      timestamp: new Date().toISOString()
    };
  }

  @MessagePattern('UserService.Seeding.ClearAllData')
  async microserviceClearAllData(@Payload() data: any) {
    await this.seedingService.clearAllData();
    return { 
      success: true,
      message: 'User Service data cleared successfully!',
      timestamp: new Date().toISOString()
    };
  }

  @MessagePattern('UserService.Seeding.SeedDepartments')
  async microserviceSeedDepartments(@Payload() data: any) {
    await this.seedingService.seedDepartments();
    return { 
      success: true,
      message: 'Departments seeded successfully!',
      timestamp: new Date().toISOString()
    };
  }

  @MessagePattern('UserService.Seeding.SeedUsers')
  async microserviceSeedUsers(@Payload() data: any) {
    await this.seedingService.seedUsers();
    return { 
      success: true,
      message: 'Users seeded successfully!',
      timestamp: new Date().toISOString()
    };
  }

  @MessagePattern('UserService.Seeding.SeedRooms')
  async microserviceSeedRooms(@Payload() data: any) {
    await this.seedingService.seedRooms();
    return { 
      success: true,
      message: 'Rooms seeded successfully!',
      timestamp: new Date().toISOString()
    };
  }

  @MessagePattern('UserService.Seeding.SeedShiftTemplates')
  async microserviceSeedShiftTemplates(@Payload() data: any) {
    await this.seedingService.seedShiftTemplates();
    return { 
      success: true,
      message: 'Shift templates seeded successfully!',
      timestamp: new Date().toISOString()
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
      timestamp: new Date().toISOString()
    };
  }
}