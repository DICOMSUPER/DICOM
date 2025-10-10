import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { CreatePatientEncounterDto } from './dto/create-patient-encounter.dto';
import { UpdatePatientEncounterDto } from './dto/update-patient-encounter.dto';
import { PatientEncounterRepository, EncounterWithDetails, PatientEncounter } from '@backend/shared-domain';
import {
  PaginatedResponseDto,
  RepositoryPaginationDto,
} from '@backend/database';
import { ThrowMicroserviceException } from '@backend/shared-utils';
import { PATIENT_SERVICE } from '../../../constant/microservice.constant';

@Injectable()
export class PatientEncounterService {
  constructor(
    @Inject() private readonly encounterRepository: PatientEncounterRepository
  ) {}

  create = async (
    createPatientEncounterDto: CreatePatientEncounterDto
  ): Promise<PatientEncounter> => {
    return await this.encounterRepository.create(createPatientEncounterDto);
  };

  findAll = async (): Promise<PatientEncounter[]> => {
    return await this.encounterRepository.findAll({ where: {} });
  };

  findOne = async (id: string): Promise<PatientEncounter | null> => {
    const encounter = await this.encounterRepository.findById(id);
    if (!encounter) {
      throw ThrowMicroserviceException(
        HttpStatus.NOT_FOUND,
        'Failed to find patient encounter',
        PATIENT_SERVICE
      );
    }
    return encounter;
  };

  findMany = async (
    paginationDto: RepositoryPaginationDto
  ): Promise<PaginatedResponseDto<PatientEncounter>> => {
    return await this.encounterRepository.paginate(paginationDto);
  };



  update = async (
    id: string,
    updatePatientEncounterDto: UpdatePatientEncounterDto
  ): Promise<PatientEncounter | null> => {
    const encounter = await this.findOne(id);
    return await this.encounterRepository.update(id, updatePatientEncounterDto);
  };

  remove = async (id: string): Promise<boolean> => {
    await this.findOne(id);
    return await this.encounterRepository.softDelete(id, 'isDeleted');
  };

  getEncounterStats = async (): Promise<any> => {
    return await this.encounterRepository.getEncounterStats();
  };


}
