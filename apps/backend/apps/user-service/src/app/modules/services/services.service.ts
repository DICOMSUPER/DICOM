import {
  PaginatedResponseDto,
  RepositoryPaginationDto,
} from '@backend/database';
import {
  CreateServiceDto,
  Services,
  UpdateServiceDto,
} from '@backend/shared-domain';
import { ThrowMicroserviceException } from '@backend/shared-utils';
import { HttpStatus, Inject, Injectable } from '@nestjs/common';

import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager, Not } from 'typeorm';
import { ServicesRepository } from './services.repository';

@Injectable()
export class ServicesService {
  constructor(
    @Inject()
    private readonly servicesRepository: ServicesRepository,
    @InjectEntityManager() private readonly entityManager: EntityManager
  ) {}
  create = async (createServiceDto: CreateServiceDto): Promise<Services> => {
    return await this.entityManager.transaction(async (em) => {
      const existingService = await this.servicesRepository.findOne(
        {
          where: { serviceCode: createServiceDto.serviceCode },
        },
        [],
        em
      );

      if (existingService) {
        throw ThrowMicroserviceException(
          HttpStatus.CONFLICT,
          'Service with the same code already exists',
          'UserService'
        );
      }

      return await this.servicesRepository.create(createServiceDto, em);
    });
  };

  findAll = async (): Promise<Services[]> => {
    return await this.servicesRepository.findAll();
  };

  findOne = async (id: string): Promise<Services | null> => {
    const service = await this.servicesRepository.findOne({
      where: { id },
    });

    if (!service) {
      throw ThrowMicroserviceException(
        HttpStatus.NOT_FOUND,
        'Service not found',
        'UserService'
      );
    }

    return service;
  };

  update = async (
    id: string,
    updateServiceDto: UpdateServiceDto
  ): Promise<Services | null> => {
    return await this.entityManager.transaction(async (em) => {
      const service = await this.servicesRepository.findOne({
        where: { id },
      });

      if (!service) {
        throw ThrowMicroserviceException(
          HttpStatus.NOT_FOUND,
          'Service not found',
          'UserService'
        );
      }

      // ✅ Kiểm tra serviceCode nếu có thay đổi
      if (
        updateServiceDto.serviceCode &&
        updateServiceDto.serviceCode !== service.serviceCode
      ) {
        const existingByCode = await this.servicesRepository.findOne(
          {
            where: {
              serviceCode: updateServiceDto.serviceCode,
              id: Not(id), // Loại trừ bản ghi hiện tại
            },
          },
          [],
          em
        );

        if (existingByCode) {
          throw ThrowMicroserviceException(
            HttpStatus.CONFLICT,
            'Service with the same code already exists',
            'UserService'
          );
        }
      }

      if (
        updateServiceDto.serviceName &&
        updateServiceDto.serviceName !== service.serviceName
      ) {
        const existingByName = await this.servicesRepository.findOne(
          {
            where: {
              serviceName: updateServiceDto.serviceName,
              id: Not(id),
            },
          },
          [],
          em
        );

        if (existingByName) {
          throw ThrowMicroserviceException(
            HttpStatus.CONFLICT,
            'Service with the same name already exists',
            'UserService'
          );
        }
      }

      return await this.servicesRepository.update(id, updateServiceDto, em);
    });
  };
  remove = async (id: string): Promise<boolean> => {
    return await this.entityManager.transaction(async (em) => {
      const service = await this.servicesRepository.findOne({
        where: { id },
      });

      if (!service) {
        throw ThrowMicroserviceException(
          HttpStatus.NOT_FOUND,
          'Service not found',
          'UserService'
        );
      }

      return await this.servicesRepository.softDelete(id, 'isDeleted');
    });
  };

  findMany = async (
    paginationDto: RepositoryPaginationDto
  ): Promise<PaginatedResponseDto<Services>> => {
    return await this.servicesRepository.paginate(paginationDto);
  };

  getAllServiceProvidedByADepartment = async (
    departmentId: string
  ): Promise<Services[]> => {
    return await this.servicesRepository.getAllServiceProvidedByADepartment(
      departmentId
    );
  };
}
