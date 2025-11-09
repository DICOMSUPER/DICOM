import {
  DiagnosesReport,
  Patient,
  PatientCondition,
  PatientEncounter,
} from '@backend/shared-domain';
import {
  BloodType,
  ClinicalStatus,
  ConditionVerificationStatus,
  DiagnosisStatus,
  DiagnosisType,
  EncounterType,
  Gender,
  Roles,
  Severity
} from '@backend/shared-enums';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { firstValueFrom, timeout } from 'rxjs';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class SeedingService {
  private readonly logger = new Logger(SeedingService.name);

  constructor(
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
    @InjectRepository(PatientCondition)
    private readonly patientConditionRepository: Repository<PatientCondition>,
    @InjectRepository(PatientEncounter)
    private readonly patientEncounterRepository: Repository<PatientEncounter>,
    @InjectRepository(DiagnosesReport)
    private readonly diagnosesReportRepository: Repository<DiagnosesReport>,
    // ✅ Inject microservice client instead of cross-database repositories
    @Inject('USER_SERVICE')
    private readonly userServiceClient: ClientProxy,
    private readonly dataSource: DataSource,
  ) {}

  // ✅ Helper method to get user IDs by role from User Service
  private async getUserIdsByRole(role: Roles, take = 5): Promise<string[]> {
    try {
      const response = await firstValueFrom(
        this.userServiceClient
          .send('UserService.Users.GetIdsByRole', { role, take })
          .pipe(timeout(5000))
      );
      
      if (response.success && response.data) {
        this.logger.log(`📊 Retrieved ${response.count} ${role} IDs from User Service`);
        return response.data;
      }
      
      this.logger.warn(`⚠️ No ${role} IDs returned from User Service`);
      return [];
    } catch (error: any) {
      this.logger.error(`❌ Failed to get ${role} IDs: ${error.message}`);
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
    this.logger.log('🌱 Starting Patient Service database seeding...');

    try {
      await this.seedPatients();
      await this.seedPatientEncounters();
      await this.seedPatientConditions();

      await this.seedDiagnosesReports();

      this.logger.log(
        '✅ Patient Service database seeding completed successfully!'
      );
    } catch (error: any) {
      this.logger.error('❌ Patient Service database seeding failed:', error);
      throw error;
    }
  }

  async seedPatients(): Promise<void> {
    this.logger.log('👥 Seeding patients...');

    // ✅ Get first user ID for createdBy from User Service
    const userIds = await this.getUserIdsByRole(Roles.RECEPTION_STAFF, 1);
    const createdBy = userIds.length > 0 ? userIds[0] : undefined;

    const vietnameseFirstNames = [
      'Văn',
      'Thị',
      'Hoàng',
      'Phương',
      'Minh',
      'Thanh',
      'Hương',
      'Thu',
      'Hải',
      'Lan',
      'Anh',
      'Dũng',
      'Linh',
      'Quân',
      'Ngọc',
    ];

    const vietnameseLastNames = [
      'Nguyễn',
      'Trần',
      'Lê',
      'Phạm',
      'Hoàng',
      'Huỳnh',
      'Phan',
      'Vũ',
      'Võ',
      'Đặng',
      'Bùi',
      'Đỗ',
      'Hồ',
      'Ngô',
      'Dương',
    ];

    const genders = [Gender.MALE, Gender.FEMALE];
    const bloodTypes = [
      BloodType.A_Positive,
      BloodType.A_Negative,
      BloodType.B_Positive,
      BloodType.B_Negative,
      BloodType.AB_Positive,
      BloodType.AB_Negative,
      BloodType.O_Positive,
      BloodType.O_Negative,
    ];

    const addresses = [
      'Quận 1, TP.HCM',
      'Quận 3, TP.HCM',
      'Quận 5, TP.HCM',
      'Quận Tân Bình, TP.HCM',
      'Quận Bình Thạnh, TP.HCM',
      'Quận Phú Nhuận, TP.HCM',
      'Quận Gò Vấp, TP.HCM',
      'Quận 7, TP.HCM',
      'Quận 2, TP.HCM',
      'Quận Thủ Đức, TP.HCM',
    ];

    let patientCounter = 1;

    // Create 30 sample patients
    for (let i = 0; i < 30; i++) {
      const firstName =
        vietnameseFirstNames[i % vietnameseFirstNames.length];
      const lastName = vietnameseLastNames[i % vietnameseLastNames.length];
      const gender = genders[i % genders.length];

      // Generate date of birth (age between 1 and 90 years)
      const age = Math.floor(Math.random() * 89) + 1;
      const dateOfBirth = new Date();
      dateOfBirth.setFullYear(dateOfBirth.getFullYear() - age);
      dateOfBirth.setMonth(Math.floor(Math.random() * 12));
      dateOfBirth.setDate(Math.floor(Math.random() * 28) + 1);

      const patient = {
        patientCode: `BN${String(patientCounter).padStart(6, '0')}`,
        firstName,
        lastName,
        dateOfBirth,
        gender,
        phoneNumber: `09${Math.floor(Math.random() * 100000000)
          .toString()
          .padStart(8, '0')}`,
        address: addresses[i % addresses.length],
        bloodType: i % 3 === 0 ? bloodTypes[i % bloodTypes.length] : undefined,
        insuranceNumber:
          i % 2 === 0 ? `BH${Math.floor(Math.random() * 10000000000)}` : undefined,
        isActive: true,
        createdBy,
      };

      const existing = await this.patientRepository.findOne({
        where: { patientCode: patient.patientCode },
      });

      if (!existing) {
        const newPatient = this.patientRepository.create(patient as any);
        await this.patientRepository.save(newPatient);
        this.logger.log(
          `✅ Created patient: ${patient.lastName} ${patient.firstName} (${patient.patientCode})`
        );
        patientCounter++;
      } else {
        this.logger.log(
          `⚠️ Patient already exists: ${patient.patientCode}`
        );
      }
    }
  }

  async seedPatientEncounters(): Promise<void> {
    this.logger.log('🏥 Seeding patient encounters...');

    const patients = await this.patientRepository.find({
      take: 20,
      order: { createdAt: 'ASC' },
    });

    if (patients.length === 0) {
      this.logger.warn('⚠️ No patients found, skipping encounter seeding');
      return;
    }

    // ✅ Get physician IDs from User Service
    const physicianIds = await this.getUserIdsByRole(Roles.PHYSICIAN, 5);

    if (physicianIds.length === 0) {
      this.logger.warn('⚠️ No physicians found, skipping encounter seeding');
      return;
    }

    const encounterTypes = [
      EncounterType.OUTPATIENT,
      EncounterType.INPATIENT,
      EncounterType.EMERGENCY,
      EncounterType.FOLLOW_UP,
    ];

    const chiefComplaints = [
      'Đau đầu',
      'Sốt cao',
      'Ho khan kéo dài',
      'Đau bụng',
      'Chóng mặt',
      'Mệt mỏi',
      'Khó thở',
      'Đau ngực',
      'Buồn nôn',
      'Tiêu chảy',
    ];

    const symptoms = [
      'Sốt 38-39°C, đau đầu, mệt mỏi',
      'Ho có đờm, sốt nhẹ, khó thở',
      'Đau bụng vùng thượng vị, buồn nôn',
      'Chóng mặt khi đứng lên, mệt mỏi',
      'Đau ngực trái lan ra cánh tay, khó thở',
      'Tiêu chảy nhiều lần, đau bụng quanh rốn',
    ];

    let encounterCounter = 0;

    // Create 2-3 encounters for each patient
    for (const patient of patients) {
      const numEncounters = Math.floor(Math.random() * 2) + 2; // 2-3 encounters

      for (let i = 0; i < numEncounters; i++) {
        const encounterDate = new Date();
        encounterDate.setDate(
          encounterDate.getDate() - Math.floor(Math.random() * 60)
        );

        const encounter = {
          patientId: patient.id,
          encounterDate,
          encounterType: encounterTypes[i % encounterTypes.length],
          chiefComplaint: chiefComplaints[encounterCounter % chiefComplaints.length],
          symptoms: symptoms[encounterCounter % symptoms.length],
          vitalSigns: {
            temperature: (36 + Math.random() * 2.5).toFixed(1),
            heartRate: Math.floor(60 + Math.random() * 40),
            bloodPressure: `${Math.floor(110 + Math.random() * 30)}/${Math.floor(70 + Math.random() * 20)}`,
            respiratoryRate: Math.floor(14 + Math.random() * 8),
            oxygenSaturation: Math.floor(95 + Math.random() * 5),
          },
          assignedPhysicianId: physicianIds[encounterCounter % physicianIds.length],
          notes: i === 0 ? 'Lần khám đầu tiên' : `Tái khám lần ${i + 1}`,
        };

        const newEncounter = this.patientEncounterRepository.create(
          encounter as any
        );
        await this.patientEncounterRepository.save(newEncounter);
        encounterCounter++;
      }

      this.logger.log(
        `✅ Created ${numEncounters} encounters for patient: ${patient.lastName} ${patient.firstName}`
      );
    }

    this.logger.log(`✅ Created ${encounterCounter} encounters in total`);
  }

  async seedPatientConditions(): Promise<void> {
    this.logger.log('🩺 Seeding patient conditions...');

    const patients = await this.patientRepository.find({
      take: 15,
      order: { createdAt: 'ASC' },
    });

    if (patients.length === 0) {
      this.logger.warn('⚠️ No patients found, skipping condition seeding');
      return;
    }

    const conditions = [
      { code: 'I10', display: 'Tăng huyết áp', bodySite: 'Hệ tuần hoàn' },
      { code: 'E11', display: 'Đái tháo đường type 2', bodySite: 'Tuyến tụy' },
      { code: 'J44', display: 'Bệnh phổi tắc nghẽn mạn tính', bodySite: 'Phổi' },
      { code: 'K29', display: 'Viêm dạ dày', bodySite: 'Dạ dày' },
      { code: 'M19', display: 'Thoái hóa khớp', bodySite: 'Khớp' },
      { code: 'J06', display: 'Viêm đường hô hấp trên', bodySite: 'Họng' },
      { code: 'K21', display: 'Trào ngược dạ dày', bodySite: 'Thực quản' },
      { code: 'N18', display: 'Suy thận mạn', bodySite: 'Thận' },
    ];

    const clinicalStatuses = [
      ClinicalStatus.ACTIVE,
      ClinicalStatus.INACTIVE,
      ClinicalStatus.RESOLVED,
      ClinicalStatus.REMISSION,
    ];

    const verificationStatuses = [
      ConditionVerificationStatus.CONFIRMED,
      ConditionVerificationStatus.PROVISIONAL,
      ConditionVerificationStatus.DIFFERENTIAL,
    ];

    const severities = ['Mild', 'Moderate', 'Severe'];

    let conditionCounter = 0;

    // Create 1-3 conditions for each patient
    for (const patient of patients) {
      const numConditions = Math.floor(Math.random() * 3) + 1; // 1-3 conditions

      for (let i = 0; i < numConditions; i++) {
        const condition = conditions[conditionCounter % conditions.length];

        const patientCondition = {
          patientId: patient.id,
          code: condition.code,
          codeSystem: 'ICD-10',
          codeDisplay: condition.display,
          clinicalStatus:
            clinicalStatuses[conditionCounter % clinicalStatuses.length],
          verificationStatus:
            verificationStatuses[conditionCounter % verificationStatuses.length],
          severity: severities[conditionCounter % severities.length],
          stageSummary: i === 0 ? 'Giai đoạn đầu' : 'Theo dõi',
          bodySite: condition.bodySite,
          recordedDate: new Date(),
          notes: `Tình trạng ${condition.display.toLowerCase()} của bệnh nhân`,
        };

        const newCondition = this.patientConditionRepository.create(
          patientCondition as any
        );
        await this.patientConditionRepository.save(newCondition);
        conditionCounter++;
      }

      this.logger.log(
        `✅ Created ${numConditions} conditions for patient: ${patient.patientCode}`
      );
    }

    this.logger.log(`✅ Created ${conditionCounter} conditions in total`);
  }


  async seedDiagnosesReports(): Promise<void> {
    this.logger.log('📝 Seeding diagnoses reports...');

    const encounters = await this.patientEncounterRepository.find({
      take: 15,
      order: { createdAt: 'DESC' },
    });

    if (encounters.length === 0) {
      this.logger.warn('⚠️ No encounters found, skipping diagnoses report seeding');
      return;
    }

    // ✅ Get physician IDs from User Service
    const physicianIds = await this.getUserIdsByRole(Roles.PHYSICIAN, 5);

    if (physicianIds.length === 0) {
      this.logger.warn('⚠️ No physicians found, skipping diagnoses report seeding');
      return;
    }

    // Mock study IDs - in real scenario, these would come from imaging service
    const mockStudyIds = [
      'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
      'cccccccc-cccc-cccc-cccc-cccccccccccc',
    ];

    const diagnoses = [
      { name: 'Viêm phổi', description: 'Viêm phổi do vi khuẩn' },
      { name: 'Viêm dạ dày cấp', description: 'Viêm niêm mạc dạ dày' },
      { name: 'Tăng huyết áp độ 2', description: 'Huyết áp 160/100 mmHg' },
      { name: 'Đái tháo đường type 2', description: 'Đường huyết lúc đói cao' },
      { name: 'Gãy xương cánh tay', description: 'Gãy xương cánh tay phải 1/3 giữa' },
      { name: 'Viêm họng cấp', description: 'Viêm họng do virus' },
      { name: 'Rối loạn lipid máu', description: 'Cholesterol toàn phần cao' },
    ];

    const diagnosisTypes = [
      DiagnosisType.PRIMARY,
      DiagnosisType.SECONDARY,
      DiagnosisType.DIFFERENTIAL,
      DiagnosisType.FINAL,
    ];

    const severities = [Severity.MILD, Severity.MODERATE, Severity.SEVERE];

    let diagnosisCounter = 0;

    // Create 1-2 diagnosis reports for each encounter
    for (const encounter of encounters) {
      const numDiagnoses = Math.floor(Math.random() * 2) + 1; // 1-2 diagnoses

      for (let i = 0; i < numDiagnoses; i++) {
        const diagnosis = diagnoses[diagnosisCounter % diagnoses.length];

        const diagnosisReport = {
          encounterId: encounter.id,
          studyId: mockStudyIds[diagnosisCounter % mockStudyIds.length],
          diagnosisName: diagnosis.name,
          description: diagnosis.description,
          diagnosisType: diagnosisTypes[i],
          diagnosisStatus: DiagnosisStatus.ACTIVE,
          severity: severities[diagnosisCounter % severities.length],
          diagnosisDate: new Date(encounter.encounterDate),
          diagnosedBy: physicianIds[diagnosisCounter % physicianIds.length],
          notes: `Chẩn đoán ${i === 0 ? 'chính' : 'phụ'} cho bệnh nhân`,
        };

        const newDiagnosis = this.diagnosesReportRepository.create(
          diagnosisReport as any
        );
        await this.diagnosesReportRepository.save(newDiagnosis);
        diagnosisCounter++;
      }

      this.logger.log(
        `✅ Created ${numDiagnoses} diagnoses for encounter`
      );
    }

    this.logger.log(`✅ Created ${diagnosisCounter} diagnoses reports in total`);
  }

  async clearAllData(): Promise<void> {
    this.logger.log('🗑️ Clearing all Patient Service data...');

    try {
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      
      try {
        // Use TRUNCATE CASCADE to delete all data and handle foreign keys automatically
        await queryRunner.query('TRUNCATE TABLE "diagnoses_reports" CASCADE');
        await queryRunner.query('TRUNCATE TABLE "queue_assignments" CASCADE');
        await queryRunner.query('TRUNCATE TABLE "patient_conditions" CASCADE');
        await queryRunner.query('TRUNCATE TABLE "patient_encounters" CASCADE');
        await queryRunner.query('TRUNCATE TABLE "patients" CASCADE');
        
        this.logger.log('✅ All Patient Service data cleared successfully!');
      } finally {
        await queryRunner.release();
      }
    } catch (error: any) {
      this.logger.error('❌ Failed to clear Patient Service data:', error);
      throw error;
    }
  }

  async resetAndSeed(): Promise<void> {
    this.logger.log('🔄 Resetting and seeding Patient Service database...');

    try {
      await this.clearAllData();
      await this.runSeeding();

      this.logger.log(
        '✅ Patient Service database reset and seeded successfully!'
      );
    } catch (error: any) {
      this.logger.error(
        '❌ Patient Service database reset and seed failed:',
        error
      );
      throw error;
    }
  }
}

