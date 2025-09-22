import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Controller('imaging-orders')
export class ImagingOrdersController {
  constructor(
    @Inject(process.env.IMAGE_SERVICE_NAME || 'ImagingService')
    private readonly imagingService: ClientProxy
  ) {}

  @Post()
  async createImagingOrder(@Body() createImagingOrderDto: any) {
    return await firstValueFrom(
      this.imagingService.send('ImagingService.ImagingOrders.Create', {
        createImagingOrderDto,
      })
    );
  }

  @Get()
  async getAllImagingOrders() {
    return await firstValueFrom(
      this.imagingService.send('ImagingService.ImagingOrders.FindAll', {})
    );
  }

  @Get('paginated')
  async findMany(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('searchField') searchField?: string,
    @Query('sortField') sortField?: string,
    @Query('order') order?: 'asc' | 'desc'
  ) {
    const paginationDto = {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      search,
      searchField,
      sortField,
      order,
    };
    return await firstValueFrom(
      this.imagingService.send('ImagingService.ImagingOrders.FindMany', {
        paginationDto,
      })
    );
  }

  @Get('reference/:id')
  async findImagingOrderByReferenceId(
    @Param('id') id: string,
    @Query('type') type: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('searchField') searchField?: string,
    @Query('sortField') sortField?: string,
    @Query('order') order?: 'asc' | 'desc'
  ) {
    const paginationDto = {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      search,
      searchField,
      sortField,
      order,
    };

    return await firstValueFrom(
      this.imagingService.send(
        'ImagingService.ImagingOrders.FindByReferenceId',
        { id, type, paginationDto }
      )
    );
  }

  @Get(':id')
  async getImagingOrder(@Param('id') id: string) {
    return await firstValueFrom(
      this.imagingService.send('ImagingService.ImagingOrders.FindOne', { id })
    );
  }

  @Patch(':id')
  async updateImagingOrder(
    @Param('id') id: string,
    @Body() updateImagingOrderDto: any
  ) {
    return await firstValueFrom(
      this.imagingService.send('ImagingService.ImagingOrders.Update', {
        id,
        updateImagingOrderDto,
      })
    );
  }

  @Delete(':id')
  async deleteImagingOrder(@Param('id') id: string) {
    return await firstValueFrom(
      this.imagingService.send('ImagingService.ImagingOrders.Delete', { id })
    );
  }
}
