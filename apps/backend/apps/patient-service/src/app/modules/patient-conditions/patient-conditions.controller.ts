import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { PatientConditionService } from './patient-conditions.service';
import { CreatePatientConditionDto } from './dto/create-patient-condition.dto';
import { UpdatePatientConditionDto } from './dto/update-patient-condition.dto';
import { PatientConditionResponseDto } from './dto/patient-condition-response.dto';

@Controller()
export class PatientConditionController {
  constructor(private readonly patientConditionService: PatientConditionService) {}

  @MessagePattern('PatientService.PatientCondition.Create')
  async create(createPatientConditionDto: CreatePatientConditionDto): Promise<PatientConditionResponseDto> {
    return await this.patientConditionService.create(createPatientConditionDto);
  }

  @MessagePattern('PatientService.PatientCondition.FindAll')
  async findAll(): Promise<PatientConditionResponseDto[]> {
    return await this.patientConditionService.findAll();
  }

  @MessagePattern('PatientService.PatientCondition.FindByPatientId')
  async findByPatientId(data: { patientId: string }): Promise<PatientConditionResponseDto[]> {
    return await this.patientConditionService.findByPatientId(data.patientId);
  }

  @MessagePattern('PatientService.PatientCondition.FindOne')
  async findOne(data: { id: string }): Promise<PatientConditionResponseDto> {
    return await this.patientConditionService.findOne(data.id);
  }

  @MessagePattern('PatientService.PatientCondition.Update')
  async update(data: { id: string; updatePatientConditionDto: UpdatePatientConditionDto }): Promise<PatientConditionResponseDto> {
    return await this.patientConditionService.update(data.id, data.updatePatientConditionDto);
  }

  @MessagePattern('PatientService.PatientCondition.Delete')
  async remove(data: { id: string }): Promise<void> {
    return await this.patientConditionService.remove(data.id);
  }
}
