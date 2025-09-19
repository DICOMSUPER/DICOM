import { Injectable } from '@nestjs/common';
import { CreateDicomStudyDto } from './dto/create-dicom-study.dto';
import { UpdateDicomStudyDto } from './dto/update-dicom-study.dto';

@Injectable()
export class DicomStudiesService {
  create(createDicomStudyDto: CreateDicomStudyDto) {
    return 'This action adds a new dicomStudy';
  }

  findAll() {
    return `This action returns all dicomStudies`;
  }

  findOne(id: number) {
    return `This action returns a #${id} dicomStudy`;
  }

  update(id: number, updateDicomStudyDto: UpdateDicomStudyDto) {
    return `This action updates a #${id} dicomStudy`;
  }

  remove(id: number) {
    return `This action removes a #${id} dicomStudy`;
  }
}
