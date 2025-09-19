import { Injectable } from '@nestjs/common';
import { CreateImageAnnotationDto } from './dto/create-image-annotation.dto';
import { UpdateImageAnnotationDto } from './dto/update-image-annotation.dto';

@Injectable()
export class ImageAnnotationsService {
  create(createImageAnnotationDto: CreateImageAnnotationDto) {
    return 'This action adds a new imageAnnotation';
  }

  findAll() {
    return `This action returns all imageAnnotations`;
  }

  findOne(id: number) {
    return `This action returns a #${id} imageAnnotation`;
  }

  update(id: number, updateImageAnnotationDto: UpdateImageAnnotationDto) {
    return `This action updates a #${id} imageAnnotation`;
  }

  remove(id: number) {
    return `This action removes a #${id} imageAnnotation`;
  }
}
