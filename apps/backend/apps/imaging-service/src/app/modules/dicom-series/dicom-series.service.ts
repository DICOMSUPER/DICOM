import { Injectable } from '@nestjs/common';
import { CreateDicomSeryDto } from './dto/create-dicom-sery.dto';
import { UpdateDicomSeryDto } from './dto/update-dicom-sery.dto';

@Injectable()
export class DicomSeriesService {
  create(createDicomSeryDto: CreateDicomSeryDto) {
    return 'This action adds a new dicomSery';
  }

  findAll() {
    return `This action returns all dicomSeries`;
  }

  findOne(id: number) {
    return `This action returns a #${id} dicomSery`;
  }

  update(id: number, updateDicomSeryDto: UpdateDicomSeryDto) {
    return `This action updates a #${id} dicomSery`;
  }

  remove(id: number) {
    return `This action removes a #${id} dicomSery`;
  }
}
