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
import {
  DiagnosesReport,
  DicomStudy,
  DigitalSignature,
  Patient,
  Room,
} from '@backend/shared-domain';
import { DiagnosisStatus, DicomStudyStatus } from '@backend/shared-enums';
import { firstValueFrom } from 'rxjs';
import {
  TransformInterceptor,
  RequestLoggingInterceptor,
} from '@backend/shared-interceptor';
import type { IAuthenticatedRequest } from '@backend/shared-interfaces';
import { Roles } from '@backend/shared-enums';
import { Public, Role } from '@backend/shared-decorators';
import { userInfo } from 'os';
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

  @Public()
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
  @Role(
    Roles.PHYSICIAN,
    Roles.IMAGING_TECHNICIAN,
    Roles.RADIOLOGIST,
    Roles.SYSTEM_ADMIN
  )
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
    @Req() request: IAuthenticatedRequest,
    @Query('studyStatus') studyStatus?: DicomStudyStatus,
    @Query('reportStatus') reportStatus?: DiagnosisStatus,
    @Query('modalityId') modalityId?: string,
    @Query('modalityMachineId') modalityMachineId?: string,
    @Query('mrn') mrn?: string,
    @Query('patientFirstName') patientFirstName?: string,
    @Query('patientLastName') patientLastName?: string,
    @Query('bodyPart') bodyPart?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('studyUID') studyUID?: string
  ) {
    try {
      // console.log(request.userInfo);

      //  Filter studies in imaging service
      let studies = await firstValueFrom(
        this.imagingService.send('ImagingService.DicomStudies.Filter', {
          role: request?.userInfo?.role,
          studyUID,
          startDate,
          endDate,
          bodyPart,
          modalityId,
          modalityMachineId,
          studyStatus,
        })
      );

      console.log('Studies after imaging filter:', studies.length);

      //  Filter patients and join with studies
      const patientIds = studies.map((study: DicomStudy) => study.patientId);

      const patients = await firstValueFrom(
        this.patientService.send('PatientService.Patient.Filter', {
          patientIds,
          patientFirstName,
          patientLastName,
          patientCode: mrn,
        })
      );

      console.log('Patients found:', patients.length);

      // Only keep studies whose patients match the filter criteria
      const foundPatientIds = patients.map((patient: Patient) => patient.id);
      studies = studies.filter((study: DicomStudy) =>
        foundPatientIds.includes(study.patientId)
      );

      // Join patient data to studies
      studies = studies.map((study: DicomStudy) => ({
        ...study,
        patient: patients.find((p: Patient) => p.id === study.patientId),
      }));

      console.log('Studies after patient filter:', studies.length);

      //  Get diagnosis reports for all remaining studies
      const studyIds = studies.map((study: DicomStudy) => study.id);

      const diagnosisReports = await firstValueFrom(
        this.patientService.send('PatientService.DiagnosesReport.Filter', {
          reportStatus,
          studyIds,
        })
      );

      console.log('Diagnosis reports found:', diagnosisReports.length);

      // CRITICAL: Only filter by report if reportStatus was explicitly provided
      // If reportStatus is "All" or undefined/null, include all studies regardless of report existence
      if (reportStatus && reportStatus.toLocaleLowerCase() !== 'all') {
        // console.log('Filtering via report');
        const studyIdsFromReport = diagnosisReports.map(
          (report: DiagnosesReport) => report.studyId
        );

        studies = studies.filter((study: DicomStudy) =>
          studyIdsFromReport.includes(study.id)
        );

        // console.log('Studies after report filter:', studies.length);
      }

      // Join report data to studies (some studies may not have reports)
      studies = studies.map((study: DicomStudy) => ({
        ...study,
        report: diagnosisReports.find(
          (report: DiagnosesReport) => report.studyId === study.id
        ),
      }));

      // Step 4: Get rooms and join with studies
      const roomIds = studies
        .map(
          (study: DicomStudy) => study.imagingOrder?.imagingOrderForm?.roomId
        )
        .filter((id: string | undefined) => id !== null && id !== undefined);

      if (roomIds.length > 0) {
        const rooms = await firstValueFrom(
          this.userService.send('UserService.Room.GetRoomsByIds', {
            ids: roomIds,
          })
        );

        console.log('Rooms found:', rooms.length);

        // Join room data to studies
        studies = studies.map((study: DicomStudy) => ({
          ...study,
          room: rooms.find(
            (room: Room) =>
              room.id === study.imagingOrder?.imagingOrderForm?.roomId
          ),
        }));
      }

      console.log('Final studies count:', studies.length);
      return studies;
    } catch (error) {
      console.error('Error in getStudyWithFilter:', error);
      throw error;
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

  @Role(Roles.SYSTEM_ADMIN, Roles.IMAGING_TECHNICIAN)
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

  @Role(Roles.SYSTEM_ADMIN)
  @Delete(':id')
  async deleteDicomStudy(@Param('id') id: string) {
    return await firstValueFrom(
      this.imagingService.send('ImagingService.DicomStudies.Delete', { id })
    );
  }

  @Role(Roles.RADIOLOGIST)
  @Get('order/:orderId')
  async getDicomStudiesByOrderId(@Param('orderId') orderId: string) {
    return await firstValueFrom(
      this.imagingService.send('ImagingService.DicomStudies.FindByOrderId', {
        orderId,
      })
    );
  }
}
