import { Injectable } from '@nestjs/common';
import { CreateImagingModalityDto } from './dto/create-imaging-modality.dto';
import { UpdateImagingModalityDto } from './dto/update-imaging-modality.dto';

@Injectable()
export class ImagingModalitiesService {
  create(createImagingModalityDto: CreateImagingModalityDto) {
    return 'This action adds a new imagingModality';
  }

  findAll() {
    return `This action returns all imagingModalities`;
  }

  findOne(id: number) {
    return `This action returns a #${id} imagingModality`;
  }

  update(id: number, updateImagingModalityDto: UpdateImagingModalityDto) {
    return `This action updates a #${id} imagingModality`;
  }

  remove(id: number) {
    return `This action removes a #${id} imagingModality`;
  }
}
