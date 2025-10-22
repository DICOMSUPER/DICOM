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
  UseInterceptors,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { DicomStudy, DigitalSignature } from '@backend/shared-domain';
import { DiagnosisStatus, DicomStudyStatus } from '@backend/shared-enums';
import { firstValueFrom } from 'rxjs';
import {
  TransformInterceptor,
  RequestLoggingInterceptor,
} from '@backend/shared-interceptor';
@Controller('dicom-studies')
@UseInterceptors(RequestLoggingInterceptor, TransformInterceptor)
export class DicomStudiesController {
  constructor(
    @Inject(process.env.IMAGE_SERVICE_NAME || 'IMAGING_SERVICE')
    private readonly imagingService: ClientProxy,
    @Inject(process.env.PATIENT_SERVICE_NAME || 'PATIENT_SERVICE')
    private readonly patientService: ClientProxy,
    @Inject(process.env.USER_SERVICE_NAME || 'USER_SERVICE')
    private readonly userService: ClientProxy
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

  @Get('filter')
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
    try {
      const studies = await firstValueFrom(
        this.imagingService.send('ImagingService.DicomStudies.Filter', {
          studyUID,
          startDate,
          endDate,
          bodyPart,
          modalityCode,
          modalityDevice,
          studyStatus,
        })
      );

      console.log({ studies: studies });
      const patientIds = studies.map((study: DicomStudy) => {
        return study.patientId;
      });
      const studyIds = studies.map((study: DicomStudy) => {
        return study.id;
      });
      //get patientId from those studies and find in patient service
      const patients = await firstValueFrom(
        this.patientService.send('PatientService.Patient.Filter', {
          patientIds,
          patientFirstName,
          patientLastName,
          patientCode: mrn,
        })
      );
      console.log({ patients: patients });
      //get report status & filter from those study if found
      // const diagnosisReport = await firstValueFrom(
      //   this.patientService.send('PatientService.DiagnosisReport.Filter', {
      //     reportStatus,
      //     studyIds,
      //   })
      // );

      // console.log({ diagnosisReport: diagnosisReport });

      //merge all 3

      //get room from order

      //get room from user service

      return true;
    } catch (error) {
      console.log(error);
    }
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
}
