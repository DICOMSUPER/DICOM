import {
  PaginatedResponseDto,
  RepositoryPaginationDto,
} from '@backend/database';
import {
  BodyPart,
  CreateBodyPartDto,
  UpdateBodyPartDto,
} from '@backend/shared-domain';
import { ThrowMicroserviceException } from '@backend/shared-utils';
import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { IMAGING_SERVICE } from '../../../constant/microservice.constant';
import { BodyPartRepository } from './body-part.repository';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';

@Injectable()
export class BodyPartService {
  constructor(
    @Inject()
    private readonly bodyPartRepository: BodyPartRepository,
    @InjectEntityManager() private readonly entityManager: EntityManager
  ) {}
  create = async (createBodyPartDto: CreateBodyPartDto): Promise<BodyPart> => {
    return await this.entityManager.transaction(async (em) => {
      const existingBodyPart = await this.bodyPartRepository.findOne(
        {
          where: { name: createBodyPartDto.name },
        },
        [],
        em
      );

      if (existingBodyPart) {
        throw ThrowMicroserviceException(
          HttpStatus.CONFLICT,
          'Body part with the same name already exists',
          IMAGING_SERVICE
        );
      }

      return await this.bodyPartRepository.create(createBodyPartDto, em);
    });
  };

  findAll = async (): Promise<BodyPart[]> => {
    return await this.bodyPartRepository.findAll();
  };

  findOne = async (id: string): Promise<BodyPart | null> => {
    const bodyPart = await this.bodyPartRepository.findOne({
      where: { id },
    });

    if (!bodyPart) {
      throw ThrowMicroserviceException(
        HttpStatus.NOT_FOUND,
        'Body part not found',
        IMAGING_SERVICE
      );
    }

    return bodyPart;
  };

  update = async (
    id: string,
    updateBodyPartDto: UpdateBodyPartDto
  ): Promise<BodyPart | null> => {
    return await this.entityManager.transaction(async (em) => {
      const bodyPart = await this.bodyPartRepository.findOne({
        where: { id },
      });

      if (!bodyPart) {
        throw ThrowMicroserviceException(
          HttpStatus.NOT_FOUND,
          'Body part not found',
          IMAGING_SERVICE
        );
      }
      const existingBodyPart = await this.bodyPartRepository.findOne({
        where: { name: updateBodyPartDto.name },
      });

      if (existingBodyPart) {
        throw ThrowMicroserviceException(
          HttpStatus.CONFLICT,
          'Body part with the same name already exists',
          IMAGING_SERVICE
        );
      }

      return await this.bodyPartRepository.update(id, updateBodyPartDto);
    });
  };

  remove = async (id: string): Promise<boolean> => {
    return await this.entityManager.transaction(async (em) => {
      const bodyPart = await this.bodyPartRepository.findOne({
        where: { id },
      });

      if (!bodyPart) {
        throw ThrowMicroserviceException(
          HttpStatus.NOT_FOUND,
          'Body part not found',
          IMAGING_SERVICE
        );
      }

      // Check if body part is referenced in request procedures
      const requestProcedureRepo = em.getRepository('RequestProcedure');
      const referencedInProcedures = await requestProcedureRepo.count({
        where: { bodyPartId: id, isDeleted: false },
      });

      if (referencedInProcedures > 0) {
        throw ThrowMicroserviceException(
          HttpStatus.CONFLICT,
          'Cannot delete body part that is referenced in existing request procedures',
          IMAGING_SERVICE
        );
      }

      return await this.bodyPartRepository.softDelete(id, 'isDeleted');
    });
  };

  findMany = async (
    paginationDto: RepositoryPaginationDto
  ): Promise<PaginatedResponseDto<BodyPart>> => {
    return await this.bodyPartRepository.paginate(paginationDto);
  };
}
