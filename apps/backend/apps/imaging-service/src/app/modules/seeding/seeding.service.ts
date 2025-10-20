import { Injectable, Logger, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout } from 'rxjs';
import {
  ImagingModality,
  ImagingOrder,
  DicomStudy,
  DicomSeries,
  DicomInstance,
  ImageAnnotation,
} from '@backend/shared-domain';
import {
  OrderType,
  OrderStatus,
  Urgency,
  DicomStudyStatus,
  AnnotationType,
  AnnotationStatus,
  Roles,
} from '@backend/shared-enums';

@Injectable()
export class SeedingService {
  private readonly logger = new Logger(SeedingService.name);

  constructor(
    @InjectRepository(ImagingModality)
    private readonly modalityRepository: Repository<ImagingModality>,
    @InjectRepository(ImagingOrder)
    private readonly imagingOrderRepository: Repository<ImagingOrder>,
    @InjectRepository(DicomStudy)
    private readonly dicomStudyRepository: Repository<DicomStudy>,
    @InjectRepository(DicomSeries)
    private readonly dicomSeriesRepository: Repository<DicomSeries>,
    @InjectRepository(DicomInstance)
    private readonly dicomInstanceRepository: Repository<DicomInstance>,
    @InjectRepository(ImageAnnotation)
    private readonly imageAnnotationRepository: Repository<ImageAnnotation>,
    // ✅ Inject microservice clients instead of cross-database repositories
    @Inject('PATIENT_SERVICE')
    private readonly patientServiceClient: ClientProxy,
    @Inject('USER_SERVICE')
    private readonly userServiceClient: ClientProxy,
  ) {}

  // ✅ Helper method to get patient IDs from Patient Service
  private async getPatientIdsFromService(take = 10): Promise<string[]> {
    try {
      const response = await firstValueFrom(
        this.patientServiceClient
          .send('PatientService.Patient.GetIds', { take })
          .pipe(timeout(5000))
      );
      
      if (response.success && response.data) {
        this.logger.log(`📊 Retrieved ${response.count} patient IDs from Patient Service`);
        return response.data;
      }
      
      this.logger.warn('⚠️ No patient IDs returned from Patient Service');
      return [];
    } catch (error: any) {
      this.logger.error(`❌ Failed to get patient IDs: ${error.message}`);
      return [];
    }
  }

  // ✅ Helper method to get physician IDs from User Service
  private async getPhysicianIdsFromService(take = 5): Promise<string[]> {
    try {
      const response = await firstValueFrom(
        this.userServiceClient
          .send('UserService.Users.GetIdsByRole', { 
            role: Roles.PHYSICIAN, 
            take 
          })
          .pipe(timeout(5000))
      );
      
      if (response.success && response.data) {
        this.logger.log(`📊 Retrieved ${response.count} physician IDs from User Service`);
        return response.data;
      }
      
      this.logger.warn('⚠️ No physician IDs returned from User Service');
      return [];
    } catch (error: any) {
      this.logger.error(`❌ Failed to get physician IDs: ${error.message}`);
      return [];
    }
  }

  // ✅ Helper method to get technician IDs from User Service
  private async getTechnicianIdsFromService(take = 5): Promise<string[]> {
    try {
      const response = await firstValueFrom(
        this.userServiceClient
          .send('UserService.Users.GetIdsByRole', { 
            role: Roles.IMAGING_TECHNICIAN, 
            take 
          })
          .pipe(timeout(5000))
      );
      
      if (response.success && response.data) {
        this.logger.log(`📊 Retrieved ${response.count} technician IDs from User Service`);
        return response.data;
      }
      
      this.logger.warn('⚠️ No technician IDs returned from User Service');
      return [];
    } catch (error: any) {
      this.logger.error(`❌ Failed to get technician IDs: ${error.message}`);
      return [];
    }
  }

  // ✅ Helper method to get room IDs from User Service
  private async getRoomIdsFromService(take = 5): Promise<string[]> {
    try {
      const response = await firstValueFrom(
        this.userServiceClient
          .send('UserService.Rooms.GetIds', { take, isActive: true })
          .pipe(timeout(5000))
      );
      
      if (response.success && response.data) {
        this.logger.log(`📊 Retrieved ${response.count} room IDs from User Service`);
        return response.data;
      }
      
      this.logger.warn('⚠️ No room IDs returned from User Service');
      return [];
    } catch (error: any) {
      this.logger.error(`❌ Failed to get room IDs: ${error.message}`);
      return [];
    }
  }

