import { Injectable } from '@nestjs/common';
import { CreateQualificationDto } from '@backend/shared-domain';
import { UpdateQualificationDto } from '@backend/shared-domain';

@Injectable()
export class QualificationsService {
  create(createQualificationDto: CreateQualificationDto) {
    return 'This action adds a new qualification';
  }

  findAll() {
    return `This action returns all qualifications`;
  }

  findOne(id: number) {
    return `This action returns a #${id} qualification`;
  }

  update(id: number, updateQualificationDto: UpdateQualificationDto) {
    return `This action updates a #${id} qualification`;
  }

  remove(id: number) {
    return `This action removes a #${id} qualification`;
  }
}
