import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ImagingOrdersService } from './imaging-orders.service';
import { OrderStatus } from '@backend/shared-enums';
import { ImagingOrder } from '@backend/shared-domain';
@Injectable()
export class ImagingOrdersCronJob {
  private logger = new Logger('ImagingService.ImagingOrders.CronJob');
  constructor(
    @Inject() private readonly imagingOrdersService: ImagingOrdersService
  ) {}

  @Cron('59 * * * *', {
    timeZone: 'Asia/Ho_Chi_Minh',
  })
  async handleCleanupImagingOrder() {
    this.logger.log('Starting auto-mark canceled imaging orders job');

    const maxRetries = 3;
    let retryCount = 0;
    let lastError: any;

    while (retryCount < maxRetries) {
      try {
        const orders =
          await this.imagingOrdersService.findAndHandleExpiredOrder();

        if (orders.length === 0) {
          this.logger.warn(
            `No expired imaging orders in status of ${OrderStatus.PENDING}`
          );
          return;
        }

        this.logger.warn(
          `Handled ${orders.length} of expired imaging order in status of  ${OrderStatus.PENDING}`
        );

        orders.forEach((o: ImagingOrder) => {
          this.logger.debug(`Marking order: ${o.id} as CANCELLED`);
        });
        return;
      } catch (error: any) {
        lastError = error;
        retryCount++;

        const isConnectionError = 
          error?.message?.includes('connection timeout') ||
          error?.message?.includes('Connection terminated') ||
          error?.message?.includes('ECONNREFUSED') ||
          error?.code === 'ECONNREFUSED' ||
          error?.code === 'ETIMEDOUT';

        if (isConnectionError && retryCount < maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, retryCount - 1), 10000);
          this.logger.warn(
            `⚠️ Database connection error (attempt ${retryCount}/${maxRetries}). Retrying in ${delay}ms...`,
            error?.message || error
          );
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }

        this.logger.error(
          `❌ Error during auto-mark canceled job (attempt ${retryCount}/${maxRetries}):`,
          error?.message || error,
          error?.stack
        );
        break;
      }
    }

    if (retryCount >= maxRetries) {
      this.logger.error(
        `❌ Failed to complete auto-mark canceled job after ${maxRetries} attempts. Will retry on next cron run.`,
        lastError?.message || lastError
      );
    }
  }
}