  async runSeeding(): Promise<void> {
    this.logger.log('🌱 Starting Imaging Service database seeding...');

    try {
      await this.seedModalities();
      await this.seedImagingOrders();
      await this.seedDicomStudies();
      await this.seedDicomSeries();
      await this.seedDicomInstances();
      await this.seedAnnotations();

      this.logger.log(
        '✅ Imaging Service database seeding completed successfully!'
      );
    } catch (error: any) {
      this.logger.error('❌ Imaging Service database seeding failed:', error);
      throw error;
    }
  }

  async seedModalities(): Promise<void> {
    this.logger.log('🔬 Seeding imaging modalities...');

    const modalities = [
      {
        modalityCode: 'CT',
        modalityName: 'Computed Tomography',
        description: 'Chụp cắt lớp vi tính',
        isActive: true,
      },
      {
        modalityCode: 'MR',
        modalityName: 'Magnetic Resonance',
        description: 'Chụp cộng hưởng từ',
        isActive: true,
      },
      {
        modalityCode: 'CR',
        modalityName: 'Computed Radiography',
        description: 'Chụp X-quang số hóa',
        isActive: true,
      },
      {
        modalityCode: 'DX',
        modalityName: 'Digital Radiography',
        description: 'Chụp X-quang kỹ thuật số',
        isActive: true,
      },
      {
        modalityCode: 'US',
        modalityName: 'Ultrasound',
        description: 'Siêu âm',
        isActive: true,
      },
      {
        modalityCode: 'XA',
        modalityName: 'X-Ray Angiography',
        description: 'Chụp mạch máu X-quang',
        isActive: true,
      },
      {
        modalityCode: 'NM',
        modalityName: 'Nuclear Medicine',
        description: 'Y học hạt nhân',
        isActive: true,
      },
      {
        modalityCode: 'PT',
        modalityName: 'Positron Emission Tomography',
        description: 'Chụp cắt lớp phát xạ positron',
        isActive: true,
      },
      {
        modalityCode: 'MG',
        modalityName: 'Mammography',
        description: 'Chụp X-quang vú',
        isActive: true,
      },
      {
        modalityCode: 'RF',
        modalityName: 'Radio Fluoroscopy',
        description: 'Chụp huỳnh quang',
        isActive: true,
      },
    ];

    for (const modality of modalities) {
      const existing = await this.modalityRepository.findOne({
        where: { modalityCode: modality.modalityCode },
      });

      if (!existing) {
        const newModality = this.modalityRepository.create(modality);
        await this.modalityRepository.save(newModality);
        this.logger.log(`✅ Created modality: ${modality.modalityName}`);
      } else {
        this.logger.log(
          `⚠️ Modality already exists: ${modality.modalityName}`
        );
      }
    }
  }

