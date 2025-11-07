import { BaseRepository } from '@backend/database';
import { Services } from '@backend/shared-domain';
import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';

@Injectable()
export class ServicesRepository extends BaseRepository<Services> {
  constructor(
    @InjectEntityManager()
    entityManager: EntityManager
  ) {
    super(Services, entityManager);
  }

  
}
