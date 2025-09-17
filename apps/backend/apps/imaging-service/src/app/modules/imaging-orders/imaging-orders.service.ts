import { Injectable } from '@nestjs/common';
import { CreateImagingOrderDto } from './dto/create-imaging-order.dto';
import { UpdateImagingOrderDto } from './dto/update-imaging-order.dto';

@Injectable()
export class ImagingOrdersService {
  create(createImagingOrderDto: CreateImagingOrderDto) {
    return 'This action adds a new imagingOrder';
  }

  findAll() {
    return `This action returns all imagingOrders`;
  }

  findOne(id: number) {
    return `This action returns a #${id} imagingOrder`;
  }

  update(id: number, updateImagingOrderDto: UpdateImagingOrderDto) {
    return `This action updates a #${id} imagingOrder`;
  }

  remove(id: number) {
    return `This action removes a #${id} imagingOrder`;
  }
}
