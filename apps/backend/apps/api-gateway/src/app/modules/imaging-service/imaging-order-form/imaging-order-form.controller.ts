import { Role } from '@backend/shared-decorators';
import {
  FilterImagingOrderFormDto,
  Patient,
  Room,
} from '@backend/shared-domain';
import { Roles } from '@backend/shared-enums';
import {
  RequestLoggingInterceptor,
  TransformInterceptor,
} from '@backend/shared-interceptor';
import type { IAuthenticatedRequest } from '@backend/shared-interfaces';
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
  Req,
  UseInterceptors,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Role } from '@backend/shared-decorators';
import {
  FilterImagingOrderFormDto,
} from '@backend/shared-domain';
import { firstValueFrom } from 'rxjs';

@Controller('imaging-order-form')
@UseInterceptors(RequestLoggingInterceptor, TransformInterceptor)
export class ImagingOrderFormController {
  constructor(
    @Inject(process.env.IMAGE_SERVICE_NAME || 'IMAGING_SERVICE')
    private readonly imagingService: ClientProxy
  ) { }

  @Post()
  @Role(Roles.PHYSICIAN)
  async createImagingOrderForm(
    @Body() createImagingOrderFormDto: any,
    @Req() req: IAuthenticatedRequest
  ) {
    console.log('create imaging order form', createImagingOrderFormDto);
    const userId = req.userInfo.userId;
    return await firstValueFrom(
      this.imagingService.send('ImagingService.ImagingOrderForm.Create', {
        createImagingOrderFormDto,
        userId,
      })
    );
  }

  @Get()
  @Role(Roles.PHYSICIAN)
  async getAllImagingOrderForms(
    @Query() filter: FilterImagingOrderFormDto,
    @Req() req: IAuthenticatedRequest
  ) {
    const userId = req.userInfo.userId;
    return await firstValueFrom(
      this.imagingService.send(
        'ImagingService.ImagingOrderForm.FindAll',
        { filter, userId }
      )
    );
  }

  @Get(':id')
  async getImagingOrderForm(@Param('id') id: string) {
    return await firstValueFrom(
      this.imagingService.send('ImagingService.ImagingOrderForm.FindOne', {
        id,
      })
    );
  }

  @Patch(':id')
  async updateImagingOrderForm(
    @Param('id') id: string,
    @Body() updateImagingOrderFormDto: any
  ) {
    return await firstValueFrom(
      this.imagingService.send('ImagingService.ImagingOrderForm.Update', {
        id,
        updateImagingOrderFormDto,
      })
    );
  }

  @Delete(':id')
  async deleteImagingOrderForm(@Param('id') id: string) {
    return await firstValueFrom(
      this.imagingService.send('ImagingService.ImagingOrderForm.Delete', { id })
    );
  }

  @Get('patient/:patientId')
  @Role(Roles.PHYSICIAN, Roles.RADIOLOGIST)
  async findByPatientId(
    @Param('patientId') patientId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('sortField') sortField?: string,
    @Query('order') order?: 'asc' | 'desc'
  ) {
    const paginationDto = {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      search,
      sortField,
      order,
    };

    return await firstValueFrom(
      this.imagingService.send(
        'ImagingService.ImagingOrderForm.FindByPatientId',
        {
          patientId,
          paginationDto,
        }
      )
    );
  }
}