  async seedImagingOrders(): Promise<void> {
    this.logger.log('📋 Seeding imaging orders...');

    // Get modalities first
    const modalities = await this.modalityRepository.find({
      where: { isActive: true },
    });

    if (modalities.length === 0) {
      this.logger.warn('⚠️ No modalities found, skipping imaging order seeding');
      return;
    }

    // ✅ Get IDs from other services via microservice communication
    const patientIds = await this.getPatientIdsFromService(10);
    const physicianIds = await this.getPhysicianIdsFromService(5);
    const roomIds = await this.getRoomIdsFromService(5);

    // Check if we have required data
    if (patientIds.length === 0) {
      this.logger.warn('⚠️ No patients found, skipping imaging order seeding');
      return;
    }

    if (physicianIds.length === 0) {
      this.logger.warn('⚠️ No physicians found, skipping imaging order seeding');
      return;
    }

    if (roomIds.length === 0) {
      this.logger.warn('⚠️ No rooms found, skipping imaging order seeding');
      return;
    }

    const bodyParts = [
      'Đầu',
      'Ngực',
      'Bụng',
      'Tay phải',
      'Chân trái',
      'Cột sống',
      'Tim',
      'Phổi',
      'Gan',
      'Thận',
    ];

    const orderTypes = [
      OrderType.DIAGNOSTIC,
      OrderType.SCREENING,
      OrderType.FOLLOW_UP,
      OrderType.PROCEDURE,
    ];

    const urgencies = [Urgency.ROUTINE, Urgency.URGENT, Urgency.STAT];

    const orderStatuses = [
      OrderStatus.PENDING,
      OrderStatus.SCHEDULED,
      OrderStatus.IN_PROGRESS,
      OrderStatus.COMPLETED,
    ];

    const clinicalIndications = [
      'Nghi ngờ gãy xương',
      'Theo dõi sau phẫu thuật',
      'Đau ngực không rõ nguyên nhân',
      'Kiểm tra định kỳ',
      'Khó thở',
      'Đau bụng dữ dội',
      'Chấn thương đầu',
      'Sàng lọc ung thư',
    ];

    let orderCounter = 1;

    // Create 20 sample imaging orders
    for (let i = 0; i < 20; i++) {
      const modality = modalities[i % modalities.length];
      const patientId = patientIds[i % patientIds.length];
      const physicianId = physicianIds[i % physicianIds.length];
      const roomId = roomIds[i % roomIds.length];

      const order = {
        orderNumber: `IMG-${String(orderCounter).padStart(6, '0')}`,
        patientId,
        orderingPhysicianId: physicianId,
        modalityId: modality.id,
        bodyPart: bodyParts[i % bodyParts.length],
        orderType: orderTypes[i % orderTypes.length],
        urgency: urgencies[i % urgencies.length],
        orderStatus: orderStatuses[i % orderStatuses.length],
        clinicalIndication: clinicalIndications[i % clinicalIndications.length],
        contrastRequired: i % 3 === 0,
        specialInstructions:
          i % 2 === 0
            ? 'Bệnh nhân cần nhịn ăn trước khi chụp'
            : 'Không có yêu cầu đặc biệt',
        roomId,
        notes: `Đơn hình ảnh y tế số ${orderCounter}`,
        completedDate:
          orderStatuses[i % orderStatuses.length] === OrderStatus.COMPLETED
            ? new Date()
            : undefined,
      };

      const existing = await this.imagingOrderRepository.findOne({
        where: { orderNumber: order.orderNumber },
      });

      if (!existing) {
        const newOrder = this.imagingOrderRepository.create(order as any);
        await this.imagingOrderRepository.save(newOrder);
        this.logger.log(`✅ Created imaging order: ${order.orderNumber}`);
        orderCounter++;
      } else {
        this.logger.log(
          `⚠️ Imaging order already exists: ${order.orderNumber}`
        );
      }
    }
  }

