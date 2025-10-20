import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { SeedingService } from './seeding.service';

@Controller()
export class SeedingController {
  constructor(private readonly seedingService: SeedingService) {}

  // Microservice Message Patterns for API Gateway
  @MessagePattern('ImagingService.Seeding.Run')
  async microserviceRunSeeding(@Payload() data: any) {
    await this.seedingService.runSeeding();
    return {
      success: true,
      message: 'Imaging Service database seeding completed successfully!',
      timestamp: new Date().toISOString(),
    };
  }

  @MessagePattern('ImagingService.Seeding.ResetAndSeed')
  async microserviceResetAndSeed(@Payload() data: any) {
    await this.seedingService.resetAndSeed();
    return {
      success: true,
      message: 'Imaging Service database reset and seeded successfully!',
      timestamp: new Date().toISOString(),
    };
  }

  @MessagePattern('ImagingService.Seeding.ClearAllData')
  async microserviceClearAllData(@Payload() data: any) {
    await this.seedingService.clearAllData();
    return {
      success: true,
      message: 'Imaging Service data cleared successfully!',
      timestamp: new Date().toISOString(),
    };
  }

  @MessagePattern('ImagingService.Seeding.SeedModalities')
  async microserviceSeedModalities(@Payload() data: any) {
    await this.seedingService.seedModalities();
    return {
      success: true,
      message: 'Modalities seeded successfully!',
      timestamp: new Date().toISOString(),
    };
  }

  @MessagePattern('ImagingService.Seeding.SeedImagingOrders')
  async microserviceSeedImagingOrders(@Payload() data: any) {
    await this.seedingService.seedImagingOrders();
    return {
      success: true,
      message: 'Imaging orders seeded successfully!',
      timestamp: new Date().toISOString(),
    };
  }

  @MessagePattern('ImagingService.Seeding.SeedDicomStudies')
  async microserviceSeedDicomStudies(@Payload() data: any) {
    await this.seedingService.seedDicomStudies();
    return {
      success: true,
      message: 'DICOM studies seeded successfully!',
      timestamp: new Date().toISOString(),
    };
  }

  @MessagePattern('ImagingService.Seeding.SeedDicomSeries')
  async microserviceSeedDicomSeries(@Payload() data: any) {
    await this.seedingService.seedDicomSeries();
    return {
      success: true,
      message: 'DICOM series seeded successfully!',
      timestamp: new Date().toISOString(),
    };
  }

  @MessagePattern('ImagingService.Seeding.SeedDicomInstances')
  async microserviceSeedDicomInstances(@Payload() data: any) {
    await this.seedingService.seedDicomInstances();
    return {
      success: true,
      message: 'DICOM instances seeded successfully!',
      timestamp: new Date().toISOString(),
    };
  }

  @MessagePattern('ImagingService.Seeding.SeedAnnotations')
  async microserviceSeedAnnotations(@Payload() data: any) {
    await this.seedingService.seedAnnotations();
    return {
      success: true,
      message: 'Annotations seeded successfully!',
      timestamp: new Date().toISOString(),
    };
  }

  @MessagePattern('ImagingService.Seeding.GetStatus')
  async microserviceGetStatus(@Payload() data: any) {
    return {
      service: 'ImagingService',
      status: 'healthy',
      seededData: {
        modalities: 'available',
        imagingOrders: 'available',
        dicomStudies: 'available',
        dicomSeries: 'available',
        dicomInstances: 'available',
        annotations: 'available',
      },
      timestamp: new Date().toISOString(),
    };
  }
}

