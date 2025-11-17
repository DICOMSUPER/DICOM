import { BaseRepository } from '@backend/database';
import { DicomStudySignature } from '@backend/shared-domain';
import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';

@Injectable()
export class DicomStudySignaturesRepository extends BaseRepository<DicomStudySignature> {
  constructor(
    @InjectEntityManager()
    entityManager: EntityManager
  ) {
    super(DicomStudySignature, entityManager);
  }

  
}