  async seedDicomStudies(): Promise<void> {
    this.logger.log('🏥 Seeding DICOM studies...');

    const modalities = await this.modalityRepository.find({
      where: { isActive: true },
    });

    const imagingOrders = await this.imagingOrderRepository.find({
      take: 10,
    });

    if (modalities.length === 0) {
      this.logger.warn('⚠️ No modalities found, skipping DICOM study seeding');
      return;
    }

    // ✅ Get IDs from other services via microservice communication
    const patientIds = await this.getPatientIdsFromService(10);
    const physicianIds = await this.getPhysicianIdsFromService(5);
    const technicianIds = await this.getTechnicianIdsFromService(5);

    // Check if we have required data
    if (patientIds.length === 0) {
      this.logger.warn('⚠️ No patients found, skipping DICOM study seeding');
      return;
    }

    if (physicianIds.length === 0) {
      this.logger.warn('⚠️ No physicians found, skipping DICOM study seeding');
      return;
    }

    // Use physician IDs if no technicians found
    const finalTechnicianIds = technicianIds.length > 0 ? technicianIds : physicianIds;
    if (technicianIds.length === 0) {
      this.logger.warn('⚠️ No technicians found, using physicians instead');
    }

    const studyDescriptions = [
      'CT Ngực không thuốc cản quang',
      'MRI Não có thuốc cản quang',
      'X-quang Cột sống thắt lưng 2 tư thế',
      'Siêu âm Bụng tổng quát',
      'CT Bụng - Chậu có thuốc cản quang',
      'MRI Khớp gối trái',
      'X-quang Ngực thẳng',
      'Chụp mạch vành',
    ];

    const statuses = [
      DicomStudyStatus.IN_PROGRESS,
      DicomStudyStatus.COMPLETED,
      DicomStudyStatus.VERIFIED,
      DicomStudyStatus.REPORTED,
    ];

    // Create 15 sample DICOM studies
    for (let i = 0; i < 15; i++) {
      const modality = modalities[i % modalities.length];
      const patientId = patientIds[i % patientIds.length];
      const physicianId = physicianIds[i % physicianIds.length];
      const technicianId = finalTechnicianIds[i % finalTechnicianIds.length];
      const orderId =
        imagingOrders.length > 0
          ? imagingOrders[i % imagingOrders.length].id
          : undefined;

      const studyDate = new Date();
      studyDate.setDate(studyDate.getDate() - Math.floor(Math.random() * 30));

      const study = {
        studyInstanceUid: `1.2.840.113619.2.${Date.now()}.${i}.${Math.random()
          .toString(36)
          .substr(2, 9)}`,
        patientId,
        orderId,
        modalityId: modality.id,
        studyDate,
        studyTime: '14:30:00',
        studyDescription: studyDescriptions[i % studyDescriptions.length],
        referringPhysician: 'BS. Nguyễn Văn A',
        performingPhysicianId: physicianId,
        technicianId,
        studyStatus: statuses[i % statuses.length],
        numberOfSeries: 0, // Will be updated when series are created
        storagePath: `/dicom/studies/${studyDate.getFullYear()}/${String(
          studyDate.getMonth() + 1
        ).padStart(2, '0')}/${i}`,
      };

      const existing = await this.dicomStudyRepository.findOne({
        where: { studyInstanceUid: study.studyInstanceUid },
      });

      if (!existing) {
        const newStudy = this.dicomStudyRepository.create(study as any);
        await this.dicomStudyRepository.save(newStudy);
        this.logger.log(
          `✅ Created DICOM study: ${study.studyDescription}`
        );
      } else {
        this.logger.log(
          `⚠️ DICOM study already exists: ${study.studyInstanceUid}`
        );
      }
    }
  }

  async seedDicomSeries(): Promise<void> {
    this.logger.log('📊 Seeding DICOM series...');

    const studies = await this.dicomStudyRepository.find({
      take: 10,
    });

    if (studies.length === 0) {
      this.logger.warn('⚠️ No studies found, skipping DICOM series seeding');
      return;
    }

    const seriesDescriptions = [
      'Axial T1 FLAIR',
      'Axial T2 FSE',
      'Sagittal T1',
      'Coronal STIR',
      'Scout',
      'Cắt ngang',
      'Cắt dọc',
      '3D Reconstruction',
    ];

    const bodyParts = [
      'Đầu',
      'Ngực',
      'Bụng',
      'Chân',
      'Tay',
      'Cột sống',
    ];

    const protocols = [
      'Standard Brain',
      'High Resolution Chest',
      'Abdomen Routine',
      'Extremity Protocol',
      'Spine Standard',
    ];

    let totalSeriesCreated = 0;

    // Create 2-4 series for each study
    for (const study of studies) {
      const numSeries = Math.floor(Math.random() * 3) + 2; // 2-4 series

      for (let i = 0; i < numSeries; i++) {
        const seriesDate = new Date(study.studyDate);

        const series = {
          seriesInstanceUid: `${study.studyInstanceUid}.${i + 1}.${Math.random()
            .toString(36)
            .substr(2, 9)}`,
          studyId: study.id,
          seriesNumber: i + 1,
          seriesDescription:
            seriesDescriptions[
              (totalSeriesCreated + i) % seriesDescriptions.length
            ],
          bodyPartExamined: bodyParts[i % bodyParts.length],
          seriesDate,
          seriesTime: `${String(14 + i).padStart(2, '0')}:${String(
            Math.floor(Math.random() * 60)
          ).padStart(2, '0')}:00`,
          protocolName: protocols[i % protocols.length],
          numberOfInstances: 0, // Will be updated when instances are created
        };

        const existing = await this.dicomSeriesRepository.findOne({
          where: { seriesInstanceUid: series.seriesInstanceUid },
        });

        if (!existing) {
          const newSeries = this.dicomSeriesRepository.create(series as any);
          await this.dicomSeriesRepository.save(newSeries);
          this.logger.log(
            `✅ Created DICOM series: ${series.seriesDescription} (Series ${series.seriesNumber})`
          );
          totalSeriesCreated++;
        } else {
          this.logger.log(
            `⚠️ DICOM series already exists: ${series.seriesInstanceUid}`
          );
        }
      }

      // Update study with number of series
      await this.dicomStudyRepository.update(study.id, {
        numberOfSeries: numSeries,
      });
    }

    this.logger.log(`✅ Created ${totalSeriesCreated} DICOM series in total`);
  }

