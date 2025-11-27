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
  }) // hourly, incase server not running at 23:59
  async handleCleanupImagingOrder() {
    this.logger.log('Starting auto-mark canceled imaging orders job');

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
    } catch (error) {
      this.logger.error(`Failed to handle expired order`);
    }
  }
}
