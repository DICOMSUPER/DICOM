import { IsUUID, IsArray, IsDateString } from 'class-validator';

export class SeedingRoomScheduleDto {
  @IsUUID()
  roomId!: string;

  @IsDateString()
  from!: string;

  @IsDateString()
  to!: string;

  @IsArray()
  @IsUUID('4', { each: true })
  shiftTemplateIds!: string[];
}
