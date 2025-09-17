import { Injectable } from '@nestjs/common';
import { CreateDicomInstanceDto } from './dto/create-dicom-instance.dto';
import { UpdateDicomInstanceDto } from './dto/update-dicom-instance.dto';

@Injectable()
export class DicomInstancesService {
  create(createDicomInstanceDto: CreateDicomInstanceDto) {
    return 'This action adds a new dicomInstance';
  }

  findAll() {
    return `This action returns all dicomInstances`;
  }

  findOne(id: number) {
    return `This action returns a #${id} dicomInstance`;
  }

  update(id: number, updateDicomInstanceDto: UpdateDicomInstanceDto) {
    return `This action updates a #${id} dicomInstance`;
  }

  remove(id: number) {
    return `This action removes a #${id} dicomInstance`;
  }
}
