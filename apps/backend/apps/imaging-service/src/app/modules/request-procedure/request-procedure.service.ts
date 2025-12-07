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
import { HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import { IMAGING_SERVICE } from '../../../constant/microservice.constant';
import { RequestProcedureRepository } from './request-procedure.repository';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager, Not } from 'typeorm';
import { ImagingOrder } from '@backend/shared-domain';
import {
  RequestProcedureDeletionFailedException,
  RequestProcedureNotFoundException,
} from '@backend/shared-exception';

@Injectable()
export class RequestProcedureService {
  private readonly logger = new Logger(RequestProcedureService.name);
  constructor(
    @Inject()
    private readonly requestProcedureRepository: RequestProcedureRepository,
    @InjectEntityManager() private readonly entityManager: EntityManager
  ) // @InjectRepository(ImagingOrder) private readonly imagingOrderRepository: Repository<ImagingOrder>,
  {}
  create = async (
    createRequestProcedureDto: CreateRequestProcedureDto
  ): Promise<RequestProcedure> => {
    return await this.entityManager.transaction(async () => {
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
    return await this.entityManager.transaction(async () => {
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
      // Only check for duplicate name if name is provided and changed
      const incomingName = updateRequestProcedureDto.name?.trim();
      const currentName = procedure.name?.trim();

      if (incomingName && incomingName !== currentName) {
        this.logger.log(
          `RequestProcedure update: incoming="${incomingName}", current="${currentName}", id=${id}`
        );
        const existingProcedure = await this.requestProcedureRepository.findOne({
          where: { name: incomingName, id: Not(id), isDeleted: false },
        });

        if (existingProcedure) {
          throw ThrowMicroserviceException(
            HttpStatus.CONFLICT,
            'Procedure with the same name already exists',
            IMAGING_SERVICE
          );
        }
      }

      return await this.requestProcedureRepository.update(
        id,
        updateRequestProcedureDto
      );
    });
  };

  remove = async (id: string) => {
    try {
      return await this.entityManager.transaction(async (em) => {
        const procedure = await this.requestProcedureRepository.findOne({
          where: { id },
        });

        if (!procedure) {
          throw new RequestProcedureNotFoundException(id);
        }

        const imagingOrderRepo = em.getRepository(ImagingOrder);
        const existsInOrder = await imagingOrderRepo.find({
          where: { procedure: { id }, isDeleted: false },
        });
        if (existsInOrder.length > 0) {
          throw new RequestProcedureDeletionFailedException(
            'Cannot delete procedure that is referenced in existing imaging orders',
            id
          );
        }

        return await this.requestProcedureRepository.softDelete(id, 'isDeleted');
      });
    } catch (error: unknown) {
      if (error instanceof RequestProcedureNotFoundException) throw error;
      if (error instanceof RequestProcedureDeletionFailedException) throw error;
      const message =
        error instanceof Error ? error.message : 'Failed to delete request procedure';
      throw new RequestProcedureDeletionFailedException(message, id);
    }
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
