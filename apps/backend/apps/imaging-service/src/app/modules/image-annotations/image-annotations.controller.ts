import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ImageAnnotationsService } from './image-annotations.service';
import { CreateImageAnnotationDto } from './dto/create-image-annotation.dto';
import { UpdateImageAnnotationDto } from './dto/update-image-annotation.dto';

@Controller('image-annotations')
export class ImageAnnotationsController {
  constructor(private readonly imageAnnotationsService: ImageAnnotationsService) {}

  @Post()
  create(@Body() createImageAnnotationDto: CreateImageAnnotationDto) {
    return this.imageAnnotationsService.create(createImageAnnotationDto);
  }

  @Get()
  findAll() {
    return this.imageAnnotationsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.imageAnnotationsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateImageAnnotationDto: UpdateImageAnnotationDto) {
    return this.imageAnnotationsService.update(+id, updateImageAnnotationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.imageAnnotationsService.remove(+id);
  }
}
