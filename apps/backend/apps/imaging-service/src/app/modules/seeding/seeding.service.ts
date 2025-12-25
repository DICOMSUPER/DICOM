import { Injectable, Logger, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout } from 'rxjs';
import {
  ImagingModality,
  ImagingOrder,
  ImagingOrderForm,
  DicomStudy,
  DicomSeries,
  DicomInstance,
  ImageAnnotation,
  ModalityMachine,
  BodyPart,
  RequestProcedure,
  PatientEncounter,
} from '@backend/shared-domain';
import {
  OrderStatus,
  Urgency,
  DicomStudyStatus,
  AnnotationType,
  AnnotationStatus,
  Roles,
  MachineStatus,
} from '@backend/shared-enums';

@Injectable()
export class SeedingService {
  private readonly logger = new Logger(SeedingService.name);

  constructor(
    @InjectRepository(ImagingModality)
    private readonly modalityRepository: Repository<ImagingModality>,
    @InjectRepository(ModalityMachine)
    private readonly modalityMachineRepository: Repository<ModalityMachine>,
    @InjectRepository(BodyPart)
    private readonly bodyPartRepository: Repository<BodyPart>,
    @InjectRepository(RequestProcedure)
    private readonly requestProcedureRepository: Repository<RequestProcedure>,
    @InjectRepository(ImagingOrderForm)
    private readonly imagingOrderFormRepository: Repository<ImagingOrderForm>,
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
    @Inject('PATIENT_SERVICE')
    private readonly patientServiceClient: ClientProxy,
    @Inject('USER_SERVICE')
    private readonly userServiceClient: ClientProxy,
    private readonly dataSource: DataSource
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
        this.logger.log(
          `📊 Retrieved ${response.count} patient IDs from Patient Service`
        );
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
            take,
          })
          .pipe(timeout(5000))
      );

      if (response.success && response.data) {
        this.logger.log(
          `📊 Retrieved ${response.count} physician IDs from User Service`
        );
        return response.data;
      }

      this.logger.warn('⚠️ No physician IDs returned from User Service');
      return [];
    } catch (error: any) {
      this.logger.error(`❌ Failed to get physician IDs: ${error.message}`);
      return [];
    }
  }

  private async getRadiologistIdsFromService(take = 5): Promise<string[]> {
    try {
      const response = await firstValueFrom(
        this.userServiceClient
          .send('UserService.Users.GetIdsByRole', {
            role: Roles.RADIOLOGIST,
            take,
          })
          .pipe(timeout(5000))
      );

      if (response.success && response.data) {
        this.logger.log(
          `📊 Retrieved ${response.count} physician IDs from User Service`
        );
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
            take,
          })
          .pipe(timeout(5000))
      );

      if (response.success && response.data) {
        this.logger.log(
          `📊 Retrieved ${response.count} technician IDs from User Service`
        );
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
        this.logger.log(
          `📊 Retrieved ${response.count} room IDs from User Service`
        );
        return response.data;
      }

      this.logger.warn('⚠️ No room IDs returned from User Service');
      return [];
    } catch (error: any) {
      this.logger.error(`❌ Failed to get room IDs: ${error.message}`);
      return [];
    }
  }

  private async getEncounterIdsByPatient(
    patientId: string,
    take = 3
  ): Promise<string[]> {
    try {
      const response = await firstValueFrom(
        this.patientServiceClient
          .send('PatientService.Encounter.FindByPatientId', {
            patientId,
            pagination: {
              page: 1,
              limit: take,
            },
          })
          .pipe(timeout(5000))
      );
      
      if (response?.data?.length) {
        return response.data.map((encounter: PatientEncounter) => encounter.id);
      }

      return [];
    } catch (error: any) {
      this.logger.error(
        `❌ Failed to get encounter IDs for patient ${patientId}: ${error.message}`
      );
      return [];
    }
  }

  async runSeeding(): Promise<void> {
    this.logger.log('🌱 Starting Imaging Service database seeding...');

    try {
      await this.seedModalities();
      await this.seedBodyParts();
      await this.seedModalityMachines();
      await this.seedRequestProcedures();
      await this.seedImagingOrderForms();
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
        Object.assign(existing, modality);
        await this.modalityRepository.save(existing);
        this.logger.log(`🔄 Updated modality: ${modality.modalityName}`);
      }
    }
  }

  async seedBodyParts(): Promise<void> {
    this.logger.log('🫀 Seeding body parts...');

    const bodyParts = [
      { name: 'Đầu', description: 'Vùng đầu bao gồm sọ não và não bộ' },
      { name: 'Cổ', description: 'Vùng cổ' },
      { name: 'Ngực', description: 'Vùng ngực bao gồm tim và phổi' },
      { name: 'Bụng', description: 'Vùng bụng bao gồm gan, lách, dạ dày' },
      { name: 'Chậu', description: 'Vùng chậu' },
      { name: 'Cột sống cổ', description: 'Đốt sống cổ C1-C7' },
      { name: 'Cột sống ngực', description: 'Đốt sống ngực T1-T12' },
      { name: 'Cột sống thắt lưng', description: 'Đốt sống thắt lưng L1-L5' },
      { name: 'Cột sống cùng', description: 'Xương cùng và xương cụt' },
      { name: 'Vai phải', description: 'Khớp vai bên phải' },
      { name: 'Vai trái', description: 'Khớp vai bên trái' },
      { name: 'Tay phải', description: 'Cánh tay và cẳng tay phải' },
      { name: 'Tay trái', description: 'Cánh tay và cẳng tay trái' },
      { name: 'Bàn tay phải', description: 'Bàn tay và ngón tay phải' },
      { name: 'Bàn tay trái', description: 'Bàn tay và ngón tay trái' },
      { name: 'Chân phải', description: 'Đùi và cẳng chân phải' },
      { name: 'Chân trái', description: 'Đùi và cẳng chân trái' },
      { name: 'Bàn chân phải', description: 'Bàn chân và ngón chân phải' },
      { name: 'Bàn chân trái', description: 'Bàn chân và ngón chân trái' },
      { name: 'Tim', description: 'Tim và mạch vành' },
      { name: 'Phổi', description: 'Phổi và phế quản' },
      { name: 'Gan', description: 'Gan' },
      { name: 'Thận', description: 'Thận' },
      { name: 'Tử cung', description: 'Tử cung (nữ)' },
      { name: 'Tuyến tiền liệt', description: 'Tuyến tiền liệt (nam)' },
    ];

    for (const bodyPart of bodyParts) {
      const existing = await this.bodyPartRepository.findOne({
        where: { name: bodyPart.name },
      });

      if (!existing) {
        const newBodyPart = this.bodyPartRepository.create(bodyPart);
        await this.bodyPartRepository.save(newBodyPart);
        this.logger.log(`✅ Created body part: ${bodyPart.name}`);
      } else {
        Object.assign(existing, bodyPart);
        await this.bodyPartRepository.save(existing);
        this.logger.log(`🔄 Updated body part: ${bodyPart.name}`);
      }
    }
  }

  async seedModalityMachines(): Promise<void> {
    this.logger.log('🏥 Seeding modality machines...');

    const modalities = await this.modalityRepository.find({
      where: { isActive: true },
    });

    if (modalities.length === 0) {
      this.logger.warn('⚠️ No modalities found, skipping machine seeding');
      return;
    }

    // Get room IDs from User Service
    const roomIds = await this.getRoomIdsFromService(10);

    if (roomIds.length === 0) {
      this.logger.warn('⚠️ No rooms found, skipping machine seeding');
      return;
    }

    const machines = [
      {
        name: 'CT Scanner Siemens SOMATOM Definition',
        modalityCode: 'CT',
        manufacturer: 'Siemens',
        model: 'SOMATOM Definition',
        serialNumber: 'CT-001-2023',
      },
      {
        name: 'CT Scanner GE Revolution',
        modalityCode: 'CT',
        manufacturer: 'GE Healthcare',
        model: 'Revolution CT',
        serialNumber: 'CT-002-2023',
      },
      {
        name: 'MRI Siemens Magnetom Skyra 3T',
        modalityCode: 'MR',
        manufacturer: 'Siemens',
        model: 'Magnetom Skyra',
        serialNumber: 'MR-001-2023',
      },
      {
        name: 'MRI GE Signa Explorer 1.5T',
        modalityCode: 'MR',
        manufacturer: 'GE Healthcare',
        model: 'Signa Explorer',
        serialNumber: 'MR-002-2023',
      },
      {
        name: 'X-Ray Canon CXDI-810C',
        modalityCode: 'DX',
        manufacturer: 'Canon',
        model: 'CXDI-810C',
        serialNumber: 'DX-001-2023',
      },
      {
        name: 'X-Ray Fujifilm FDR D-EVO',
        modalityCode: 'CR',
        manufacturer: 'Fujifilm',
        model: 'FDR D-EVO',
        serialNumber: 'CR-001-2023',
      },
      {
        name: 'Ultrasound GE Voluson E10',
        modalityCode: 'US',
        manufacturer: 'GE Healthcare',
        model: 'Voluson E10',
        serialNumber: 'US-001-2023',
      },
      {
        name: 'Ultrasound Philips EPIQ 7',
        modalityCode: 'US',
        manufacturer: 'Philips',
        model: 'EPIQ 7',
        serialNumber: 'US-002-2023',
      },
    ];

    let machineCounter = 0;

    for (const machine of machines) {
      const modality = modalities.find(
        (m) => m.modalityCode === machine.modalityCode
      );

      if (!modality) {
        this.logger.warn(
          `⚠️ Modality ${machine.modalityCode} not found, skipping machine: ${machine.name}`
        );
        continue;
      }

      const existing = await this.modalityMachineRepository.findOne({
        where: { serialNumber: machine.serialNumber },
      });

      if (!existing) {
        const newMachine = this.modalityMachineRepository.create({
          name: machine.name,
          modalityId: modality.id,
          manufacturer: machine.manufacturer,
          model: machine.model,
          serialNumber: machine.serialNumber,
          roomId: roomIds[machineCounter % roomIds.length],
          status: MachineStatus.ACTIVE,
        });
        await this.modalityMachineRepository.save(newMachine);
        this.logger.log(`✅ Created machine: ${machine.name}`);
        machineCounter++;
      } else {
        this.logger.log(`⚠️ Machine already exists: ${machine.name}`);
      }
    }
  }

  async seedRequestProcedures(): Promise<void> {
    this.logger.log('📋 Seeding request procedures...');

    const modalities = await this.modalityRepository.find({
      where: { isActive: true },
    });

    const bodyParts = await this.bodyPartRepository.find();

    if (modalities.length === 0 || bodyParts.length === 0) {
      this.logger.warn(
        '⚠️ No modalities or body parts found, skipping procedure seeding'
      );
      return;
    }

    const procedures = [
      // CT Procedures
      {
        name: 'CT Đầu không thuốc',
        modalityCode: 'CT',
        bodyPartName: 'Đầu',
        description: 'Chụp CT não không tiêm thuốc cản quang',
      },
      {
        name: 'CT Đầu có thuốc',
        modalityCode: 'CT',
        bodyPartName: 'Đầu',
        description: 'Chụp CT não có tiêm thuốc cản quang',
      },
      {
        name: 'CT Ngực',
        modalityCode: 'CT',
        bodyPartName: 'Ngực',
        description: 'Chụp CT lồng ngực có thuốc cản quang',
      },
      {
        name: 'CT Bụng - Chậu',
        modalityCode: 'CT',
        bodyPartName: 'Bụng',
        description: 'Chụp CT bụng chậu có thuốc cản quang',
      },
      // MRI Procedures
      {
        name: 'MRI Não',
        modalityCode: 'MR',
        bodyPartName: 'Đầu',
        description: 'Chụp MRI não có thuốc đối quang',
      },
      {
        name: 'MRI Cột sống thắt lưng',
        modalityCode: 'MR',
        bodyPartName: 'Cột sống thắt lưng',
        description: 'Chụp MRI cột sống thắt lưng',
      },
      {
        name: 'MRI Khớp gối',
        modalityCode: 'MR',
        bodyPartName: 'Chân phải',
        description: 'Chụp MRI khớp gối',
      },
      // X-Ray Procedures
      {
        name: 'X-Quang Ngực thẳng',
        modalityCode: 'DX',
        bodyPartName: 'Ngực',
        description: 'Chụp X-quang phổi tư thế thẳng',
      },
      {
        name: 'X-Quang Cột sống',
        modalityCode: 'CR',
        bodyPartName: 'Cột sống thắt lưng',
        description: 'Chụp X-quang cột sống 2 tư thế',
      },
      // Ultrasound Procedures
      {
        name: 'Siêu âm Bụng tổng quát',
        modalityCode: 'US',
        bodyPartName: 'Bụng',
        description: 'Siêu âm gan mật tụy lách thận',
      },
      {
        name: 'Siêu âm Tim',
        modalityCode: 'US',
        bodyPartName: 'Tim',
        description: 'Siêu âm tim qua thành ngực',
      },
      {
        name: 'Siêu âm Thai',
        modalityCode: 'US',
        bodyPartName: 'Tử cung',
        description: 'Siêu âm thai thường quy',
      },
    ];

    for (const procedure of procedures) {
      const modality = modalities.find(
        (m) => m.modalityCode === procedure.modalityCode
      );
      const bodyPart = bodyParts.find(
        (bp) => bp.name === procedure.bodyPartName
      );

      if (!modality || !bodyPart) {
        this.logger.warn(
          `⚠️ Modality or body part not found for procedure: ${procedure.name}`
        );
        continue;
      }

      const existing = await this.requestProcedureRepository.findOne({
        where: { name: procedure.name },
      });

      if (!existing) {
        const newProcedure = this.requestProcedureRepository.create({
          name: procedure.name,
          modalityId: modality.id,
          bodyPartId: bodyPart.id,
          description: procedure.description,
          isActive: true,
        });
        await this.requestProcedureRepository.save(newProcedure);
        this.logger.log(`✅ Created procedure: ${procedure.name}`);
      } else {
        this.logger.log(`⚠️ Procedure already exists: ${procedure.name}`);
      }
    }
  }

  async seedImagingOrderForms(): Promise<void> {
    this.logger.log('📝 Seeding imaging order forms...');

    const procedures = await this.requestProcedureRepository.find({
      where: { isActive: true },
      take: 20,
    });

    if (procedures.length === 0) {
      this.logger.warn(
        '⚠️ No procedures found, skipping imaging order form seeding'
      );
      return;
    }

    const clinicalIndications = [
      'Đau đầu kéo dài',
      'Chấn thương sau tai nạn giao thông',
      'Theo dõi khối u não',
      'Khó thở và đau ngực',
      'Đau bụng cấp',
      'Theo dõi sau phẫu thuật',
      'Tầm soát ung thư',
      'Đau cột sống mạn tính',
      'Kiểm tra định kỳ',
      'Nghi ngờ viêm phổi',
    ];

    const historyNotes = [
      'Bệnh nhân có tiền sử tăng huyết áp',
      'Bệnh nhân từng phẫu thuật vùng bụng',
      'Bệnh nhân không dị ứng thuốc cản quang',
      'Có tiền sử tai biến mạch máu não',
      'Bệnh nhân bị tiểu đường type 2',
      'Không có tiền sử bệnh lý đáng kể',
      'Tiền sử gia đình mắc ung thư phổi',
      'Bệnh nhân hiện đang dùng thuốc chống đông',
    ];

    const preparationInstructions = [
      'Nhịn ăn ít nhất 6 giờ trước khi chụp',
      'Uống nhiều nước trước khi siêu âm',
      'Không đeo trang sức hoặc kim loại',
      'Thông báo về dị ứng thuốc cản quang',
      'Ký cam kết trước khi can thiệp',
      'Mặc đồ rộng thoải mái',
    ];

    const additionalNotes = [
      'Ưu tiên chụp trong giờ hành chính',
      'Theo dõi sát sinh hiệu sau thủ thuật',
      'Liên hệ bác sĩ điều trị kết quả sớm',
      'Cần phiên dịch viên hỗ trợ',
      'Đăng ký xe lăn hỗ trợ di chuyển',
      'Ghi hình bổ sung nếu phát hiện bất thường',
    ];


    const patientIds = await this.getPatientIdsFromService(20);
    if (patientIds.length === 0) {
      this.logger.warn(
        '⚠️ No patients found, skipping imaging order form seeding'
      );
      return;
    }

    const physicianIds = await this.getPhysicianIdsFromService(10);
    if (physicianIds.length === 0) {
      this.logger.warn(
        '⚠️ No physicians found, skipping imaging order form seeding'
      );
      return;
    }

    const roomIds = await this.getRoomIdsFromService(5);
    if (roomIds.length === 0) {
      this.logger.warn(
        '⚠️ No rooms found, skipping imaging order form seeding'
      );
      return;
    }

    const encounterCache = new Map<string, string[]>();
    let formCounter = 1;

    for (const procedure of procedures) {
      const patientId = patientIds[formCounter % patientIds.length];
      const physicianId = physicianIds[formCounter % physicianIds.length];
      const roomId = roomIds[formCounter % roomIds.length];
      const diagnosis = clinicalIndications[formCounter % clinicalIndications.length];

      const existing = await this.imagingOrderFormRepository.findOne({
        where: {
          patientId,
          orderingPhysicianId: physicianId,
          diagnosis,
        },
      });

      if (existing) {
        this.logger.log(
          `⚠️ Imaging order form already exists for procedure: ${procedure.name}`
        );
        continue;
      }

      if (!encounterCache.has(patientId)) {
        const encounters = await this.getEncounterIdsByPatient(patientId, 5);
        encounterCache.set(patientId, encounters);
      }

      const encounterIds = encounterCache.get(patientId) ?? [];
    if (encounterIds.length === 0) {
      this.logger.warn(
        `⚠️ No encounter IDs returned for patient ${patientId}, skipping imaging order form seeding`
      );
      continue;
    }

    const encounterId = encounterIds[formCounter % encounterIds.length];

      const combinedNotes = `${additionalNotes[formCounter % additionalNotes.length]}. Chuẩn bị: ${preparationInstructions[formCounter % preparationInstructions.length]}. Lịch sử: ${historyNotes[formCounter % historyNotes.length]}.`;

      const form = {
        patientId,
        orderingPhysicianId: physicianId,
        encounterId,
        diagnosis,
        notes: combinedNotes,
        roomId,
      };

      const newForm = this.imagingOrderFormRepository.create(form as any);
      await this.imagingOrderFormRepository.save(newForm);
      this.logger.log(
        `✅ Created imaging order form for procedure: ${procedure.name}`
      );
      formCounter++;
    }
  }

  async seedImagingOrders(): Promise<void> {
    this.logger.log('📋 Seeding imaging orders...');

    // Get modalities first
    const modalities = await this.modalityRepository.find({
      where: { isActive: true },
    });

    if (modalities.length === 0) {
      this.logger.warn(
        '⚠️ No modalities found, skipping imaging order seeding'
      );
      return;
    }

    const procedures = await this.requestProcedureRepository.find({
      where: { isActive: true },
    });

    if (procedures.length === 0) {
      this.logger.warn(
        '⚠️ No procedures found, skipping imaging order seeding'
      );
      return;
    }

    const orderForms = await this.imagingOrderFormRepository.find({
      take: 30,
    });

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
      this.logger.warn(
        '⚠️ No physicians found, skipping imaging order seeding'
      );
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

    const urgencies = [Urgency.ROUTINE, Urgency.URGENT, Urgency.STAT];

    const orderStatuses = [
      OrderStatus.PENDING,
      // OrderStatus.SCHEDULED,
      OrderStatus.CANCELLED,
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
      const procedure = procedures[i % procedures.length];
      const patientId = patientIds[i % patientIds.length];
      const physicianId = physicianIds[i % physicianIds.length];
      const roomId = roomIds[i % roomIds.length];

      const associatedForm =
        orderForms.length > 0
          ? orderForms.find((form) => form.patientId === patientId) ||
            orderForms[i % orderForms.length]
          : undefined;

      const order = {
        orderNumber: orderCounter,
        patientId,
        orderingPhysicianId: physicianId,
        procedureId: procedure.id,
        imagingOrderFormId: associatedForm?.id,
        modalityId: modality.id,
        bodyPart: bodyParts[i % bodyParts.length],
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

    const imagingOrders = await this.imagingOrderRepository.find({
      take: 10,
      relations: ['imagingOrderForm'],
    });

    if (imagingOrders.length === 0) {
      this.logger.warn(
        '⚠️ No imaging orders found, skipping DICOM study seeding'
      );
      return;
    }

    const modalityMachines = await this.modalityMachineRepository.find({
      where: { status: MachineStatus.ACTIVE },
    });

    if (modalityMachines.length === 0) {
      this.logger.warn(
        '⚠️ No modality machines found, skipping DICOM study seeding'
      );
      return;
    }

    const patientIds = await this.getPatientIdsFromService(20);
    if (patientIds.length === 0) {
      this.logger.warn('⚠️ No patients found, skipping DICOM study seeding');
      return;
    }

    const physicianIds = await this.getPhysicianIdsFromService(10);
    if (physicianIds.length === 0) {
      this.logger.warn('⚠️ No physicians found, skipping DICOM study seeding');
      return;
    }

    const technicianIds = await this.getTechnicianIdsFromService(10);
    const radiologistIds = await this.getRadiologistIdsFromService(5);

    const effectiveTechnicianIds =
      technicianIds.length > 0 ? technicianIds : physicianIds;
    if (technicianIds.length === 0) {
      this.logger.warn(
        '⚠️ No technicians found, using physicians as fallback for performing technician'
      );
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
      DicomStudyStatus.TECHNICIAN_VERIFIED,
      DicomStudyStatus.SCANNED,
      DicomStudyStatus.READING,
      DicomStudyStatus.PENDING_APPROVAL,
      DicomStudyStatus.APPROVED,
      DicomStudyStatus.RESULT_PRINTED,
    ];

    const studiesToCreate = Math.min(
      30,
      Math.max(patientIds.length, modalityMachines.length * 2)
    );

    let createdCount = 0;

    for (let i = 0; i < studiesToCreate; i++) {
      const order = imagingOrders[i % imagingOrders.length];
      const patientId =
        order?.imagingOrderForm?.patientId ||
        patientIds[i % patientIds.length];
      const patientCode = `MRN-${patientId.slice(0, 8).toUpperCase()}`;
      const physicianId = physicianIds[i % physicianIds.length];
      const technicianId =
        effectiveTechnicianIds[i % effectiveTechnicianIds.length];
      const radiologistId =
        radiologistIds.length > 0
          ? radiologistIds[i % radiologistIds.length]
          : undefined;
      const orderId = order?.id;
      const modalityMachine =
        modalityMachines[i % modalityMachines.length];

      const studyDate = new Date();
      studyDate.setDate(studyDate.getDate() - Math.floor(Math.random() * 30));

      const studyTime = `${String(8 + (i % 10)).padStart(2, '0')}:${String(
        Math.floor(Math.random() * 60)
      ).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(
        2,
        '0'
      )}`;

      const study = {
        studyInstanceUid: `1.2.840.113619.${Date.now()}.${i}.${Math.random()
          .toString(36)
          .slice(2, 10)}`,
        patientId,
        patientCode,
        orderId,
        modalityMachineId: modalityMachine.id,
        studyDate,
        studyTime,
        studyDescription: studyDescriptions[i % studyDescriptions.length],
        referringPhysicianId: physicianId,
        performingTechnicianId: technicianId,
        verifyingRadiologistId: radiologistId,
        studyStatus: statuses[i % statuses.length],
        numberOfSeries: 0,
        storagePath: `/dicom/studies/${studyDate.getFullYear()}/${String(
          studyDate.getMonth() + 1
        ).padStart(2, '0')}/${studyDate.getDate()}/${patientId}`,
      };

      const existing = await this.dicomStudyRepository.findOne({
        where: { studyInstanceUid: study.studyInstanceUid },
      });

      if (existing) {
        this.logger.log(
          `⚠️ DICOM study already exists: ${study.studyInstanceUid}`
        );
        continue;
      }

      const newStudy = this.dicomStudyRepository.create(study as any);
      await this.dicomStudyRepository.save(newStudy);
      createdCount++;
      this.logger.log(`✅ Created DICOM study: ${study.studyDescription}`);
    }

    if (createdCount === 0) {
      this.logger.log('ℹ️ No new DICOM studies were created.');
    } else {
      this.logger.log(`✅ Created ${createdCount} DICOM studies in total`);
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

    const bodyParts = ['Đầu', 'Ngực', 'Bụng', 'Chân', 'Tay', 'Cột sống'];

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

    // Common DICOM SOP Class UIDs
    const sopClassUIDs = [
      '1.2.840.10008.5.1.4.1.1.2', // CT Image Storage
      '1.2.840.10008.5.1.4.1.1.4', // MR Image Storage
      '1.2.840.10008.5.1.4.1.1.1', // CR Image Storage
      '1.2.840.10008.5.1.4.1.1.1.1', // Digital X-Ray Image Storage
      '1.2.840.10008.5.1.4.1.1.6.1', // Ultrasound Image Storage
      '1.2.840.10008.5.1.4.1.1.12.1', // X-Ray Angiographic Image Storage
      '1.2.840.10008.5.1.4.1.1.20', // Nuclear Medicine Image Storage
      '1.2.840.10008.5.1.4.1.1.128', // Positron Emission Tomography Image Storage
    ];

    let totalInstancesCreated = 0;

    // Create 5-15 instances for each series
    for (const singleSeries of series) {
      const numInstances = Math.floor(Math.random() * 11) + 5; // 5-15 instances

      for (let i = 0; i < numInstances; i++) {
        const instance = {
          sopInstanceUid: `${singleSeries.seriesInstanceUid}.${
            i + 1
          }.${Math.random().toString(36).substr(2, 9)}`,
          sopClassUID:
            sopClassUIDs[Math.floor(Math.random() * sopClassUIDs.length)],
          seriesId: singleSeries.id,
          instanceNumber: i + 1,
          filePath: `/dicom/instances/${singleSeries.id}`,
          fileName: `IM${String(i + 1).padStart(4, '0')}.dcm`,
          numberOfFrame: 1,
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

    this.logger.log(
      `📊 Found ${annotatorIds.length} annotators (${technicianIds.length} technicians + ${physicianIds.length} physicians)`
    );

    const annotationTypes = [
      AnnotationType.LENGTH,
      AnnotationType.HEIGHT,
      AnnotationType.ANGLE,
      AnnotationType.CIRCLE_ROI,
      AnnotationType.RECTANGLE_ROI,
      AnnotationType.ELLIPTICAL_ROI,
      AnnotationType.BIDIRECTIONAL,
      AnnotationType.ARROW_ANNOTATE,
      AnnotationType.LABEL,
      AnnotationType.PROBE,
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
            annotationType === AnnotationType.LENGTH || annotationType === AnnotationType.HEIGHT
              ? { type: 'length', points: 2 }
              : annotationType === AnnotationType.ANGLE || annotationType === AnnotationType.COBB_ANGLE
              ? { type: 'angle', points: 3 }
              : annotationType === AnnotationType.CIRCLE_ROI || annotationType === AnnotationType.ELLIPTICAL_ROI
              ? { radius: Math.random() * 50 + 10 }
              : annotationType === AnnotationType.RECTANGLE_ROI
              ? { width: Math.random() * 100, height: Math.random() * 100 }
              : annotationType === AnnotationType.BIDIRECTIONAL
              ? { type: 'bidirectional', points: 2 }
              : { content: 'Annotation data' },
          coordinates:
            annotationType === AnnotationType.LENGTH || annotationType === AnnotationType.HEIGHT || annotationType === AnnotationType.BIDIRECTIONAL
              ? {
                  start: { x: Math.random() * 512, y: Math.random() * 512 },
                  end: { x: Math.random() * 512, y: Math.random() * 512 },
                }
              : annotationType === AnnotationType.ANGLE || annotationType === AnnotationType.COBB_ANGLE
              ? {
                  point1: { x: Math.random() * 512, y: Math.random() * 512 },
                  point2: { x: Math.random() * 512, y: Math.random() * 512 },
                  point3: { x: Math.random() * 512, y: Math.random() * 512 },
                }
              : annotationType === AnnotationType.CIRCLE_ROI || annotationType === AnnotationType.ELLIPTICAL_ROI
              ? { center: { x: Math.random() * 512, y: Math.random() * 512 } }
              : {
                  topLeft: { x: Math.random() * 512, y: Math.random() * 512 },
                },
          measurementValue:
            annotationType === AnnotationType.LENGTH || annotationType === AnnotationType.HEIGHT || annotationType === AnnotationType.BIDIRECTIONAL
              ? parseFloat((Math.random() * 50 + 5).toFixed(2))
              : annotationType === AnnotationType.ANGLE || annotationType === AnnotationType.COBB_ANGLE
              ? parseFloat((Math.random() * 180).toFixed(2))
              : undefined,
          measurementUnit:
            annotationType === AnnotationType.LENGTH || annotationType === AnnotationType.HEIGHT || annotationType === AnnotationType.BIDIRECTIONAL
              ? measurementUnits[0] // mm or cm
              : annotationType === AnnotationType.ANGLE || annotationType === AnnotationType.COBB_ANGLE
              ? measurementUnits[3] // degree
              : undefined,
          textContent:
            annotationType === AnnotationType.LABEL || annotationType === AnnotationType.ARROW_ANNOTATE
              ? textContents[annotationCounter % textContents.length]
              : undefined,
          colorCode: colors[annotationCounter % colors.length],
          annotationStatus:
            annotationStatuses[annotationCounter % annotationStatuses.length],
          annotatorId: annotatorIds[annotationCounter % annotatorIds.length],
          annotationDate: new Date(),
          reviewDate:
            annotationStatuses[
              annotationCounter % annotationStatuses.length
            ] === AnnotationStatus.REVIEWED
              ? new Date()
              : undefined,
          notes: `Annotation ${annotationCounter + 1} for instance ${
            instance.instanceNumber
          }`,
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
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();

      try {
        // Use TRUNCATE CASCADE to delete all data and handle foreign keys automatically
        await queryRunner.query('TRUNCATE TABLE "image_annotations" CASCADE');
        await queryRunner.query('TRUNCATE TABLE "dicom_instances" CASCADE');
        await queryRunner.query('TRUNCATE TABLE "dicom_series" CASCADE');
        await queryRunner.query('TRUNCATE TABLE "dicom_studies" CASCADE');
        await queryRunner.query('TRUNCATE TABLE "imaging_orders" CASCADE');
        await queryRunner.query('TRUNCATE TABLE "imaging_order_forms" CASCADE');
        await queryRunner.query('TRUNCATE TABLE "request_procedure" CASCADE');
        await queryRunner.query('TRUNCATE TABLE "modality_machines" CASCADE');
        await queryRunner.query('TRUNCATE TABLE "body_part" CASCADE');
        await queryRunner.query('TRUNCATE TABLE "imaging_modalities" CASCADE');

        this.logger.log('✅ All Imaging Service data cleared successfully!');
      } finally {
        await queryRunner.release();
      }
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
