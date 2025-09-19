import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DicomInstancesService } from './dicom-instances.service';
import { CreateDicomInstanceDto } from './dto/create-dicom-instance.dto';
import { UpdateDicomInstanceDto } from './dto/update-dicom-instance.dto';

@Controller('dicom-instances')
export class DicomInstancesController {
  constructor(private readonly dicomInstancesService: DicomInstancesService) {}

  @Post()
  create(@Body() createDicomInstanceDto: CreateDicomInstanceDto) {
    return this.dicomInstancesService.create(createDicomInstanceDto);
  }

  @Get()
  findAll() {
    return this.dicomInstancesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.dicomInstancesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDicomInstanceDto: UpdateDicomInstanceDto) {
    return this.dicomInstancesService.update(+id, updateDicomInstanceDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.dicomInstancesService.remove(+id);
  }
}
