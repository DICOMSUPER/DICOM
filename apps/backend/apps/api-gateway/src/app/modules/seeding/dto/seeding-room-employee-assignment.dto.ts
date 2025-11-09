import { IsArray, IsUUID } from 'class-validator';

export class SeedingRoomEmployeeAssignment {
  @IsArray()
  @IsUUID('4', { each: true })
  roomScheduleIds!: string[];

  @IsUUID()
  employeeId!: string;
}
