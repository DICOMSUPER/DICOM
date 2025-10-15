import { Controller, Post, Delete, Get, Inject } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@ApiTags('Centralized Database Seeding')
@Controller('seeding')
export class SeedingController {
  constructor(
    @Inject('USER_SERVICE') private readonly userServiceClient: ClientProxy,
  ) {}

  @Post('run')
  @ApiOperation({ summary: 'Run centralized database seeding' })
  @ApiResponse({ status: 200, description: 'Database seeded successfully' })
  async runSeeding() {
    const result = await firstValueFrom(
      this.userServiceClient.send('UserService.Seeding.Run', {})
    );
    return result;
  }

  @Post('reset')
  @ApiOperation({ summary: 'Reset and seed centralized database' })
  @ApiResponse({ status: 200, description: 'Database reset and seeded successfully' })
  async resetAndSeed() {
    const result = await firstValueFrom(
      this.userServiceClient.send('UserService.Seeding.ResetAndSeed', {})
    );
    return result;
  }

  @Delete('clear')
  @ApiOperation({ summary: 'Clear all centralized data' })
  @ApiResponse({ status: 200, description: 'All data cleared successfully' })
  async clearAllData() {
    const result = await firstValueFrom(
      this.userServiceClient.send('UserService.Seeding.ClearAllData', {})
    );
    return result;
  }

  @Get('status')
  @ApiOperation({ summary: 'Get seeding status' })
  @ApiResponse({ status: 200, description: 'Seeding status retrieved successfully' })
  async getSeedingStatus() {
    const result = await firstValueFrom(
      this.userServiceClient.send('UserService.Seeding.GetStatus', {})
    );
    return {
      success: true,
      data: {
        userService: result,
      }
    };
  }

  @Get('health')
  @ApiOperation({ summary: 'Health check for seeding system' })
  @ApiResponse({ status: 200, description: 'Health check completed' })
  async healthCheck() {
    return {
      success: true,
      data: {
        apiGateway: { status: 'healthy' },
        timestamp: new Date().toISOString()
      }
    };
  }

  // Individual seeding endpoints
  @Post('departments')
  @ApiOperation({ summary: 'Seed departments only' })
  @ApiResponse({ status: 200, description: 'Departments seeded successfully' })
  async seedDepartments() {
    const result = await firstValueFrom(
      this.userServiceClient.send('UserService.Seeding.SeedDepartments', {})
    );
    return result;
  }

  @Post('users')
  @ApiOperation({ summary: 'Seed users only' })
  @ApiResponse({ status: 200, description: 'Users seeded successfully' })
  async seedUsers() {
    const result = await firstValueFrom(
      this.userServiceClient.send('UserService.Seeding.SeedUsers', {})
    );
    return result;
  }

  @Post('rooms')
  @ApiOperation({ summary: 'Seed rooms only' })
  @ApiResponse({ status: 200, description: 'Rooms seeded successfully' })
  async seedRooms() {
    const result = await firstValueFrom(
      this.userServiceClient.send('UserService.Seeding.SeedRooms', {})
    );
    return result;
  }

  @Post('shift-templates')
  @ApiOperation({ summary: 'Seed shift templates only' })
  @ApiResponse({ status: 200, description: 'Shift templates seeded successfully' })
  async seedShiftTemplates() {
    const result = await firstValueFrom(
      this.userServiceClient.send('UserService.Seeding.SeedShiftTemplates', {})
    );
    return result;
  }
}