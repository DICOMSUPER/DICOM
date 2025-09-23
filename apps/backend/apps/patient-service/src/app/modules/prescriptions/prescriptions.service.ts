import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { UpdatePrescriptionDto } from './dto/update-prescription.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Prescription, PatientEncounter, DiagnosesReport } from '@backend/shared-domain';

@Injectable()
export class PrescriptionService {
  constructor(
    @InjectRepository(Prescription)
    private readonly prescriptionRepository: Repository<Prescription>,
    @InjectRepository(PatientEncounter)
    private readonly encounterRepository: Repository<PatientEncounter>,
    @InjectRepository(DiagnosesReport)
    private readonly diagnosisRepository: Repository<DiagnosesReport>,
  ) {}

  async create(createPrescriptionDto: CreatePrescriptionDto) {
    // Verify encounter exists
    const encounter = await this.encounterRepository.findOne({
      where: { id: createPrescriptionDto.encounterId }
    });
    if (!encounter) {
      throw new NotFoundException(`Encounter with ID ${createPrescriptionDto.encounterId} not found`);
    }

    // Verify diagnosis report exists if provided
    if (createPrescriptionDto.report_id) {
      const diagnosis = await this.diagnosisRepository.findOne({
        where: { id: createPrescriptionDto.report_id }
      });
      if (!diagnosis) {
        throw new NotFoundException(`Diagnosis report with ID ${createPrescriptionDto.report_id} not found`);
      }
    }

    // Generate prescription number
    const prescriptionNumber = await this.generatePrescriptionNumber();

    const prescriptionData = {
      ...createPrescriptionDto,
      prescriptionNumber,
      prescriptionDate: new Date(),
      isDeleted: false,
    };

    const prescription = this.prescriptionRepository.create(prescriptionData);
    return await this.prescriptionRepository.save(prescription);
  }

  async findAll() {
    return await this.prescriptionRepository.find({
      where: { isDeleted: false },
      relations: ['encounter', 'encounter.patient', 'report', 'items'],
      order: { prescriptionDate: 'DESC' }
    });
  }

  async findOne(id: string) {
    const prescription = await this.prescriptionRepository.findOne({
      where: { id, isDeleted: false },
      relations: ['encounter', 'encounter.patient', 'report', 'items']
    });
    if (!prescription) {
      throw new NotFoundException(`Prescription with ID ${id} not found`);
    }
    return prescription;
  }

  async findByEncounter(encounterId: string) {
    return await this.prescriptionRepository.find({
      where: { encounterId, isDeleted: false },
      relations: ['encounter', 'encounter.patient', 'report', 'items'],
      order: { prescriptionDate: 'DESC' }
    });
  }

  async findByPhysician(physicianId: string) {
    return await this.prescriptionRepository.find({
      where: { physicianId, isDeleted: false },
      relations: ['encounter', 'encounter.patient', 'report', 'items'],
      order: { prescriptionDate: 'DESC' }
    });
  }

  async update(id: string, updatePrescriptionDto: UpdatePrescriptionDto) {
    const prescription = await this.findOne(id);
    
    // Verify diagnosis report exists if being updated
    if (updatePrescriptionDto.report_id) {
      const diagnosis = await this.diagnosisRepository.findOne({
        where: { id: updatePrescriptionDto.report_id }
      });
      if (!diagnosis) {
        throw new NotFoundException(`Diagnosis report with ID ${updatePrescriptionDto.report_id} not found`);
      }
    }

    await this.prescriptionRepository.update(id, {
      ...updatePrescriptionDto,
      updatedAt: new Date()
    });

    return await this.findOne(id);
  }

  async remove(id: string) {
    const prescription = await this.findOne(id);
    
    await this.prescriptionRepository.update(id, { 
      isDeleted: true,
      updatedAt: new Date()
    });

    return { message: 'Prescription deleted successfully' };
  }

  async getPrescriptionStats() {
    const total = await this.prescriptionRepository.count({
      where: { isDeleted: false }
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayPrescriptions = await this.prescriptionRepository.count({
      where: {
        prescriptionDate: {
          $gte: today,
          $lt: tomorrow
        } as any,
        isDeleted: false
      }
    });

    return {
      total,
      today: todayPrescriptions
    };
  }

  private async generatePrescriptionNumber(): Promise<string> {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    
    const prefix = `RX${year}${month}${day}`;
    
    // Find the last prescription number for today
    const lastPrescription = await this.prescriptionRepository.findOne({
      where: {
        prescriptionNumber: {
          $regex: `^${prefix}`,
        } as any
      },
      order: { prescriptionNumber: 'DESC' }
    });

    let sequence = 1;
    if (lastPrescription) {
      const lastSequence = parseInt(lastPrescription.prescriptionNumber.replace(prefix, ''));
      sequence = lastSequence + 1;
    }

    return `${prefix}${String(sequence).padStart(4, '0')}`;
  }
}
