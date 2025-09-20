import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { PatientCondition } from '../entities/patient-condition.entity';
import { CreateConditionDto, UpdateConditionDto } from '../dtos/condition.dto';

@Injectable()
export class PatientConditionService {
  constructor(
    @InjectRepository(PatientCondition)
    private conditionRepository: Repository<PatientCondition>,
  ) {}

  async create(createDto: CreateConditionDto): Promise<PatientCondition> {
    const condition = this.conditionRepository.create({
      ...createDto,
      conditionId: uuidv4(),
    });

    return await this.conditionRepository.save(condition);
  }

  async findAll(patientId?: string): Promise<PatientCondition[]> {
    if (patientId) {
      return await this.conditionRepository.find({
        where: { patientId, isDeleted: false },
        order: { recordedDate: 'DESC' },
      });
    }
    return await this.conditionRepository.find({ where: { isDeleted: false } });
  }

  async findOne(id: string): Promise<PatientCondition> {
    const condition = await this.conditionRepository.findOne({
      where: { conditionId: id, isDeleted: false },
    });

    if (!condition) {
      throw new NotFoundException(`Condition with ID ${id} not found`);
    }

    return condition;
  }

  async update(id: string, updateDto: UpdateConditionDto): Promise<PatientCondition> {
    const condition = await this.findOne(id);
    Object.assign(condition, updateDto);
    return await this.conditionRepository.save(condition);
  }

  async remove(id: string): Promise<void> {
    const condition = await this.findOne(id);
    condition.isDeleted = true;
    await this.conditionRepository.save(condition);
  }
}