  async seedDicomInstances(): Promise<void> {
    this.logger.log('🖼️ Seeding DICOM instances...');

    const series = await this.dicomSeriesRepository.find({
      take: 15,
    });

    if (series.length === 0) {
      this.logger.warn('⚠️ No series found, skipping DICOM instance seeding');
      return;
    }

    let totalInstancesCreated = 0;

    // Create 5-15 instances for each series
    for (const singleSeries of series) {
      const numInstances = Math.floor(Math.random() * 11) + 5; // 5-15 instances

      for (let i = 0; i < numInstances; i++) {
        const instance = {
          sopInstanceUid: `${
            singleSeries.seriesInstanceUid
          }.${i + 1}.${Math.random().toString(36).substr(2, 9)}`,
          seriesId: singleSeries.id,
          instanceNumber: i + 1,
          filePath: `/dicom/instances/${singleSeries.id}`,
          fileName: `IM${String(i + 1).padStart(4, '0')}.dcm`,
          imagePosition: { x: 0, y: 0, z: i * 5 },
          imageOrientation: { xx: 1, xy: 0, xz: 0, yx: 0, yy: 1, yz: 0 },
          pixelSpacing: { row: 0.5, column: 0.5 },
          sliceThickness: 5.0,
          windowCenter: 40,
          windowWidth: 400,
          rows: 512,
          columns: 512,
        };

        const existing = await this.dicomInstanceRepository.findOne({
          where: { sopInstanceUid: instance.sopInstanceUid },
        });

        if (!existing) {
          const newInstance = this.dicomInstanceRepository.create(
            instance as any
          );
          await this.dicomInstanceRepository.save(newInstance);
          totalInstancesCreated++;
        }
      }

      // Update series with number of instances
      await this.dicomSeriesRepository.update(singleSeries.id, {
        numberOfInstances: numInstances,
      });

      this.logger.log(
        `✅ Created ${numInstances} instances for series: ${singleSeries.seriesDescription}`
      );
    }

    this.logger.log(
      `✅ Created ${totalInstancesCreated} DICOM instances in total`
    );
  }

