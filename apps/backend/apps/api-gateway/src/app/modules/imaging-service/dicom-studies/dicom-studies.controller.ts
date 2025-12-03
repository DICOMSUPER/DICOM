import { Public, Role } from '@backend/shared-decorators';
import {
  CreateDicomStudyDto,
  DiagnosesReport,
  DicomStudy,
  FilterDicomStudyFormDto,
  Patient,
  Room,
  UpdateDicomStudyDto,
} from '@backend/shared-domain';
import {
  DiagnosisStatus,
  DicomStudyStatus,
  Roles,
} from '@backend/shared-enums';
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
import { ApiOperation } from '@nestjs/swagger/dist/decorators/api-operation.decorator';
import { ApiResponse } from '@nestjs/swagger/dist/decorators/api-response.decorator';
import { ApiTags } from '@nestjs/swagger/dist/decorators/api-use-tags.decorator';
import {
  CACHE_TTL_SECONDS,
  CacheEntity,
  CacheKeyPattern,
} from '../../../../constant/cache';
import { RedisService } from '@backend/redis';
import { firstValueFrom } from 'rxjs';
import { ApiQuery } from '@nestjs/swagger/dist/decorators/api-query.decorator';
import { ApiParam } from '@nestjs/swagger/dist/decorators/api-param.decorator';
import { ApiBody } from '@nestjs/swagger/dist/decorators/api-body.decorator';

@Controller('dicom-studies')
@ApiTags('DICOM Studies')
@UseInterceptors(RequestLoggingInterceptor, TransformInterceptor)
export class DicomStudiesController {
  constructor(
    @Inject(process.env.IMAGE_SERVICE_NAME || 'IMAGING_SERVICE')
    private readonly imagingService: ClientProxy,
    @Inject(process.env.PATIENT_SERVICE_NAME || 'PATIENT_SERVICE')
    private readonly patientService: ClientProxy,
    @Inject(process.env.USER_SERVICE_NAME || 'USER_SERVICE')
    private readonly userService: ClientProxy,
    @Inject(RedisService)
    private readonly redisService: RedisService
  ) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get all DICOM studies' })
  @ApiResponse({ status: 200, description: 'List of DICOM studies' })
  async getAllDicomStudies() {
    const pattern = `${CacheEntity.dicomStudies}.${CacheKeyPattern.all}`;
    const cachedStudies = await this.redisService.get(pattern);
    if (cachedStudies) {
      return cachedStudies;
    }
    const studies = await firstValueFrom(
      this.imagingService.send('ImagingService.DicomStudies.FindAll', {})
    );

    await this.redisService.set(pattern, studies, CACHE_TTL_SECONDS);
    return studies;
  }

  @Get('paginated')
  @ApiOperation({ summary: 'Get paginated DICOM studies' })
  @ApiResponse({ status: 200, description: 'Paginated list of DICOM studies' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'searchField', required: false })
  @ApiQuery({ name: 'sortField', required: false })
  @ApiQuery({ name: 'order', required: false })
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

    const pattern = `${CacheEntity.dicomStudies}.${CacheKeyPattern.paginated}?page=${page}&limit=${limit}&search=${search}&searchField=${searchField}&sortField=${sortField}&order=${order}`;

    const cachedPaginated = await this.redisService.get(pattern);
    if (cachedPaginated) {
      return cachedPaginated;
    }
    const studies = await firstValueFrom(
      this.imagingService.send('ImagingService.DicomStudies.FindMany', {
        paginationDto,
      })
    );

