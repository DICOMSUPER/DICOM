import {
  Controller,
  Get,
  Logger,
  UseInterceptors,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { handleError } from '@backend/shared-utils';
import {
  TransformInterceptor,
  RequestLoggingInterceptor,
} from '@backend/shared-interceptor';
import { Role } from '@backend/shared-decorators';
import { Roles } from '@backend/shared-enums';
import { AnalyticsService } from './analytics.service';

@ApiTags('Analytics')
@Controller('analytics')
@UseInterceptors(RequestLoggingInterceptor, TransformInterceptor)
export class AnalyticsController {
  private readonly logger = new Logger('AnalyticsController');

  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('stats')
  @Role(Roles.SYSTEM_ADMIN)
  @ApiOperation({ summary: 'Get admin analytics and statistics' })
  @ApiQuery({ name: 'period', required: false, enum: ['week', 'month', 'year'], description: 'Period type for time-based charts' })
  @ApiQuery({ name: 'value', required: false, type: String, description: 'Period value: week (YYYY-WW) for week, month (YYYY-MM) for month, year (YYYY) for year' })
  @ApiResponse({
    status: 200,
    description: 'Analytics data retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async getAnalytics(
    @Query('period') period?: 'week' | 'month' | 'year',
    @Query('value') value?: string,
  ) {
    try {
      this.logger.log('Fetching analytics data');
      const analytics = await this.analyticsService.getAnalytics(period, value);
      this.logger.log('Analytics data retrieved successfully');

      return analytics;
    } catch (error) {
      this.logger.error('Failed to fetch analytics data', error);
      throw handleError(error);
    }
  }
}

