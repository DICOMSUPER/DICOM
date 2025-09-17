import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ImagingOrdersService } from './imaging-orders.service';
import { CreateImagingOrderDto } from './dto/create-imaging-order.dto';
import { UpdateImagingOrderDto } from './dto/update-imaging-order.dto';

@Controller('imaging-orders')
export class ImagingOrdersController {
  constructor(private readonly imagingOrdersService: ImagingOrdersService) {}

  @Post()
  create(@Body() createImagingOrderDto: CreateImagingOrderDto) {
    return this.imagingOrdersService.create(createImagingOrderDto);
  }

  @Get()
  findAll() {
    return this.imagingOrdersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.imagingOrdersService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateImagingOrderDto: UpdateImagingOrderDto) {
    return this.imagingOrdersService.update(+id, updateImagingOrderDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.imagingOrdersService.remove(+id);
  }
}