    await this.redisService.set(pattern, studies, CACHE_TTL_SECONDS);
    return studies;
  }

  @Get('reference/:id')
  @Role(
    Roles.PHYSICIAN,
    Roles.IMAGING_TECHNICIAN,
    Roles.RADIOLOGIST,
    Roles.SYSTEM_ADMIN
  )
  @ApiOperation({ summary: 'Get DICOM studies by reference ID' })
  @ApiResponse({
    status: 200,
    description: 'List of DICOM studies by reference ID',
  })
  @ApiParam({ name: 'id', required: true })
  @ApiQuery({ name: 'type', required: true })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'searchField', required: false })
  @ApiQuery({ name: 'sortField', required: false })
  @ApiQuery({ name: 'order', required: false })
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
    const pattern = `${CacheEntity.dicomStudies}.${
      CacheKeyPattern.byReferenceId
    }/${id}?type=${type || ''}&page=${page || ''}&limit=${limit || ''}&search=${
      search || ''
    }&searchField=${searchField || ''}&sortField=${sortField || ''}&order=${
      order || ''
    }`;

    const cachedStudies = await this.redisService.get(pattern);
    if (cachedStudies) {
      return cachedStudies;
    }

    const paginationDto = {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      search,
      searchField,
      sortField,
      order,
    };

    const studies = await firstValueFrom(
      this.imagingService.send(
        'ImagingService.DicomStudies.FindByReferenceId',
        { id, type, paginationDto }
      )
    );

    await this.redisService.set(pattern, studies, CACHE_TTL_SECONDS);
    return studies;
  }

  @Get('filter')
  @ApiOperation({ summary: 'Get DICOM studies with filters' })
  @ApiResponse({ status: 200, description: 'Filtered list of DICOM studies' })
  @Role(
    Roles.PHYSICIAN,
    Roles.IMAGING_TECHNICIAN,
    Roles.RADIOLOGIST,
    Roles.SYSTEM_ADMIN
  )
  @ApiQuery({ name: 'studyStatus', required: false, type: String })
  @ApiQuery({ name: 'reportStatus', required: false, type: String })
  @ApiQuery({ name: 'modalityId', required: false, type: String })
  @ApiQuery({ name: 'modalityMachineId', required: false, type: String })
  @ApiQuery({ name: 'mrn', required: false, type: String })
  @ApiQuery({ name: 'patientFirstName', required: false, type: String })
  @ApiQuery({ name: 'patientLastName', required: false, type: String })
  @ApiQuery({ name: 'bodyPart', required: false, type: String })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiQuery({ name: 'studyUID', required: false, type: String })
  @ApiQuery({ name: 'roomId', required: false, type: String })
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
    @Query('studyUID') studyUID?: string,
    @Query('roomId') roomId?: string
  ) {
    try {
      const pattern = `${CacheEntity.dicomStudies}.${
        CacheKeyPattern.filter
      }?studyStatus=${studyStatus || ''}&reportStatus=${
        reportStatus || ''
      }&modalityId=${modalityId || ''}&modalityMachineId=${
        modalityMachineId || ''
      }&mrn=${mrn || ''}&patientFirstName=${
        patientFirstName || ''
      }&patientLastName=${patientLastName || ''}&bodyPart=${
        bodyPart || ''
      }&startDate=${startDate || ''}&endDate=${endDate || ''}&studyUID=${
        studyUID || ''
      }&roomId=${roomId || ''}`;
      const cachedStudies = await this.redisService.get(pattern);
      if (cachedStudies) {
        return cachedStudies;
      }

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
          roomId,
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

      await this.redisService.set(pattern, studies, CACHE_TTL_SECONDS);

      console.log('Final studies count:', studies.length);
      return studies;
    } catch (error) {
      console.error('Error in getStudyWithFilter:', error);
      throw error;
    }
  }

  @Get('filter-with-pagination')
  @Role(
    Roles.PHYSICIAN,
    Roles.RADIOLOGIST,
    Roles.IMAGING_TECHNICIAN,
    Roles.SYSTEM_ADMIN
  )
  @ApiOperation({ summary: 'Get DICOM studies with filters and pagination' })
  @ApiResponse({
    status: 200,
    description: 'Filtered and paginated list of DICOM studies',
  })
  @ApiQuery({ name: 'patientName', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'dateFrom', required: false, type: String })
  @ApiQuery({ name: 'dateTo', required: false, type: String })
  @ApiQuery({ name: 'modalityMachineId', required: false, type: String })
  @ApiQuery({ name: 'orderId', required: false, type: String })
  @ApiQuery({ name: 'sortBy', required: false, type: String })
  @ApiQuery({ name: 'order', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getStudyWithFilterWithPagination(
    @Query() filter: FilterDicomStudyFormDto,
    @Req() req: IAuthenticatedRequest
  ) {
    const pattern = `${CacheEntity.dicomStudies}.${
      CacheKeyPattern.filterWithPagination
    }?patientName=${filter.patientName || ''}&status=${
      filter.status || ''
    }&dateFrom=${filter.dateFrom || ''}&dateTo=${
      filter.dateTo || ''
    }&modalityMachineId=${filter.modalityMachineId || ''}&orderId=${
      filter.orderId || ''
    }&sortBy=${filter.sortBy || ''}&order=${filter.order || ''}&page=${
      filter.page || ''
    }&limit=${filter.limit || ''}`;

    const cachedStudies = await this.redisService.get(pattern);
    if (cachedStudies) {
      return cachedStudies;
    }

    const userInfo = req.userInfo;
    const studies = await firstValueFrom(
      this.imagingService.send(
        'ImagingService.DicomStudies.FilterWithPagination',
        { filter, userInfo }
      )
    );

    await this.redisService.set(pattern, studies, CACHE_TTL_SECONDS);
    return studies;
  }

  @Get('stats-in-date-range')
  @Role(
    Roles.SYSTEM_ADMIN,
    Roles.IMAGING_TECHNICIAN,
    Roles.RADIOLOGIST,
    Roles.PHYSICIAN
  )
  @ApiOperation({ summary: 'Get DICOM studies stats in date range' })
  @ApiResponse({
    status: 200,
    description: 'DICOM studies stats in date range',
  })
  @ApiQuery({ name: 'dateFrom', required: false, type: String })
  @ApiQuery({ name: 'dateTo', required: false, type: String })
  @ApiQuery({ name: 'roomId', required: false, type: String })
  async getStatsInDateRange(
    @Req() req: IAuthenticatedRequest,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('roomId') roomId?: string
  ) {
    const pattern = `${CacheEntity.dicomStudies}.${
      CacheKeyPattern.statsInDateRange
    }?dateFrom=${dateFrom || ''}&dateTo=${dateTo || ''}&roomId=${roomId || ''}`;
    const cachedStats = await this.redisService.get(pattern);
    if (cachedStats) {
      return cachedStats;
    }

    const today = new Date().toISOString().split('T')[0];
    const finalDateFrom = dateFrom || today;
    const finalDateTo = dateTo || today;

    const stats = await firstValueFrom(
      this.imagingService.send(
        'ImagingService.DicomStudies.GetStatsInDateRange',
        {
          dateFrom: finalDateFrom,
          dateTo: finalDateTo,
          roomId,
          userInfo: req?.userInfo,
        }
      )
    );

    await this.redisService.set(pattern, stats, CACHE_TTL_SECONDS);
    return stats;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get DICOM study by ID' })
  @ApiResponse({ status: 200, description: 'DICOM study details' })
  @ApiParam({ name: 'id', required: true, type: String })
  async getDicomStudyById(@Param('id') id: string) {
    const pattern = `${CacheEntity.dicomStudies}.${CacheKeyPattern.id}/${id}`;
    const cachedStudy = await this.redisService.get(pattern);
    if (cachedStudy) {
      return cachedStudy;
    }
    const study = await firstValueFrom(
      this.imagingService.send('ImagingService.DicomStudies.FindOne', { id })
    );
    await this.redisService.set(pattern, study, CACHE_TTL_SECONDS);
    return study;
  }

  @Post()
  @ApiOperation({ summary: 'Create a new DICOM study' })
  @ApiResponse({ status: 201, description: 'DICOM study created' })
  @ApiBody({ type: CreateDicomStudyDto })
  async createDicomStudy(@Body() createDicomStudyDto: CreateDicomStudyDto) {
    const study = await firstValueFrom(
      this.imagingService.send('ImagingService.DicomStudies.Create', {
        createDicomStudyDto,
      })
    );

    const pattern = `${CacheEntity.dicomStudies}.${CacheKeyPattern.id}/${study.id}`;
    await this.redisService.set(pattern, study, CACHE_TTL_SECONDS);

    await this.redisService.delete(
      `${CacheEntity.dicomStudies}.${CacheKeyPattern.all}`
    );
    await this.redisService.deleteKeyStartingWith(
      `${CacheEntity.dicomStudies}.${CacheKeyPattern.paginated}`
    );
    await this.redisService.deleteKeyStartingWith(
      `${CacheEntity.dicomStudies}.${CacheKeyPattern.byReferenceId}`
    );
    await this.redisService.deleteKeyStartingWith(
      `${CacheEntity.dicomStudies}.${CacheKeyPattern.statsInDateRange}`
    );
    await this.redisService.deleteKeyStartingWith(
      `${CacheEntity.dicomStudies}.${CacheKeyPattern.byOrderId}`
    );
    return study;
  }

  @Role(
    Roles.SYSTEM_ADMIN,
    Roles.IMAGING_TECHNICIAN,
    Roles.RADIOLOGIST,
    Roles.PHYSICIAN
  )
  @Patch(':id')
  @ApiOperation({ summary: 'Update a DICOM study by ID' })
  @ApiResponse({ status: 200, description: 'DICOM study updated' })
  @ApiParam({ name: 'id', required: true, type: String })
  @ApiBody({ type: UpdateDicomStudyDto })
  async updateDicomStudy(
    @Param('id') id: string,
    @Body() updateDicomStudyDto: UpdateDicomStudyDto
  ) {
    const study = await firstValueFrom(
      this.imagingService.send('ImagingService.DicomStudies.Update', {
        id,
        updateDicomStudyDto,
      })
    );

    const pattern = `${CacheEntity.dicomStudies}.${CacheKeyPattern.id}/${study.id}`;
    await this.redisService.set(pattern, study, CACHE_TTL_SECONDS);

    await this.redisService.delete(
      `${CacheEntity.dicomStudies}.${CacheKeyPattern.all}`
    );
    await this.redisService.deleteKeyStartingWith(
      `${CacheEntity.dicomStudies}.${CacheKeyPattern.paginated}`
    );
    await this.redisService.deleteKeyStartingWith(
      `${CacheEntity.dicomStudies}.${CacheKeyPattern.byReferenceId}`
    );
    await this.redisService.deleteKeyStartingWith(
      `${CacheEntity.dicomStudies}.${CacheKeyPattern.statsInDateRange}`
    );
    await this.redisService.deleteKeyStartingWith(
      `${CacheEntity.dicomStudies}.${CacheKeyPattern.byOrderId}`
    );
    return study;
  }

  @Role(Roles.SYSTEM_ADMIN)
  @Delete(':id')
  async deleteDicomStudy(@Param('id') id: string) {
    const result = await firstValueFrom(
      this.imagingService.send('ImagingService.DicomStudies.Delete', { id })
    );
    await this.redisService.delete(
      `${CacheEntity.dicomStudies}.${CacheKeyPattern.id}/${id}`
    );
    await this.redisService.delete(
      `${CacheEntity.dicomStudies}.${CacheKeyPattern.all}`
    );
    await this.redisService.deleteKeyStartingWith(
      `${CacheEntity.dicomStudies}.${CacheKeyPattern.paginated}`
    );
    await this.redisService.deleteKeyStartingWith(
      `${CacheEntity.dicomStudies}.${CacheKeyPattern.byReferenceId}`
    );
    await this.redisService.deleteKeyStartingWith(
      `${CacheEntity.dicomStudies}.${CacheKeyPattern.statsInDateRange}`
    );
    await this.redisService.deleteKeyStartingWith(
      `${CacheEntity.dicomStudies}.${CacheKeyPattern.byOrderId}`
    );
    return result;
  }

  @Role(Roles.RADIOLOGIST)
  @Get('order/:orderId')
  async getDicomStudiesByOrderId(@Param('orderId') orderId: string) {
    const pattern = `${CacheEntity.dicomStudies}.${CacheKeyPattern.byOrderId}/${orderId}`;
    const cachedStudy = await this.redisService.get(pattern);
    if (cachedStudy) {
      return cachedStudy;
    }

    const study = await firstValueFrom(
      this.imagingService.send('ImagingService.DicomStudies.FindByOrderId', {
        orderId,
      })
    );
    await this.redisService.set(pattern, study, CACHE_TTL_SECONDS);
    return study;
  }
}
