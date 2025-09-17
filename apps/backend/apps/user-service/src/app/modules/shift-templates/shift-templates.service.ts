import { Injectable } from '@nestjs/common';
import { CreateShiftTemplateDto } from './dto/create-shift-template.dto';
import { UpdateShiftTemplateDto } from './dto/update-shift-template.dto';

@Injectable()
export class ShiftTemplatesService {
  create(createShiftTemplateDto: CreateShiftTemplateDto) {
    return 'This action adds a new shiftTemplate';
  }

  findAll() {
    return `This action returns all shiftTemplates`;
  }

  findOne(id: number) {
    return `This action returns a #${id} shiftTemplate`;
  }

  update(id: number, updateShiftTemplateDto: UpdateShiftTemplateDto) {
    return `This action updates a #${id} shiftTemplate`;
  }

  remove(id: number) {
    return `This action removes a #${id} shiftTemplate`;
  }
}
