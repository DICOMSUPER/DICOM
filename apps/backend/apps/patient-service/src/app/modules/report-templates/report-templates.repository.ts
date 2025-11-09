import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { BaseRepository } from '@backend/database';
import { ReportTemplate } from '@backend/shared-domain';

@Injectable()
export class ReportTemplateRepository extends BaseRepository<ReportTemplate> {
  constructor(
    @InjectEntityManager()
    entityManager: EntityManager
  ) {
    super(ReportTemplate, entityManager);
  }

  
}
