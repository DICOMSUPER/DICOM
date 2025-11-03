import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import {
  CreateModalityMachineDto,
  ModalityMachine,
  UpdateModalityMachineDto,
  ImagingModality,
} from '@backend/shared-domain';
import { ModalityMachinesRepository } from './modality-machines.repository';
import { ImagingModalityRepository } from '../imaging-modalities/imaging-modalities.repository';
import {
  PaginatedResponseDto,
  RepositoryPaginationDto,
} from '@backend/database';
import { ThrowMicroserviceException } from '@backend/shared-utils';
import { IMAGING_SERVICE } from '../../../constant/microservice.constant';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';

const relations = ['modality'];

@Injectable()
export class ModalityMachinesService {
  constructor(
    @Inject()
    private readonly modalityMachinesRepository: ModalityMachinesRepository,
    @Inject()
    private readonly imagingModalityRepository: ImagingModalityRepository,
    @InjectEntityManager() private readonly entityManager: EntityManager
  ) {}

  private checkModalityMachine = async (
    id: string,
    em?: EntityManager
  ): Promise<ModalityMachine> => {
    const modalityMachine = await this.modalityMachinesRepository.findOne(
      {
        where: { id, isDeleted: false },
      },
      relations
    );

    if (!modalityMachine) {
      throw ThrowMicroserviceException(
        HttpStatus.NOT_FOUND,
        'Modality machine not found',
        IMAGING_SERVICE
      );
    }

    return modalityMachine;
  };

  private checkImagingModality = async (
    id: string,
    em?: EntityManager
  ): Promise<ImagingModality> => {
    const imagingModality = await this.imagingModalityRepository.findOne({
      where: { id, isDeleted: false },
    });

    if (!imagingModality) {
      throw ThrowMicroserviceException(
        HttpStatus.BAD_REQUEST,
        'Failed to process modality machine: Modality not found',
        IMAGING_SERVICE
      );
    }

    if (imagingModality?.isActive === false) {
      throw ThrowMicroserviceException(
        HttpStatus.BAD_REQUEST,
        'Failed to process modality machine: Modality not available',
        IMAGING_SERVICE
      );
    }

    return imagingModality;
  };

  create = async (
    createModalityMachineDto: CreateModalityMachineDto
  ): Promise<ModalityMachine> => {
    return await this.entityManager.transaction(async (em) => {
      // Check imaging modality
      return await this.entityManager.transaction(async (em) => {
        await this.checkImagingModality(
          createModalityMachineDto.modalityId,
          em
        );

        return await this.modalityMachinesRepository.create(
          createModalityMachineDto,
          em
        );
      });
    });
  };

  findAll = async (modalityId?: string): Promise<ModalityMachine[]> => {
    const query = modalityId
      ? {
          where: { modalityId: modalityId, isDeleted: false },
          relations: relations,
        }
      : { relations };

    return await this.modalityMachinesRepository.findAll(query);
  };

  findOne = async (id: string): Promise<ModalityMachine | null> => {
    await this.checkModalityMachine(id);

    return await this.modalityMachinesRepository.findOne(
      {
        where: { id, isDeleted: false },
      },
      relations
    );
  };

  findByRoomId = async (roomId: string): Promise<ImagingModality[]> => {
    const machines = await this.modalityMachinesRepository.findAll({
      where: { roomId },
    });
    const uniqueModalities = Array.from(
      new Map(machines.map((m) => [m.modality.id, m.modality])).values()
    );
    return uniqueModalities;
  };

  update = async (
    id: string,
    updateModalityMachineDto: UpdateModalityMachineDto
  ): Promise<ModalityMachine | null> => {
    return await this.entityManager.transaction(async (em) => {
      await this.checkModalityMachine(id);

      // Check imaging modality if provided
      if (updateModalityMachineDto?.modalityId) {
        await this.checkImagingModality(
          updateModalityMachineDto.modalityId as string
        );
      }

      return await this.modalityMachinesRepository.update(
        id,
        updateModalityMachineDto
      );
    });
  };

  remove = async (id: string): Promise<boolean> => {
    return await this.entityManager.transaction(async (em) => {
      await this.checkModalityMachine(id);

      return await this.modalityMachinesRepository.softDelete(id, 'isDeleted');
    });
  };

  findMany = async (
    paginationDto: RepositoryPaginationDto
  ): Promise<PaginatedResponseDto<ModalityMachine>> => {
    return await this.modalityMachinesRepository.paginate(paginationDto, {
      relations,
    });
  };
}
