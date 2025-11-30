import { Module } from '@nestjs/common';
import {
  PatientServiceClientModule,
  UserServiceClientModule,
} from '@backend/shared-client';
import { SharedInterceptorModule } from '@backend/shared-interceptor';
import { UserModule } from './user/user.module';
import { RoomsModule } from './rooms/rooms.module';
import { DepartmentModule } from './department/department.module';
import { RoomSchedulesModule } from './room-schedules/room-schedules.module';
import { ShiftTemplatesModule } from './shift-templates/shift-templates.module';
import { DigitalSignatureModule } from './digital-signature/digital-signature.module';
import { ServiceRoomsModule } from './service-rooms/service-rooms.module';
import { EmployeeRoomAssignmentsModule } from './employee-room-assignments/employee-room-assignments.module';
import { ServicesModule } from './services/services.module';

@Module({
  imports: [
    UserServiceClientModule,
    SharedInterceptorModule,
    UserModule,
    RoomsModule,
    DepartmentModule,
    RoomSchedulesModule,
    ShiftTemplatesModule,
    PatientServiceClientModule,
    DigitalSignatureModule,
    ServiceRoomsModule,
    EmployeeRoomAssignmentsModule,
    ServicesModule,
  ],
  exports: [
    UserServiceClientModule,
    UserModule,
    RoomsModule,
    DepartmentModule,
    RoomSchedulesModule,
    ShiftTemplatesModule,
    DigitalSignatureModule,
    ServiceRoomsModule,
    EmployeeRoomAssignmentsModule,
    ServicesModule,
  ],
})
export class UserServiceModule {}
