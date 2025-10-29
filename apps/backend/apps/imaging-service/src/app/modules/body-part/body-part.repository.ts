import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { BaseRepository } from '@backend/database';
import { BodyPart } from '@backend/shared-domain';

@Injectable()
export class BodyPartRepository extends BaseRepository<BodyPart> {
  constructor(
    @InjectEntityManager()
    entityManager: EntityManager
  ) {
    super(BodyPart, entityManager);
  }

  
}
