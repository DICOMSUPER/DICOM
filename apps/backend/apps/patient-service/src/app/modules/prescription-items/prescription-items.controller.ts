import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PrescriptionItemsService } from './prescription-items.service';
import { CreatePrescriptionItemDto } from './dto/create-prescription-item.dto';
import { UpdatePrescriptionItemDto } from './dto/update-prescription-item.dto';

@Controller('prescription-items')
export class PrescriptionItemsController {
  constructor(private readonly prescriptionItemsService: PrescriptionItemsService) {}

  @Post()
  create(@Body() createPrescriptionItemDto: CreatePrescriptionItemDto) {
    return this.prescriptionItemsService.create(createPrescriptionItemDto);
  }

  @Get()
  findAll() {
    return this.prescriptionItemsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.prescriptionItemsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePrescriptionItemDto: UpdatePrescriptionItemDto) {
    return this.prescriptionItemsService.update(+id, updatePrescriptionItemDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.prescriptionItemsService.remove(+id);
  }
}
