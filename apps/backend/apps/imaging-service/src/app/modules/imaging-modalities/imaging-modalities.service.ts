import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import {
  CreateImagingModalityDto,
  ImagingModality,
} from '@backend/shared-domain';
import { UpdateImagingModalityDto } from '@backend/shared-domain';
import { ImagingModalityRepository } from './imaging-modalities.repository';
import {
  PaginatedResponseDto,
  RepositoryPaginationDto,
} from '@backend/database';
import { ThrowMicroserviceException } from '@backend/shared-utils';
import { IMAGING_SERVICE } from '../../../constant/microservice.constant';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';

const relations = ['modalityMachines'];
@Injectable()
export class ImagingModalitiesService {
  constructor(
    @Inject()
    private readonly imagingModalityRepository: ImagingModalityRepository,
    @InjectEntityManager() private readonly entityManager: EntityManager
  ) {}
  create = async (
    createImagingModalityDto: CreateImagingModalityDto
  ): Promise<ImagingModality> => {
    return await this.entityManager.transaction(async (em) => {
      if (createImagingModalityDto.modalityCode) {
        const existingByCode = await this.imagingModalityRepository.findOne(
          {
            where: { 
              modalityCode: createImagingModalityDto.modalityCode,
              isDeleted: false,
            },
          },
          [],
          em
        );

        if (existingByCode) {
          throw ThrowMicroserviceException(
            HttpStatus.CONFLICT,
            `Imaging modality with code ${createImagingModalityDto.modalityCode} already exists`,
            IMAGING_SERVICE
          );
        }
      }

      if (createImagingModalityDto.modalityName) {
        const existingByName = await this.imagingModalityRepository.findOne(
          {
            where: { 
              modalityName: createImagingModalityDto.modalityName,
              isDeleted: false,
            },
          },
          [],
          em
        );

        if (existingByName) {
          throw ThrowMicroserviceException(
            HttpStatus.CONFLICT,
            `Imaging modality with name ${createImagingModalityDto.modalityName} already exists`,
            IMAGING_SERVICE
          );
        }
      }

      return await this.imagingModalityRepository.create(
        createImagingModalityDto,
        em
      );
    });
  };

  findAll = async (): Promise<ImagingModality[]> => {
    return await this.imagingModalityRepository.findAll(
      {
        where: { isDeleted: false, isActive: true },
      },
      relations
    );
  };

  findOne = async (id: string): Promise<ImagingModality | null> => {
    const modality = await this.imagingModalityRepository.findOne({
      where: { id },
      relations,
    });

    if (!modality) {
      throw ThrowMicroserviceException(
        HttpStatus.NOT_FOUND,
        'Modality not found',
        IMAGING_SERVICE
      );
    }

    return modality;
  };

  update = async (
    id: string,
    updateImagingModalityDto: UpdateImagingModalityDto
  ): Promise<ImagingModality | null> => {
    return await this.entityManager.transaction(async (em) => {
      const modality = await this.imagingModalityRepository.findOne(
        {
          where: { id },
        },
        [],
        em
      );

      if (!modality) {
        throw ThrowMicroserviceException(
          HttpStatus.NOT_FOUND,
          'Modality not found',
          IMAGING_SERVICE
        );
      }

      if (
        updateImagingModalityDto.modalityCode &&
        updateImagingModalityDto.modalityCode !== modality.modalityCode
      ) {
        const existingByCode = await this.imagingModalityRepository.findOne(
          {
            where: { 
              modalityCode: updateImagingModalityDto.modalityCode,
              isDeleted: false,
            },
          },
          [],
          em
        );

        if (existingByCode && existingByCode.id !== id) {
          throw ThrowMicroserviceException(
            HttpStatus.CONFLICT,
            `Imaging modality with code ${updateImagingModalityDto.modalityCode} already exists`,
            IMAGING_SERVICE
          );
        }
      }

      if (
        updateImagingModalityDto.modalityName &&
        updateImagingModalityDto.modalityName !== modality.modalityName
      ) {
        const existingByName = await this.imagingModalityRepository.findOne(
          {
            where: { 
              modalityName: updateImagingModalityDto.modalityName,
              isDeleted: false,
            },
          },
          [],
          em
        );

        if (existingByName && existingByName.id !== id) {
          throw ThrowMicroserviceException(
            HttpStatus.CONFLICT,
            `Imaging modality with name ${updateImagingModalityDto.modalityName} already exists`,
            IMAGING_SERVICE
          );
        }
      }

      return await this.imagingModalityRepository.update(
        id,
        updateImagingModalityDto,
        em
      );
    });
  };

  remove = async (id: string): Promise<boolean> => {
    return await this.entityManager.transaction(async (em) => {
      const modality = await this.imagingModalityRepository.findOne(
        {
          where: { id },
        },
        [],
        em
      );

      if (!modality) {
        throw ThrowMicroserviceException(
          HttpStatus.NOT_FOUND,
          'Modality not found',
          IMAGING_SERVICE
        );
      }

      return await this.imagingModalityRepository.softDelete(
        id,
        'isDeleted',
        em
      );
    });
  };

  findMany = async (
    paginationDto: RepositoryPaginationDto & { includeInactive?: boolean; includeDeleted?: boolean }
  ): Promise<PaginatedResponseDto<ImagingModality>> => {
    const { includeInactive, includeDeleted, ...restPaginationDto } = paginationDto;
    
    if (includeDeleted || includeInactive) {
      const repository = this.entityManager.getRepository(ImagingModality);
      const page = restPaginationDto.page || 1;
      const limit = restPaginationDto.limit || 10;
      const skip = (page - 1) * limit;
      
      const qb = repository
        .createQueryBuilder('modality')
        .leftJoinAndSelect('modality.modalityMachines', 'modalityMachines')
        .orderBy(`modality.${restPaginationDto.sortField || 'createdAt'}`, (restPaginationDto.order || 'desc').toUpperCase() as 'ASC' | 'DESC')
        .skip(skip)
        .take(limit);
      
      const whereConditions: string[] = [];
      const whereParams: any = {};
      
      if (!includeDeleted) {
        whereConditions.push('modality.isDeleted = :isDeleted');
        whereParams.isDeleted = false;
      }
      
      if (!includeInactive) {
        whereConditions.push('modality.isActive = :isActive');
        whereParams.isActive = true;
      }
      
      if (whereConditions.length > 0) {
        qb.where(whereConditions.join(' AND '), whereParams);
      }
      
      if (restPaginationDto.search && restPaginationDto.searchField) {
        qb.andWhere(`modality.${restPaginationDto.searchField} LIKE :search`, {
          search: `%${restPaginationDto.search}%`,
        });
      }
      
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
    
    return await this.imagingModalityRepository.paginate(restPaginationDto, {
      relations,
    });
  };

  async getStats(): Promise<{
    totalModalities: number;
    activeModalities: number;
    inactiveModalities: number;
  }> {
    try {
      const repository = this.entityManager.getRepository(ImagingModality);
      const [totalModalities, activeModalities, inactiveModalities] = await Promise.all([
        repository.count({ where: { isDeleted: false } }),
        repository.count({ where: { isActive: true, isDeleted: false } }),
        repository.count({ where: { isActive: false, isDeleted: false } }),
      ]);

      return {
        totalModalities,
        activeModalities,
        inactiveModalities,
      };
    } catch (error: any) {
      throw ThrowMicroserviceException(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Lỗi khi lấy thống kê imaging modality',
        IMAGING_SERVICE
      );
    }
  }
}
