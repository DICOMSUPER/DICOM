import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DicomStudiesService } from './dicom-studies.service';
import { CreateDicomStudyDto } from './dto/create-dicom-study.dto';
import { UpdateDicomStudyDto } from './dto/update-dicom-study.dto';

@Controller('dicom-studies')
export class DicomStudiesController {
  constructor(private readonly dicomStudiesService: DicomStudiesService) {}

  @Post()
  create(@Body() createDicomStudyDto: CreateDicomStudyDto) {
    return this.dicomStudiesService.create(createDicomStudyDto);
  }

  @Get()
  findAll() {
    return this.dicomStudiesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.dicomStudiesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDicomStudyDto: UpdateDicomStudyDto) {
    return this.dicomStudiesService.update(+id, updateDicomStudyDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.dicomStudiesService.remove(+id);
  }
}