  async seedAnnotations(): Promise<void> {
    this.logger.log('✍️ Seeding image annotations...');

    const instances = await this.dicomInstanceRepository.find({
      take: 20,
    });

    if (instances.length === 0) {
      this.logger.warn('⚠️ No instances found, skipping annotation seeding');
      return;
    }

    // ✅ Get annotator IDs (technicians + physicians) from User Service
    const technicianIds = await this.getTechnicianIdsFromService(5);
    const physicianIds = await this.getPhysicianIdsFromService(5);
    
    // Combine both lists
    const annotatorIds = [...technicianIds, ...physicianIds];

    if (annotatorIds.length === 0) {
      this.logger.warn('⚠️ No annotators found, skipping annotation seeding');
      return;
    }

    this.logger.log(`📊 Found ${annotatorIds.length} annotators (${technicianIds.length} technicians + ${physicianIds.length} physicians)`);

    const annotationTypes = [
      AnnotationType.TEXT,
      AnnotationType.ARROW,
      AnnotationType.CIRCLE,
      AnnotationType.RECTANGLE,
      AnnotationType.POLYGON,
      AnnotationType.MEASUREMENT,
    ];

    const annotationStatuses = [
      AnnotationStatus.DRAFT,
      AnnotationStatus.FINAL,
      AnnotationStatus.REVIEWED,
    ];

    const textContents = [
      'Phát hiện tổn thương nghi ngờ',
      'Vùng cần theo dõi',
      'Không có bất thường',
      'Khối u nghi ngờ ác tính',
      'Dấu hiệu viêm',
      'Gãy xương',
    ];

    const measurementUnits = ['mm', 'cm', 'ml', 'degree'];

    const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF'];

    let annotationCounter = 0;

    // Create 1-3 annotations for some instances
    for (const instance of instances) {
      const numAnnotations = Math.floor(Math.random() * 3) + 1; // 1-3 annotations

      for (let i = 0; i < numAnnotations; i++) {
        const annotationType =
          annotationTypes[annotationCounter % annotationTypes.length];

        const annotation = {
          instanceId: instance.id,
          annotationType,
          annotationData:
            annotationType === AnnotationType.MEASUREMENT
              ? { type: 'length', points: 2 }
              : annotationType === AnnotationType.CIRCLE
                ? { radius: Math.random() * 50 + 10 }
                : annotationType === AnnotationType.RECTANGLE
                  ? { width: Math.random() * 100, height: Math.random() * 100 }
                  : { content: 'Annotation data' },
          coordinates:
            annotationType === AnnotationType.MEASUREMENT
              ? {
                  start: { x: Math.random() * 512, y: Math.random() * 512 },
                  end: { x: Math.random() * 512, y: Math.random() * 512 },
                }
              : annotationType === AnnotationType.CIRCLE
                ? { center: { x: Math.random() * 512, y: Math.random() * 512 } }
                : {
                    topLeft: { x: Math.random() * 512, y: Math.random() * 512 },
                  },
          measurementValue:
            annotationType === AnnotationType.MEASUREMENT
              ? parseFloat((Math.random() * 50 + 5).toFixed(2))
              : undefined,
          measurementUnit:
            annotationType === AnnotationType.MEASUREMENT
              ? measurementUnits[i % measurementUnits.length]
              : undefined,
          textContent:
            annotationType === AnnotationType.TEXT
              ? textContents[annotationCounter % textContents.length]
              : undefined,
          colorCode: colors[annotationCounter % colors.length],
          annotationStatus:
            annotationStatuses[annotationCounter % annotationStatuses.length],
          annotatorId:
            annotatorIds[annotationCounter % annotatorIds.length],
          annotationDate: new Date(),
          reviewDate:
            annotationStatuses[annotationCounter % annotationStatuses.length] ===
            AnnotationStatus.REVIEWED
              ? new Date()
              : undefined,
          notes: `Annotation ${annotationCounter + 1} for instance ${instance.instanceNumber}`,
        };

        const newAnnotation = this.imageAnnotationRepository.create(
          annotation as any
        );
        await this.imageAnnotationRepository.save(newAnnotation);
        annotationCounter++;
      }

      this.logger.log(
        `✅ Created ${numAnnotations} annotations for instance: ${instance.fileName}`
      );
    }

    this.logger.log(`✅ Created ${annotationCounter} annotations in total`);
  }

  async clearAllData(): Promise<void> {
    this.logger.log('🗑️ Clearing all Imaging Service data...');

    try {
      await this.imageAnnotationRepository.delete({});
      await this.dicomInstanceRepository.delete({});
      await this.dicomSeriesRepository.delete({});
      await this.dicomStudyRepository.delete({});
      await this.imagingOrderRepository.delete({});
      await this.modalityRepository.delete({});

      this.logger.log('✅ All Imaging Service data cleared successfully!');
    } catch (error: any) {
      this.logger.error('❌ Failed to clear Imaging Service data:', error);
      throw error;
    }
  }

  async resetAndSeed(): Promise<void> {
    this.logger.log('🔄 Resetting and seeding Imaging Service database...');

    try {
      await this.clearAllData();
      await this.runSeeding();

      this.logger.log(
        '✅ Imaging Service database reset and seeded successfully!'
      );
    } catch (error: any) {
      this.logger.error(
        '❌ Imaging Service database reset and seed failed:',
        error
      );
      throw error;
    }
  }
}

