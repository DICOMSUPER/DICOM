import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DicomSeriesService } from './dicom-series.service';
import { CreateDicomSeryDto } from './dto/create-dicom-sery.dto';
import { UpdateDicomSeryDto } from './dto/update-dicom-sery.dto';

@Controller('dicom-series')
export class DicomSeriesController {
  constructor(private readonly dicomSeriesService: DicomSeriesService) {}

  @Post()
  create(@Body() createDicomSeryDto: CreateDicomSeryDto) {
    return this.dicomSeriesService.create(createDicomSeryDto);
  }

  @Get()
  findAll() {
    return this.dicomSeriesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.dicomSeriesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDicomSeryDto: UpdateDicomSeryDto) {
    return this.dicomSeriesService.update(+id, updateDicomSeryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.dicomSeriesService.remove(+id);
  }
}
