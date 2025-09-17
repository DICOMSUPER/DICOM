import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ShiftTemplatesService } from './shift-templates.service';
import { CreateShiftTemplateDto } from './dto/create-shift-template.dto';
import { UpdateShiftTemplateDto } from './dto/update-shift-template.dto';

@Controller('shift-templates')
export class ShiftTemplatesController {
  constructor(private readonly shiftTemplatesService: ShiftTemplatesService) {}

  @Post()
  create(@Body() createShiftTemplateDto: CreateShiftTemplateDto) {
    return this.shiftTemplatesService.create(createShiftTemplateDto);
  }

  @Get()
  findAll() {
    return this.shiftTemplatesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.shiftTemplatesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateShiftTemplateDto: UpdateShiftTemplateDto) {
    return this.shiftTemplatesService.update(+id, updateShiftTemplateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.shiftTemplatesService.remove(+id);
  }
}
