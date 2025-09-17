import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ImagingModalitiesService } from './imaging-modalities.service';
import { CreateImagingModalityDto } from './dto/create-imaging-modality.dto';
import { UpdateImagingModalityDto } from './dto/update-imaging-modality.dto';

@Controller('imaging-modalities')
export class ImagingModalitiesController {
  constructor(private readonly imagingModalitiesService: ImagingModalitiesService) {}

  @Post()
  create(@Body() createImagingModalityDto: CreateImagingModalityDto) {
    return this.imagingModalitiesService.create(createImagingModalityDto);
  }

  @Get()
  findAll() {
    return this.imagingModalitiesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.imagingModalitiesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateImagingModalityDto: UpdateImagingModalityDto) {
    return this.imagingModalitiesService.update(+id, updateImagingModalityDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.imagingModalitiesService.remove(+id);
  }
}
