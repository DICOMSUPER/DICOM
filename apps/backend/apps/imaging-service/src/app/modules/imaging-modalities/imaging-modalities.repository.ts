import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { BaseRepository } from '@backend/database';
import { ImagingModality } from '@backend/shared-domain';

@Injectable()
export class ImagingModalityRepository extends BaseRepository<ImagingModality> {
  constructor(
    @InjectEntityManager()
    entityManager: EntityManager
  ) {
    super(ImagingModality, entityManager);
  }
}
