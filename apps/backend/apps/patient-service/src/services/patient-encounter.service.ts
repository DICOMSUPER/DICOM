import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { PatientEncounter } from '../entities/patient-encounter.entity';
import { CreateEncounterDto, UpdateEncounterDto } from '../dtos/encounter.dto';

@Injectable()
export class PatientEncounterService {
  constructor(
    @InjectRepository(PatientEncounter)
    private encounterRepository: Repository<PatientEncounter>,
  ) {}

  async create(createEncounterDto: CreateEncounterDto): Promise<PatientEncounter> {
    const encounter = this.encounterRepository.create({
      ...createEncounterDto,
      encounterId: uuidv4(),
    });

    return await this.encounterRepository.save(encounter);
  }

  async findAll(): Promise<PatientEncounter[]> {
    return await this.encounterRepository.find({
      where: { isDeleted: false },
      relations: ['patient'],
    });
  }

  async findOne(id: string): Promise<PatientEncounter> {
    const encounter = await this.encounterRepository.findOne({
      where: { encounterId: id, isDeleted: false },
      relations: ['patient'],
    });

    if (!encounter) {
      throw new NotFoundException(`Encounter with ID ${id} not found`);
    }

    return encounter;
  }

  async findByPatient(patientId: string): Promise<PatientEncounter[]> {
    return await this.encounterRepository.find({
      where: { patientId, isDeleted: false },
      order: { encounterDate: 'DESC' },
    });
  }

  async update(id: string, updateEncounterDto: UpdateEncounterDto): Promise<PatientEncounter> {
    const encounter = await this.findOne(id);

    Object.assign(encounter, updateEncounterDto);

    return await this.encounterRepository.save(encounter);
  }

  async remove(id: string): Promise<void> {
    const encounter = await this.findOne(id);
    encounter.isDeleted = true;
    await this.encounterRepository.save(encounter);
  }
}