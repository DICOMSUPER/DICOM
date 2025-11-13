import { Controller, Post, Delete, Get, Inject, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { SeedingRoomScheduleDto } from './dto/seeding-room-schedule.dto';
import { SeedingRoomEmployeeAssignment } from './dto/seeding-room-employee-assignment.dto';

@ApiTags('Centralized Database Seeding')
@Controller('seeding')
export class SeedingController {
  constructor(
    @Inject('USER_SERVICE') private readonly userServiceClient: ClientProxy,
    @Inject('IMAGING_SERVICE')
    private readonly imagingServiceClient: ClientProxy,
    @Inject('PATIENT_SERVICE')
    private readonly patientServiceClient: ClientProxy
  ) {}

  @Post('run')
  @ApiOperation({
    summary: 'Run centralized database seeding for all services',
  })
  @ApiResponse({ status: 200, description: 'Database seeded successfully' })
  async runSeeding() {
    const results: any = {
      userService: null,
      patientService: null,
      imagingService: null,
    };
    const errors: any = {};

    // Seed User Service
    try {
      results.userService = await firstValueFrom(
        this.userServiceClient.send('UserService.Seeding.Run', {})
      );
    } catch (error: any) {
      console.error('User Service Seeding Error:', error);
      errors.userService =
        error.message ||
        error.error ||
        error.toString() ||
        'User Service not available';
    }

    // Seed Patient Service
    try {
      results.patientService = await firstValueFrom(
        this.patientServiceClient.send('PatientService.Seeding.Run', {})
      );
    } catch (error: any) {
      errors.patientService = error.message || 'Patient Service not available';
    }

    // Seed Imaging Service
    try {
      results.imagingService = await firstValueFrom(
        this.imagingServiceClient.send('ImagingService.Seeding.Run', {})
      );
    } catch (error: any) {
      errors.imagingService = error.message || 'Imaging Service not available';
    }

    const hasErrors = Object.keys(errors).length > 0;

    return {
      success: !hasErrors,
      message: hasErrors
        ? 'Some services failed to seed. Check errors for details.'
        : 'All services seeded successfully',
      data: results,
      errors: hasErrors ? errors : undefined,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('reset')
  @ApiOperation({
    summary: 'Reset and seed centralized database for all services',
  })
  @ApiResponse({
    status: 200,
    description: 'Database reset and seeded successfully',
  })
  async resetAndSeed() {
    const userServiceResult = await firstValueFrom(
      this.userServiceClient.send('UserService.Seeding.ResetAndSeed', {})
    );

    const patientServiceResult = await firstValueFrom(
      this.patientServiceClient.send('PatientService.Seeding.ResetAndSeed', {})
    );

    const imagingServiceResult = await firstValueFrom(
      this.imagingServiceClient.send('ImagingService.Seeding.ResetAndSeed', {})
    );

    return {
      success: true,
      message: 'All services reset and seeded successfully',
      data: {
        userService: userServiceResult,
        patientService: patientServiceResult,
        imagingService: imagingServiceResult,
      },
      timestamp: new Date().toISOString(),
    };
  }

  @Delete('clear')
  @ApiOperation({ summary: 'Clear all centralized data from all services' })
  @ApiResponse({ status: 200, description: 'All data cleared successfully' })
  async clearAllData() {
    const userServiceResult = await firstValueFrom(
      this.userServiceClient.send('UserService.Seeding.ClearAllData', {})
    );

    const patientServiceResult = await firstValueFrom(
      this.patientServiceClient.send('PatientService.Seeding.ClearAllData', {})
    );

    const imagingServiceResult = await firstValueFrom(
      this.imagingServiceClient.send('ImagingService.Seeding.ClearAllData', {})
    );

    return {
      success: true,
      message: 'All services data cleared successfully',
      data: {
        userService: userServiceResult,
        patientService: patientServiceResult,
        imagingService: imagingServiceResult,
      },
      timestamp: new Date().toISOString(),
    };
  }

  @Get('status')
  @ApiOperation({ summary: 'Get seeding status from all services' })
  @ApiResponse({
    status: 200,
    description: 'Seeding status retrieved successfully',
  })
  async getSeedingStatus() {
    const userServiceStatus = await firstValueFrom(
      this.userServiceClient.send('UserService.Seeding.GetStatus', {})
    );

    const patientServiceStatus = await firstValueFrom(
      this.patientServiceClient.send('PatientService.Seeding.GetStatus', {})
    );

    const imagingServiceStatus = await firstValueFrom(
      this.imagingServiceClient.send('ImagingService.Seeding.GetStatus', {})
    );

    return {
      success: true,
      data: {
        userService: userServiceStatus,
        patientService: patientServiceStatus,
        imagingService: imagingServiceStatus,
      },
      timestamp: new Date().toISOString(),
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
        timestamp: new Date().toISOString(),
      },
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
  @ApiResponse({
    status: 200,
    description: 'Shift templates seeded successfully',
  })
  @ApiResponse({ status: 500, description: 'Failed to seed shift templates' })
  async seedShiftTemplates() {
    const result = await firstValueFrom(
      this.userServiceClient.send('UserService.Seeding.SeedShiftTemplates', {})
    );
    return result;
  }

  @Post('room-schedule2')
  @ApiOperation({ summary: 'Seed room-schedule2' })
  @ApiResponse({ status: 200 })
  async seedRoomSchedule(
    @Body() seedingRoomScheduleDto: SeedingRoomScheduleDto
  ) {
    const result = await firstValueFrom(
      this.userServiceClient.send(
        'UserService.Seeding.SeedRoomSchedules2',
        seedingRoomScheduleDto
      )
    );

    return result;
  }

  @Post('employee-room-assignment2')
  @ApiOperation({ summary: 'Seed employee room assignment' })
  @ApiResponse({
    status: 200,
    description: 'Seed employee room assignment based on room scheduleIds',
  })
  async seedEmployeeRoomAssignment(
    @Body() seedingEmployeeRoomAssignment: SeedingRoomEmployeeAssignment
  ) {
    return await firstValueFrom(
      this.userServiceClient.send(
        'UserService.Seeding.SeedEmployeeRoomAssignment',
        seedingEmployeeRoomAssignment
      )
    );
  }

  // Imaging Service Seeding Endpoints
  @Post('imaging/modalities')
  @ApiOperation({ summary: 'Seed imaging modalities only' })
  @ApiResponse({
    status: 200,
    description: 'Imaging modalities seeded successfully',
  })
  async seedModalities() {
    const result = await firstValueFrom(
      this.imagingServiceClient.send(
        'ImagingService.Seeding.SeedModalities',
        {}
      )
    );
    return result;
  }

  @Post('imaging/body-parts')
  @ApiOperation({ summary: 'Seed body parts only' })
  @ApiResponse({ status: 200, description: 'Body parts seeded successfully' })
  async seedBodyParts() {
    const result = await firstValueFrom(
      this.imagingServiceClient.send('ImagingService.Seeding.SeedBodyParts', {})
    );
    return result;
  }

  @Post('imaging/modality-machines')
  @ApiOperation({ summary: 'Seed modality machines only' })
  @ApiResponse({
    status: 200,
    description: 'Modality machines seeded successfully',
  })
  async seedModalityMachines() {
    const result = await firstValueFrom(
      this.imagingServiceClient.send(
        'ImagingService.Seeding.SeedModalityMachines',
        {}
      )
    );
    return result;
  }

  @Post('imaging/request-procedures')
  @ApiOperation({ summary: 'Seed request procedures only' })
  @ApiResponse({
    status: 200,
    description: 'Request procedures seeded successfully',
  })
  async seedRequestProcedures() {
    const result = await firstValueFrom(
      this.imagingServiceClient.send(
        'ImagingService.Seeding.SeedRequestProcedures',
        {}
      )
    );
    return result;
  }

  @Post('imaging/orders')
  @ApiOperation({ summary: 'Seed imaging orders only' })
  @ApiResponse({
    status: 200,
    description: 'Imaging orders seeded successfully',
  })
  async seedImagingOrders() {
    const result = await firstValueFrom(
      this.imagingServiceClient.send(
        'ImagingService.Seeding.SeedImagingOrders',
        {}
      )
    );
    return result;
  }

  @Post('imaging/studies')
  @ApiOperation({ summary: 'Seed DICOM studies only' })
  @ApiResponse({
    status: 200,
    description: 'DICOM studies seeded successfully',
  })
  async seedDicomStudies() {
    const result = await firstValueFrom(
      this.imagingServiceClient.send(
        'ImagingService.Seeding.SeedDicomStudies',
        {}
      )
    );
    return result;
  }

  @Post('imaging/series')
  @ApiOperation({ summary: 'Seed DICOM series only' })
  @ApiResponse({ status: 200, description: 'DICOM series seeded successfully' })
  async seedDicomSeries() {
    const result = await firstValueFrom(
      this.imagingServiceClient.send(
        'ImagingService.Seeding.SeedDicomSeries',
        {}
      )
    );
    return result;
  }

  @Post('imaging/instances')
  @ApiOperation({ summary: 'Seed DICOM instances only' })
  @ApiResponse({
    status: 200,
    description: 'DICOM instances seeded successfully',
  })
  async seedDicomInstances() {
    const result = await firstValueFrom(
      this.imagingServiceClient.send(
        'ImagingService.Seeding.SeedDicomInstances',
        {}
      )
    );
    return result;
  }

  @Post('imaging/annotations')
  @ApiOperation({ summary: 'Seed image annotations only' })
  @ApiResponse({
    status: 200,
    description: 'Image annotations seeded successfully',
  })
  async seedAnnotations() {
    const result = await firstValueFrom(
      this.imagingServiceClient.send(
        'ImagingService.Seeding.SeedAnnotations',
        {}
      )
    );
    return result;
  }

  @Post('imaging/run')
  @ApiOperation({ summary: 'Run imaging service seeding only' })
  @ApiResponse({
    status: 200,
    description: 'Imaging service seeded successfully',
  })
  async runImagingSeeding() {
    const result = await firstValueFrom(
      this.imagingServiceClient.send('ImagingService.Seeding.Run', {})
    );
    return result;
  }

  @Post('imaging/reset')
  @ApiOperation({ summary: 'Reset and seed imaging service only' })
  @ApiResponse({
    status: 200,
    description: 'Imaging service reset and seeded successfully',
  })
  async resetImagingService() {
    const result = await firstValueFrom(
      this.imagingServiceClient.send('ImagingService.Seeding.ResetAndSeed', {})
    );
    return result;
  }

  @Delete('imaging/clear')
  @ApiOperation({ summary: 'Clear imaging service data only' })
  @ApiResponse({
    status: 200,
    description: 'Imaging service data cleared successfully',
  })
  async clearImagingData() {
    const result = await firstValueFrom(
      this.imagingServiceClient.send('ImagingService.Seeding.ClearAllData', {})
    );
    return result;
  }

  // Patient Service Seeding Endpoints
  @Post('patient/patients')
  @ApiOperation({ summary: 'Seed patients only' })
  @ApiResponse({ status: 200, description: 'Patients seeded successfully' })
  async seedPatients() {
    const result = await firstValueFrom(
      this.patientServiceClient.send('PatientService.Seeding.SeedPatients', {})
    );
    return result;
  }

  @Post('patient/encounters')
  @ApiOperation({ summary: 'Seed patient encounters only' })
  @ApiResponse({
    status: 200,
    description: 'Patient encounters seeded successfully',
  })
  async seedPatientEncounters() {
    const result = await firstValueFrom(
      this.patientServiceClient.send(
        'PatientService.Seeding.SeedPatientEncounters',
        {}
      )
    );
    return result;
  }

  @Post('patient/conditions')
  @ApiOperation({ summary: 'Seed patient conditions only' })
  @ApiResponse({
    status: 200,
    description: 'Patient conditions seeded successfully',
  })
  async seedPatientConditions() {
    const result = await firstValueFrom(
      this.patientServiceClient.send(
        'PatientService.Seeding.SeedPatientConditions',
        {}
      )
    );
    return result;
  }

  @Post('patient/report-templates')
  @ApiOperation({ summary: 'Seed report templates only' })
  @ApiResponse({
    status: 200,
    description: 'Report templates seeded successfully',
  })
  async seedReportTemplates() {
    const result = await firstValueFrom(
      this.patientServiceClient.send(
        'PatientService.Seeding.SeedReportTemplates',
        {}
      )
    );
    return result;
  }

  @Post('patient/queue-assignments')
  @ApiOperation({ summary: 'Seed queue assignments only' })
  @ApiResponse({
    status: 200,
    description: 'Queue assignments seeded successfully',
  })
  async seedQueueAssignments() {
    const result = await firstValueFrom(
      this.patientServiceClient.send(
        'PatientService.Seeding.SeedQueueAssignments',
        {}
      )
    );
    return result;
  }

  @Post('patient/diagnoses-reports')
  @ApiOperation({ summary: 'Seed diagnoses reports only' })
  @ApiResponse({
    status: 200,
    description: 'Diagnoses reports seeded successfully',
  })
  async seedDiagnosesReports() {
    const result = await firstValueFrom(
      this.patientServiceClient.send(
        'PatientService.Seeding.SeedDiagnosesReports',
        {}
      )
    );
    return result;
  }

  @Post('patient/run')
  @ApiOperation({ summary: 'Run patient service seeding only' })
  @ApiResponse({
    status: 200,
    description: 'Patient service seeded successfully',
  })
  async runPatientSeeding() {
    const result = await firstValueFrom(
      this.patientServiceClient.send('PatientService.Seeding.Run', {})
    );
    return result;
  }

  @Post('patient/reset')
  @ApiOperation({ summary: 'Reset and seed patient service only' })
  @ApiResponse({
    status: 200,
    description: 'Patient service reset and seeded successfully',
  })
  async resetPatientService() {
    const result = await firstValueFrom(
      this.patientServiceClient.send('PatientService.Seeding.ResetAndSeed', {})
    );
    return result;
  }

  @Delete('patient/clear')
  @ApiOperation({ summary: 'Clear patient service data only' })
  @ApiResponse({
    status: 200,
    description: 'Patient service data cleared successfully',
  })
  async clearPatientData() {
    const result = await firstValueFrom(
      this.patientServiceClient.send('PatientService.Seeding.ClearAllData', {})
    );
    return result;
  }
}
