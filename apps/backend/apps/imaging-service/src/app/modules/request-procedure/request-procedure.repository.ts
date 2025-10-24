import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { BaseRepository } from '@backend/database';
import { RequestProcedure } from '@backend/shared-domain';


@Injectable()
export class RequestProcedureRepository extends BaseRepository<RequestProcedure> {
  constructor(
    @InjectEntityManager()
    entityManager: EntityManager
  ) {
    super(RequestProcedure, entityManager);
  }
}
