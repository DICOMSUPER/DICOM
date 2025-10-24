import { IsOptional, IsString } from 'class-validator';

export class CreateBodyPartDto {
  @IsString()
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;
}
