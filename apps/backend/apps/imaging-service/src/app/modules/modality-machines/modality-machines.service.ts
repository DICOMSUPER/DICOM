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
    page?: number;
    limit?: number;
    sortBy?: string;
    order?: 'asc' | 'desc';
  }): Promise<PaginatedResponseDto<ModalityMachine>> => {
    const page = data.page || 1;
    const limit = data.limit || 10;
    const skip = (page - 1) * limit;

    const repository = this.entityManager.getRepository(ModalityMachine);
    const qb = repository
      .createQueryBuilder('machine')
      .leftJoinAndSelect('machine.modality', 'modality')
      .where('machine.isDeleted = :isDeleted', { isDeleted: false });

    if (data.modalityId) {
      qb.andWhere('machine.modalityId = :modalityId', {
        modalityId: data.modalityId,
      });
    }

    if (data.roomId) {
      qb.andWhere('machine.roomId = :roomId', { roomId: data.roomId });
    }

    if (data.status) {
      qb.andWhere('machine.status = :status', { status: data.status });
    }

    if (data.machineName) {
      qb.andWhere('machine.name ILIKE :machineName', {
        machineName: `%${data.machineName}%`,
      });
    }

    if (data.manufacturer) {
      qb.andWhere('machine.manufacturer ILIKE :manufacturer', {
        manufacturer: `%${data.manufacturer}%`,
      });
    }

    if (data.serialNumber) {
      qb.andWhere('machine.serialNumber ILIKE :serialNumber', {
        serialNumber: `%${data.serialNumber}%`,
      });
    }

    if (data.model) {
      qb.andWhere('machine.model ILIKE :model', {
        model: `%${data.model}%`,
      });
    }

    if (data.sortBy && data.order) {
      const sortField = data.sortBy === 'name' ? 'name' :
                       data.sortBy === 'createdAt' ? 'createdAt' :
                       data.sortBy === 'updatedAt' ? 'updatedAt' : 'createdAt';
      qb.orderBy(`machine.${sortField}`, data.order.toUpperCase() as 'ASC' | 'DESC');
    } else {
      qb.orderBy('machine.createdAt', 'DESC');
    }

    qb.skip(skip).take(limit);

    const [dataResult, total] = await qb.getManyAndCount();

    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    return new PaginatedResponseDto<ModalityMachine>(
      dataResult,
      total,
      page,
      limit,
      totalPages,
      hasNextPage,
      hasPreviousPage
    );
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
    paginationDto: RepositoryPaginationDto & { includeDeleted?: boolean; modalityId?: string; status?: MachineStatus }
  ): Promise<PaginatedResponseDto<ModalityMachine>> => {
    const { includeDeleted, modalityId, status, ...restPaginationDto } = paginationDto;
    
    if (includeDeleted !== undefined || modalityId || status) {
      const repository = this.entityManager.getRepository(ModalityMachine);
      const page = restPaginationDto.page || 1;
      const limit = restPaginationDto.limit || 10;
      const skip = (page - 1) * limit;
      
      const qb = repository
        .createQueryBuilder('machine')
        .leftJoinAndSelect('machine.modality', 'modality');
      
      const whereConditions: string[] = [];
      const whereParams: any = {};
      
      if (includeDeleted !== true) {
        whereConditions.push('machine.isDeleted = :isDeleted');
        whereParams.isDeleted = false;
      }
      
      if (modalityId) {
        whereConditions.push('machine.modalityId = :modalityId');
        whereParams.modalityId = modalityId;
      }
      
      if (status) {
        whereConditions.push('machine.status = :status');
        whereParams.status = status;
      }
      
      if (whereConditions.length > 0) {
        qb.where(whereConditions.join(' AND '), whereParams);
      }
      
      if (restPaginationDto.search && restPaginationDto.searchField) {
        qb.andWhere(
          `unaccent(LOWER(machine.${restPaginationDto.searchField})) ILIKE unaccent(LOWER(:search))`,
          { search: `%${restPaginationDto.search}%` }
        );
      }
      
      qb.orderBy(`machine.${restPaginationDto.sortField || 'createdAt'}`, (restPaginationDto.order || 'desc').toUpperCase() as 'ASC' | 'DESC')
        .skip(skip)
        .take(limit);
      
      const [data, total] = await qb.getManyAndCount();
      const totalPages = Math.ceil(total / limit);
      
      return new PaginatedResponseDto(
        data,
        total,
        page,
        limit,
        totalPages,
        page < totalPages,
        page > 1
      );
    }
    
    return await this.modalityMachinesRepository.paginate(restPaginationDto, {
      relations,
    });
  };

  async getStats(roomId?: string): Promise<{
    totalMachines: number;
    activeMachines: number;
    inactiveMachines: number;
    maintenanceMachines: number;
  }> {
    try {
      const repository = this.entityManager.getRepository(ModalityMachine);
      const baseWhere: any = { isDeleted: false };
      if (roomId) {
        baseWhere.roomId = roomId;
      }

      const [totalMachines, activeMachines, inactiveMachines, maintenanceMachines] = await Promise.all([
        repository.count({ where: baseWhere }),
        repository.count({ where: { ...baseWhere, status: MachineStatus.ACTIVE } }),
        repository.count({ where: { ...baseWhere, status: MachineStatus.INACTIVE } }),
        repository.count({ where: { ...baseWhere, status: MachineStatus.MAINTENANCE } }),
      ]);

      return {
        totalMachines,
        activeMachines,
        inactiveMachines,
        maintenanceMachines,
      };
    } catch (error: any) {
      throw ThrowMicroserviceException(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Lỗi khi lấy thống kê máy móc',
        IMAGING_SERVICE
      );
    }
  }
}
