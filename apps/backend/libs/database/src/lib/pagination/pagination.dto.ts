import { Type } from 'class-transformer';
import {
  IsInt,

  IsOptional,
  Min
} from 'class-validator';

export class PaginationDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  limit?: number = 10;

  // @IsOptional()
  // @IsString()
  // searchField?: string;

  // @IsOptional()
  // @IsString()
  // search?: string;

  // @IsOptional()
  // @IsString()
  // @IsIn(['name', 'price', 'createdAt'])
  // sortField?: string = 'createdAt';

  // @IsOptional()
  // @IsString()
  // @IsIn(['asc', 'desc'])
  // order?: string = 'desc';
}
