import {
  PaginatedResponseDto,
  RepositoryPaginationDto,
} from '@backend/database';
import {
  CreateModalityMachineDto,
  ImagingModality,
  ModalityMachine,
  UpdateModalityMachineDto,
} from '@backend/shared-domain';
import { handleErrorFromMicroservices } from '@backend/shared-utils';
import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
  IMAGING_SERVICE,
  MESSAGE_PATTERNS,
} from '../../../constant/microservice.constant';
import { ModalityMachinesService } from './modality-machines.service';
import { MachineStatus } from 'libs/shared-enums/src';

const moduleName = 'ModalityMachines';
@Controller('modality-machines')
export class ModalityMachinesController {
  private logger = new Logger(IMAGING_SERVICE);
  constructor(
    private readonly modalityMachinesService: ModalityMachinesService
  ) {}

  @MessagePattern(`${IMAGING_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.CREATE}`)
  async create(
    @Payload() data: { createModalityMachineDto: CreateModalityMachineDto }
  ): Promise<ModalityMachine> {
    this.logger.log(
      `Using pattern: ${IMAGING_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.CREATE}`
    );
    try {
      const { createModalityMachineDto } = data;
      return await this.modalityMachinesService.create(
        createModalityMachineDto
      );
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        'Failed to create modality machine',
        IMAGING_SERVICE
      );
    }
  }

  @MessagePattern(
    `${IMAGING_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.FIND_ALL}`
  )
  async findAll(
    @Payload()
    data: {
      modalityId?: string;
      roomId?: string;
      status?: MachineStatus;
      machineName?: string;
      manufacturer?: string;
      serialNumber?: string;
      model?: string;
    }
  ): Promise<ModalityMachine[]> {
    this.logger.log(
      `Using pattern: ${IMAGING_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.FIND_ALL}`
    );

    try {
      return await this.modalityMachinesService.findAll(data);
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        'Failed to find all modality machines',
        IMAGING_SERVICE
      );
    }
  }

  //find by room id
  @MessagePattern(
    `${IMAGING_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.FIND_BY_ROOM_ID}`
  )
  async findByRoomId(
    @Payload() data: { roomId: string }
  ): Promise<ImagingModality[]> {
    this.logger.log(
      `Using pattern: ${IMAGING_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.FIND_BY_ROOM_ID}`
    );
    try {
      const { roomId } = data;
      return await this.modalityMachinesService.findByRoomId(roomId);
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        `Failed to find modality machines by room id: ${data.roomId}`,
        IMAGING_SERVICE
      );
    }
  }

  @MessagePattern(
    `${IMAGING_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.FIND_ONE}`
  )
  async findOne(
    @Payload() data: { id: string }
  ): Promise<ModalityMachine | null> {
    this.logger.log(
      `Using pattern: ${IMAGING_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.FIND_ONE}`
    );
    try {
      const { id } = data;
      return await this.modalityMachinesService.findOne(id);
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        `Failed to find modality machine with id: ${data.id}`,
        IMAGING_SERVICE
      );
    }
  }

  @MessagePattern(`${IMAGING_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.UPDATE}`)
  async update(
    @Payload()
    data: {
      id: string;
      updateModalityMachineDto: UpdateModalityMachineDto;
    }
  ): Promise<ModalityMachine | null> {
    this.logger.log(
      `Using pattern: ${IMAGING_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.UPDATE}`
    );
    try {
      const { id, updateModalityMachineDto } = data;

      return await this.modalityMachinesService.update(
        id,
        updateModalityMachineDto
      );
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        `Failed to update modality machine with id: ${data.id}`,
        IMAGING_SERVICE
      );
    }
  }

  @MessagePattern(`${IMAGING_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.DELETE}`)
  async remove(@Payload() data: { id: string }): Promise<boolean> {
    this.logger.log(
      `Using pattern: ${IMAGING_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.DELETE}`
    );
    try {
      const { id } = data;
      return await this.modalityMachinesService.remove(id);
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        `Failed to delete modality machine with id: ${data.id}`,
        IMAGING_SERVICE
      );
    }
  }

  @MessagePattern(
    `${IMAGING_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.FIND_MANY}`
  )
  async findMany(
    @Payload() data: { paginationDto: RepositoryPaginationDto }
  ): Promise<PaginatedResponseDto<ModalityMachine>> {
    this.logger.log(
      `Using pattern: ${IMAGING_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.FIND_MANY}`
    );
    try {
      const { paginationDto } = data;
      return await this.modalityMachinesService.findMany({
        page: paginationDto?.page || 1,
        limit: paginationDto?.limit || 5,
        search: paginationDto?.search || '',
        searchField: paginationDto?.searchField || 'name',
        sortField: paginationDto?.sortField || 'createdAt',
        order: paginationDto?.order || 'asc',
      });
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        'Failed to find many modality machines',
        IMAGING_SERVICE
      );
    }
  }
}
