import { Injectable } from '@nestjs/common';
import { CreatePrescriptionItemDto } from './dto/create-prescription-item.dto';
import { UpdatePrescriptionItemDto } from './dto/update-prescription-item.dto';

@Injectable()
export class PrescriptionItemService {
  create(createPrescriptionItemDto: CreatePrescriptionItemDto) {
    return 'This action adds a new prescriptionItem';
  }

  findAll() {
    return `This action returns all prescriptionItems`;
  }

  findOne(id: number) {
    return `This action returns a #${id} prescriptionItem`;
  }

  update(id: number, updatePrescriptionItemDto: UpdatePrescriptionItemDto) {
    return `This action updates a #${id} prescriptionItem`;
  }

  remove(id: number) {
    return `This action removes a #${id} prescriptionItem`;
  }
}
