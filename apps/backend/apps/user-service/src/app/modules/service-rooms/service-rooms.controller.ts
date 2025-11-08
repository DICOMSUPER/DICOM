import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ServiceRoomsService } from './service-rooms.service';
import { CreateServiceRoomDto, FilterServiceRoomDto, ServiceRoom, UpdateServiceRoomDto } from '@backend/shared-domain';
import { PaginatedResponseDto } from '@backend/database';


@Controller()
export class ServiceRoomsController {
  constructor(private readonly serviceRoomsService: ServiceRoomsService) {}

  @MessagePattern('UserService.ServiceRooms.Create')
  async create(@Payload() createServiceRoomDto: CreateServiceRoomDto) {
    return await this.serviceRoomsService.create(createServiceRoomDto);
  }

  @MessagePattern('UserService.ServiceRooms.FindAll')
  async findAll(@Payload() filter: FilterServiceRoomDto) : Promise<PaginatedResponseDto<ServiceRoom>> {
    return await this.serviceRoomsService.findAll(filter);
  }

    @MessagePattern('UserService.ServiceRooms.FindAllWithoutPagination')
  async findAllWithoutPagination(@Payload() filter: FilterServiceRoomDto) : Promise<ServiceRoom[]> {
    return await this.serviceRoomsService.findAllWithoutPagination(filter);
  }


  @MessagePattern('UserService.ServiceRooms.FindOne')
  async findOne(@Payload() id: string) {
    return await this.serviceRoomsService.findOne(id);
  }


  @MessagePattern('UserService.ServiceRooms.FindByService')
  async findByService(@Payload() data: { serviceId: string }) {
    return await this.serviceRoomsService.findByService(data.serviceId);
  }

  @MessagePattern('UserService.ServiceRooms.FindByRoom')
  async findByRoom(@Payload() data: { roomId: string }) {
    return await this.serviceRoomsService.findByRoom(data.roomId);
  }

  @MessagePattern('UserService.ServiceRooms.Update')
  async update(@Payload() data: { id: string; updatedData: UpdateServiceRoomDto }) {
    return await this.serviceRoomsService.update(data.id, data.updatedData);
  }

  @MessagePattern('UserService.ServiceRooms.Delete')
  async delete(@Payload() data: { id: string }) {
    return await this.serviceRoomsService.delete(data.id);
  }
}
