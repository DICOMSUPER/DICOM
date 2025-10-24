import { BaseRepository } from '@backend/database';
import { BodyPart } from '@backend/shared-domain';
import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';

@Injectable()
export class BodyPartsRepository extends BaseRepository<BodyPart> {
  constructor(@InjectEntityManager() entityManager: EntityManager) {
    super(BodyPart, entityManager);
  }
}
