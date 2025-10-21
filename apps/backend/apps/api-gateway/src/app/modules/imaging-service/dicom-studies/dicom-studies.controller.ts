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
import { DigitalSignature } from 'libs/shared-domain/src';
import { DiagnosisStatus, DicomStudyStatus } from '@backend/shared-enums';
import { firstValueFrom } from 'rxjs';

@Controller('dicom-studies')
export class DicomStudiesController {
  constructor(
    @Inject(process.env.IMAGE_SERVICE_NAME || 'ImagingService')
    private readonly imagingService: ClientProxy
  ) {}

  @Get()
  async getAllDicomStudies() {
    return await firstValueFrom(
      this.imagingService.send('ImagingService.DicomStudies.FindAll', {})
    );
  }

  @Get('paginated')
  async getManyDicomStudies(
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
      this.imagingService.send('ImagingService.DicomStudies.FindMany', {
        paginationDto,
      })
    );
  }

  @Get('reference/:id')
  async getDicomStudiesByReferenceId(
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
        'ImagingService.DicomStudies.FindByReferenceId',
        { id, type, paginationDto }
      )
    );
  }

  @Get(':id')
  async getDicomStudyById(@Param('id') id: string) {
    return await firstValueFrom(
      this.imagingService.send('ImagingService.DicomStudies.FindOne', { id })
    );
  }

  @Post()
  async createDicomStudy(@Body() createDicomStudyDto: any) {
    return await firstValueFrom(
      this.imagingService.send('ImagingService.DicomStudies.Create', {
        createDicomStudyDto,
      })
    );
  }

  @Patch(':id')
  async updateDicomStudy(
    @Param('id') id: string,
    @Body() updateDicomStudyDto: any
  ) {
    return await firstValueFrom(
      this.imagingService.send('ImagingService.DicomStudies.Update', {
        id,
        updateDicomStudyDto,
      })
    );
  }

  @Delete(':id')
  async deleteDicomStudy(@Param('id') id: string) {
    return await firstValueFrom(
      this.imagingService.send('ImagingService.DicomStudies.Delete', { id })
    );
  }

  @Get('filtered')
  async getStudyWithFilter(
    @Query('studyStatus') studyStatus?: DicomStudyStatus,
    @Query('reportStatus') reportStatus?: DiagnosisStatus,
    @Query('modalityCode') modalityCode?: string,
    @Query('modalityDevice') modalityDevice?: string,
    @Query('mrn') mrn?: string,
    @Query('patientFirstName') patientFirstName?: string,
    @Query('patientLastName') patientLastName?: string,
    @Query('bodyPart') bodyPart?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('studyUID') studyUID?: string
  ) {
    //extract all studies with studyUID,endDate,startDate(from study), bodyPart,modalityDevice, modalityCode from order,
    //get patientId from those studies and find in patient service
    //get report status & filter from those study if found
    //get room from user service
  }
}
