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
import { ServiceRoomsService } from '../service-rooms/service-rooms.service';

@Injectable()
export class ServicesService {
  constructor(
    @Inject()
    private readonly servicesRepository: ServicesRepository,
    @InjectEntityManager() private readonly entityManager: EntityManager,
    private readonly serviceRoomsService: ServiceRoomsService,
  ) {}

  private async generateUniqueServiceCode(
    em: EntityManager,
    prefix = 'SVC',
    maxAttempts = 5
  ): Promise<string> {
    const generate = () =>
      `${prefix}-${new Date()
        .toISOString()
        .slice(0, 10)
        .replace(/-/g, '')}-${Math.random()
        .toString(36)
        .slice(2, 6)
        .toUpperCase()}`;

    for (let i = 0; i < maxAttempts; i++) {
      const candidate = generate();
      const existing = await this.servicesRepository.findOne(
        { where: { serviceCode: candidate } },
        [],
        em
      );
      if (!existing) return candidate;
    }

    return `${prefix}-${Date.now()}`;
  }

  create = async (createServiceDto: CreateServiceDto): Promise<Services> => {
    return await this.entityManager.transaction(async (em) => {
      if (!createServiceDto.serviceCode) {
        createServiceDto.serviceCode = await this.generateUniqueServiceCode(em);
      }
      const existingService = await this.servicesRepository.findOne(
        {
          where: { 
            serviceCode: createServiceDto.serviceCode,
            isDeleted: false,
          },
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

      const existingByName = await this.servicesRepository.findOne(
        {
          where: { 
            serviceName: createServiceDto.serviceName,
            isDeleted: false,
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

      const existingByNameAndCode = await this.servicesRepository.findOne(
        {
          where: {
            serviceName: createServiceDto.serviceName,
            serviceCode: createServiceDto.serviceCode,
            isDeleted: false,
          },
        },
        [],
        em
      );

      if (existingByNameAndCode) {
        throw ThrowMicroserviceException(
          HttpStatus.CONFLICT,
          'Service with the same name and code already exists',
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
      if (
        updateServiceDto.serviceCode &&
        updateServiceDto.serviceCode !== service.serviceCode
      ) {
        const existingByCode = await this.servicesRepository.findOne(
          {
            where: {
              serviceCode: updateServiceDto.serviceCode,
              id: Not(id), // Exclude the current record
              isDeleted: false,
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
              isDeleted: false,
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
      const assignedRooms = await this.serviceRoomsService.findAllWithoutPagination({
        serviceId: id,
      });
      if (assignedRooms.length > 0) {
        throw ThrowMicroserviceException(
          HttpStatus.CONFLICT,
          'Cannot delete service with assigned rooms',
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
