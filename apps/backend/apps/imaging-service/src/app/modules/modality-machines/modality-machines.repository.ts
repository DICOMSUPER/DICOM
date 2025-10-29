import { BaseRepository } from '@backend/database';
import { ModalityMachine } from '@backend/shared-domain';
import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';

@Injectable()
export class ModalityMachinesRepository extends BaseRepository<ModalityMachine> {
  constructor(@InjectEntityManager() entityManager: EntityManager) {
    super(ModalityMachine, entityManager);
  }
}
