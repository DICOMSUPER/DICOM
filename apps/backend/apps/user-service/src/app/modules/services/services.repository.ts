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

  async getAllServiceProvidedByADepartment(
    departmentId: string
  ): Promise<Services[]> {
    const repository = this.getRepository();

    const qb = repository
      .createQueryBuilder('service')
      .leftJoinAndSelect('service.serviceRooms', 'serviceRooms')
      .leftJoinAndSelect('serviceRooms.room', 'room')
      .andWhere('room.departmentId = :departmentId', { departmentId })
      .andWhere('service.isActive = :isActive', { isActive: true })
      .andWhere('service.isDeleted = :notDeleted', { notDeleted: false });

    return await qb.getMany();
  }
}
