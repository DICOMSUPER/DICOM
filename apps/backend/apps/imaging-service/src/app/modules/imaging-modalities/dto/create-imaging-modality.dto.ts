import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateImagingModalityDto {
  @IsString()
  @IsOptional()
  modalityCode?: string;

  @IsString()
  @IsOptional()
  modalityName?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) =>
    value === 'true' || value === true
      ? true
      : value === 'false' || value === false
      ? false
      : undefined
  )
  isActive?: boolean;
}
