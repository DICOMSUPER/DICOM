import { Body, Controller, Delete, Get, Inject, Param, Post, Put, Query, UseInterceptors } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { 
  CreateRoomAssignmentDto,
  QueryRoomAssignmentDto, UpdateRoomAssignmentDto
} from '@backend/shared-domain';
import { RequestLoggingInterceptor, TransformInterceptor } from 'libs/shared-interceptor/src';

@Controller('room-assignments')
@UseInterceptors(RequestLoggingInterceptor, TransformInterceptor)
export class RoomAssignmentsController {
  constructor(
    @Inject(process.env.USER_SERVICE_NAME || 'UserService')
    private readonly userService: ClientProxy
  ) {}

  // create room assignment
  @Post()
  async create(@Body() createRoomAssignmentDto: CreateRoomAssignmentDto) {
    console.log("room assignment", createRoomAssignmentDto);
    
    return this.userService.send('room_assignment.create', createRoomAssignmentDto);
  }


  @Get()
  async findAll(@Query() filter: QueryRoomAssignmentDto) {
    return this.userService.send('room_assignment.findAll', filter);
  }
  //get room assignment by employee id
  @Get('user/:userId')
  async findByUserId(@Param('userId') userId: string) {
    return this.userService.send('room_assignment.findByUserId', { userId });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.userService.send('room_assignment.findOne', { id });
  }

  @Put(':id')
  async update(
    @Param('id') id: string, 
    @Body() updateRoomAssignmentDto: UpdateRoomAssignmentDto
  ) {
    return this.userService.send('room_assignment.update', { id, updateRoomAssignmentDto });
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.userService.send('room_assignment.remove', { id });
  }

  @Put(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: string
  ) {
    return this.userService.send('room_assignment.updateStatus', { id, status });
  }
}
