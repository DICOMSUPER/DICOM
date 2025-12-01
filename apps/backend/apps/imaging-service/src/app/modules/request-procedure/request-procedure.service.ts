import {
  PaginatedResponseDto,
  RepositoryPaginationDto,
} from '@backend/database';
import {
  CreateRequestProcedureDto,
  RequestProcedure,
  UpdateRequestProcedureDto,
} from '@backend/shared-domain';
import { ThrowMicroserviceException } from '@backend/shared-utils';
import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { IMAGING_SERVICE } from '../../../constant/microservice.constant';
import { RequestProcedureRepository } from './request-procedure.repository';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { ImagingOrder } from '@backend/shared-domain';
import {
  RequestProcedureDeletionFailedException,
  RequestProcedureNotFoundException,
} from '@backend/shared-exception';

@Injectable()
export class RequestProcedureService {
  constructor(
    @Inject()
    private readonly requestProcedureRepository: RequestProcedureRepository,
    @InjectEntityManager() private readonly entityManager: EntityManager
  ) // @InjectRepository(ImagingOrder) private readonly imagingOrderRepository: Repository<ImagingOrder>,
  {}
  create = async (
    createRequestProcedureDto: CreateRequestProcedureDto
  ): Promise<RequestProcedure> => {
    return await this.entityManager.transaction(async (em) => {
      // check for existing procedure with the same name
      const existingProcedure = await this.requestProcedureRepository.findOne({
        where: { name: createRequestProcedureDto.name },
      });

      if (existingProcedure) {
        throw ThrowMicroserviceException(
          HttpStatus.CONFLICT,
          'Procedure with the same name already exists',
          IMAGING_SERVICE
        );
      }
      return await this.requestProcedureRepository.create({
        ...createRequestProcedureDto,
        // isActive: true,
      });
    });
  };

  findAll = async (data: {
    bodyPartId?: string;
    modalityId?: string;
  }): Promise<RequestProcedure[]> => {
    return await this.requestProcedureRepository.findAll({
      where: {
        ...(data.bodyPartId && { bodyPartId: data.bodyPartId }),
        ...(data.modalityId && { modalityId: data.modalityId }),
      },
    });
  };

  findOne = async (id: string): Promise<RequestProcedure | null> => {
    const procedure = await this.requestProcedureRepository.findOne({
      where: { id },
    });

    if (!procedure) {
      throw ThrowMicroserviceException(
        HttpStatus.NOT_FOUND,
        'Procedure not found',
        IMAGING_SERVICE
      );
    }

    return procedure;
  };

  update = async (
    id: string,
    updateRequestProcedureDto: UpdateRequestProcedureDto
  ): Promise<RequestProcedure | null> => {
    return await this.entityManager.transaction(async (em) => {
      const procedure = await this.requestProcedureRepository.findOne({
        where: { id },
      });

      if (!procedure) {
        throw ThrowMicroserviceException(
          HttpStatus.NOT_FOUND,
          'Procedure not found',
          IMAGING_SERVICE
        );
      }
      const existingProcedure = await this.requestProcedureRepository.findOne({
        where: { name: updateRequestProcedureDto.name },
      });

      if (existingProcedure) {
        throw ThrowMicroserviceException(
          HttpStatus.CONFLICT,
          'Procedure with the same name already exists',
          IMAGING_SERVICE
        );
      }

      return await this.requestProcedureRepository.update(
        id,
        updateRequestProcedureDto
      );
    });
  };

  remove = async (id: string): Promise<boolean> => {
    return await this.entityManager.transaction(async (em) => {
      const procedure = await this.requestProcedureRepository.findOne({
        where: { id },
      });

      if (!procedure) {
        throw new RequestProcedureNotFoundException(id);
      }

      const imagingOrderRepo = em.getRepository(ImagingOrder);
      const existsInOrder = await imagingOrderRepo.find({
        where: { procedure: { id } },
      });
      if (existsInOrder) {
        throw new RequestProcedureDeletionFailedException(
          id,
          'Procedure is referenced in existing imaging orders'
        );
      }

      return await this.requestProcedureRepository.softDelete(id, 'isDeleted');
    });
  };

  findMany = async (
    paginationDto: RepositoryPaginationDto
  ): Promise<PaginatedResponseDto<RequestProcedure>> => {
    return await this.requestProcedureRepository.paginate({
      ...paginationDto,
      relation: ['bodyPart', 'modality'],
    });
  };
}
