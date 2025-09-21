import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PrescriptionItemService } from './prescription-items.service';
import { CreatePrescriptionItemDto } from './dto/create-prescription-item.dto';
import { UpdatePrescriptionItemDto } from './dto/update-prescription-item.dto';

@Controller('prescription-items')
export class PrescriptionItemController {
  constructor(private readonly prescriptionItemService: PrescriptionItemService) {}

  @Post()
  create(@Body() createPrescriptionItemDto: CreatePrescriptionItemDto) {
    return this.prescriptionItemService.create(createPrescriptionItemDto);
  }

  @Get()
  findAll() {
    return this.prescriptionItemService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.prescriptionItemService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePrescriptionItemDto: UpdatePrescriptionItemDto) {
    return this.prescriptionItemService.update(+id, updatePrescriptionItemDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.prescriptionItemService.remove(+id);
  }
}
