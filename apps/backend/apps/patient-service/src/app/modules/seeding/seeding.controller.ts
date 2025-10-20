import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { SeedingService } from './seeding.service';

@Controller()
export class SeedingController {
  constructor(private readonly seedingService: SeedingService) {}

  // Microservice Message Patterns for API Gateway
  @MessagePattern('PatientService.Seeding.Run')
  async microserviceRunSeeding(@Payload() data: any) {
    await this.seedingService.runSeeding();
    return {
      success: true,
      message: 'Patient Service database seeding completed successfully!',
      timestamp: new Date().toISOString(),
    };
  }

  @MessagePattern('PatientService.Seeding.ResetAndSeed')
  async microserviceResetAndSeed(@Payload() data: any) {
    await this.seedingService.resetAndSeed();
    return {
      success: true,
      message: 'Patient Service database reset and seeded successfully!',
      timestamp: new Date().toISOString(),
    };
  }

  @MessagePattern('PatientService.Seeding.ClearAllData')
  async microserviceClearAllData(@Payload() data: any) {
    await this.seedingService.clearAllData();
    return {
      success: true,
      message: 'Patient Service data cleared successfully!',
      timestamp: new Date().toISOString(),
    };
  }

  @MessagePattern('PatientService.Seeding.SeedPatients')
  async microserviceSeedPatients(@Payload() data: any) {
    await this.seedingService.seedPatients();
    return {
      success: true,
      message: 'Patients seeded successfully!',
      timestamp: new Date().toISOString(),
    };
  }

  @MessagePattern('PatientService.Seeding.SeedPatientEncounters')
  async microserviceSeedPatientEncounters(@Payload() data: any) {
    await this.seedingService.seedPatientEncounters();
    return {
      success: true,
      message: 'Patient encounters seeded successfully!',
      timestamp: new Date().toISOString(),
    };
  }

  @MessagePattern('PatientService.Seeding.SeedPatientConditions')
  async microserviceSeedPatientConditions(@Payload() data: any) {
    await this.seedingService.seedPatientConditions();
    return {
      success: true,
      message: 'Patient conditions seeded successfully!',
      timestamp: new Date().toISOString(),
    };
  }

  @MessagePattern('PatientService.Seeding.SeedQueueAssignments')
  async microserviceSeedQueueAssignments(@Payload() data: any) {
    await this.seedingService.seedQueueAssignments();
    return {
      success: true,
      message: 'Queue assignments seeded successfully!',
      timestamp: new Date().toISOString(),
    };
  }

  @MessagePattern('PatientService.Seeding.SeedDiagnosesReports')
  async microserviceSeedDiagnosesReports(@Payload() data: any) {
    await this.seedingService.seedDiagnosesReports();
    return {
      success: true,
      message: 'Diagnoses reports seeded successfully!',
      timestamp: new Date().toISOString(),
    };
  }

  @MessagePattern('PatientService.Seeding.GetStatus')
  async microserviceGetStatus(@Payload() data: any) {
    return {
      service: 'PatientService',
      status: 'healthy',
      seededData: {
        patients: 'available',
        encounters: 'available',
        conditions: 'available',
        queueAssignments: 'available',
        diagnosesReports: 'available',
      },
      timestamp: new Date().toISOString(),
    };
  }
}

