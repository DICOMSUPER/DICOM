import { PaginationDto } from '@backend/database';
import { LogLevel, LogCategory } from '@backend/shared-enums';

export class FilterSystemLogDto extends PaginationDto {
  logLevel?: LogLevel;
  category?: LogCategory;
}
