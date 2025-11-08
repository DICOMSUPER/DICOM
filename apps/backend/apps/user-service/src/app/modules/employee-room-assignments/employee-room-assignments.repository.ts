import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { BaseRepository } from '@backend/database';
import { EmployeeRoomAssignment } from '@backend/shared-domain';

@Injectable()
export class EmployeeRoomAssignmentRepository extends BaseRepository<EmployeeRoomAssignment> {
  constructor(
    @InjectEntityManager()
    entityManager: EntityManager
  ) {
    super(EmployeeRoomAssignment, entityManager);
  }

  
}
