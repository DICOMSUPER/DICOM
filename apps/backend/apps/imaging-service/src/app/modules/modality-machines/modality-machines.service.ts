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
import { EntityManager, FindOptionsWhere, ILike } from 'typeorm';
import { MachineStatus } from '@backend/shared-enums';

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
      relations,
      em
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
    const imagingModality = await this.imagingModalityRepository.findOne(
      {
        where: { id, isDeleted: false },
      },
      [],
      em
    );

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

      await this.checkImagingModality(createModalityMachineDto.modalityId, em);

      return await this.modalityMachinesRepository.create(
        createModalityMachineDto,
        em
      );
    });
  };

  findAll = async (data: {
    modalityId?: string;
    roomId?: string;
    status?: MachineStatus;
    machineName?: string;
    manufacturer?: string;
    serialNumber?: string;
    model?: string;
  }): Promise<ModalityMachine[]> => {
    let whereClause: FindOptionsWhere<ModalityMachine> = { isDeleted: false };

    if (data.modalityId)
      whereClause = { ...whereClause, modalityId: data.modalityId };

    if (data.roomId) whereClause = { ...whereClause, roomId: data.roomId };

    if (data.status) whereClause = { ...whereClause, status: data.status };

    if (data.machineName)
      whereClause = { ...whereClause, name: ILike(`%${data.machineName}%`) };

    if (data.manufacturer)
      whereClause = {
        ...whereClause,
        manufacturer: ILike(`%${data.manufacturer}%`),
      };

    if (data.serialNumber)
      whereClause = {
        ...whereClause,
        serialNumber: ILike(`%${data.serialNumber}%`),
      };

    if (data.model)
      whereClause = { ...whereClause, model: ILike(`%${data.model}%`) };

    const query = { where: whereClause, relations: relations };

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

  findByRoomId = async (roomId: string): Promise<ModalityMachine[]> => {
    const machines = await this.modalityMachinesRepository.findAll({
      where: { roomId, isDeleted: false },
      relations: ['modality'],
    });
    return machines;
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
