import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { PatientConditionService } from './patient-conditions.service';
import { CreatePatientConditionDto } from './dto/create-patient-condition.dto';
import { UpdatePatientConditionDto } from './dto/update-patient-condition.dto';
import { PatientConditionResponseDto } from './dto/patient-condition-response.dto';

@Controller()
export class PatientConditionController {
  constructor(private readonly patientConditionService: PatientConditionService) {}

  @MessagePattern('patient-condition.create')
  async create(createPatientConditionDto: CreatePatientConditionDto): Promise<PatientConditionResponseDto> {
    return await this.patientConditionService.create(createPatientConditionDto);
  }

  @MessagePattern('patient-condition.findAll')
  async findAll(): Promise<PatientConditionResponseDto[]> {
    return await this.patientConditionService.findAll();
  }

  @MessagePattern('patient-condition.findByPatientId')
  async findByPatientId(patientId: string): Promise<PatientConditionResponseDto[]> {
    return await this.patientConditionService.findByPatientId(patientId);
  }

  @MessagePattern('patient-condition.findOne')
  async findOne(id: string): Promise<PatientConditionResponseDto> {
    return await this.patientConditionService.findOne(id);
  }

  @MessagePattern('patient-condition.update')
  async update(data: { id: string; updatePatientConditionDto: UpdatePatientConditionDto }): Promise<PatientConditionResponseDto> {
    return await this.patientConditionService.update(data.id, data.updatePatientConditionDto);
  }

  @MessagePattern('patient-condition.remove')
  async remove(id: string): Promise<void> {
    return await this.patientConditionService.remove(id);
  }
}
