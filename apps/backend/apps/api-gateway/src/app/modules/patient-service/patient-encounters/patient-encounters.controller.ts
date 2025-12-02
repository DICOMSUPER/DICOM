import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  Inject,
  Logger,
  BadRequestException,
  UseInterceptors,
  Req,
  NotFoundException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { ValidationUtils } from '@backend/shared-utils';
import {
  CreatePatientEncounterDto,
  UpdatePatientEncounterDto,
  User,
} from '@backend/shared-domain';
import {
  FilterPatientEncounterDto,
  PatientEncounter,
} from '@backend/shared-domain';
import type {
  EncounterSearchFilters,
  ServiceRoom,
} from '@backend/shared-domain';
import {
  RequestLoggingInterceptor,
  TransformInterceptor,
} from '@backend/shared-interceptor';
import { RepositoryPaginationDto } from '@backend/database';
import { Role } from '@backend/shared-decorators';
import {
  EncounterPriorityLevel,
  EncounterStatus,
  EncounterType,
  Roles,
} from '@backend/shared-enums';
import type { IAuthenticatedRequest } from '@backend/shared-interfaces';

@Controller('encounters')
@UseInterceptors(RequestLoggingInterceptor, TransformInterceptor)
export class PatientEncounterController {
  private readonly logger = new Logger('PatientEncounterController');

  constructor(
    @Inject(process.env.PATIENT_SERVICE_NAME || 'PATIENT_SERVICE')
    private readonly patientService: ClientProxy,
    @Inject(process.env.USER_SERVICE_NAME || 'USER_SERVICE')
    private readonly userService: ClientProxy
  ) {}

  @Get('in-room')
  @Role(Roles.PHYSICIAN)
  async findAllInRoom(
    @Req() req: IAuthenticatedRequest,
    @Query() filterQueue?: FilterPatientEncounterDto
  ) {
    try {
      const validatedParams = ValidationUtils.validatePaginationParams(
        filterQueue?.page,
        filterQueue?.limit
      );

      // console.log('validatedParams', validatedParams);
      const payload = {
        ...filterQueue,
        ...validatedParams,
      };
      // console.log('Payload', payload);

      const userId = req.userInfo.userId;
      // console.log('User id', userId);

      const result = await firstValueFrom(
        this.patientService.send('PatientService.Encounter.FindManyInRoom', {
          filterQueue: payload,
          userId,
        })
      );
      // console.log('result', result);

      const encounters = result?.data || [];
      const userIds = [
        ...new Set(
          encounters?.flatMap((e: PatientEncounter) => {
            const ids: string[] = [];
            if (e.createdBy) ids.push(e.createdBy);
            if (e.assignedPhysicianId) ids.push(e.assignedPhysicianId);
            return ids;
          })
        ),
      ];

      // console.log(userIds)

      const users = await firstValueFrom(
        this.userService.send('UserService.Users.GetUsersByIds', { userIds })
      );

      const combined: any[] = encounters.map((e: PatientEncounter) => {
        return {
          ...e,
          createdByUser: users.find((u: User) => u.id === e.createdBy),
          assignedPhysician: users.find(
            (u: User) => u.id === e.assignedPhysicianId
          ),
        };
      });
      return { ...result, data: combined };
    } catch (error) {
      this.logger.error('Error finding all patient encounters in room:', error);
      throw error;
    }
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createPatientEncounterDto: CreatePatientEncounterDto,
    @Req() req: IAuthenticatedRequest
  ) {
    try {
      const userId = req.userInfo.userId;
      createPatientEncounterDto.createdBy = userId;

      // get room by service room id
      const serviceRoom = await firstValueFrom(
        this.userService.send(
          'UserService.ServiceRooms.FindOne',
          createPatientEncounterDto.serviceRoomId
        )
      );
      if (!serviceRoom) {
        throw new BadRequestException(
          `Service room not found: ${createPatientEncounterDto.serviceRoomId}`
        );
      }
      console.log('service room', serviceRoom);

      const roomAssignmentInCurrentSession = await firstValueFrom(
        this.userService.send(
          'UserService.EmployeeRoomAssignments.FindByRoomInCurrentSession',
          serviceRoom.roomId as string
        )
      );
      console.log('room assignment', roomAssignmentInCurrentSession);

      if (!roomAssignmentInCurrentSession) {
        throw new Error('No room assignment found for the current session');
      }

      const uniqueEmployeeIds = [
        ...new Set(
          roomAssignmentInCurrentSession.map(
            (assignment: any) => assignment.employeeId
          )
        ),
      ];
      console.log('unique employee', uniqueEmployeeIds);
      const createdEncounter = {
        ...createPatientEncounterDto,
        createdBy: userId,
      };

      console.log("crated encounter", createdEncounter);
      
      return await firstValueFrom(
        this.patientService.send('PatientService.Encounter.Create', {
          createPatientEncounterDto: createdEncounter,
          employeesInRoom: uniqueEmployeeIds,
        })
      );
    } catch (error) {
      this.logger.error('Error creating encounter:', error);
      throw error;
    }
  }

  @Get('all')
  @Role(Roles.SYSTEM_ADMIN)
  async findAllWithoutPagination(@Query() filters: EncounterSearchFilters) {
    try {
      const encountersData = await firstValueFrom(
        this.patientService.send('PatientService.Encounter.FindAll', {
          ...filters,
        })
      );

      return {
        data: encountersData?.data || [],
        count: encountersData?.data?.length || 0,
      };
    } catch (error) {
      this.logger.error('Error fetching all encounters:', error);
      throw error;
    }
  }

  @Get()
  async findAll(
    @Query() filters: EncounterSearchFilters,
    @Query('page') page?: number,
    @Query('limit') limit?: number
  ) {
    try {
      // Validate pagination parameters
      const validatedParams = ValidationUtils.validatePaginationParams(
        page,
        limit
      );

      const paginationDto = {
        page: validatedParams.page || 1,
        limit: validatedParams.limit || 10,
        ...filters,
      };
      const encountersData = await firstValueFrom(
        this.patientService.send('PatientService.Encounter.FindMany', {
          paginationDto,
        })
      );

      const encounters = encountersData?.data || [];

      const userIds = [
        ...new Set(
          encounters?.flatMap((e: PatientEncounter) => {
            const ids: string[] = [];
            if (e.createdBy) ids.push(e.createdBy);
            if (e.assignedPhysicianId) ids.push(e.assignedPhysicianId);
            return ids;
          })
        ),
      ];

      // console.log(userIds)

      const users = await firstValueFrom(
        this.userService.send('UserService.Users.GetUsersByIds', { userIds })
      );

      const combined: any[] = encounters.map((e: PatientEncounter) => {
        return {
          ...e,
          createdByUser: users.find((u: User) => u.id === e.createdBy),
          assignedPhysician: users.find(
            (u: User) => u.id === e.assignedPhysicianId
          ),
        };
      });
      return { ...encountersData, data: combined };
    } catch (error) {
      this.logger.error('Error fetching encounters:', error);
      throw error;
    }
  }

  @Get('filter')
  async filterPatientEncounter(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('searchField') searchField?: string,
    @Query('sortField') sortField?: string,
    @Query('order') order?: 'asc' | 'desc',
    @Query('status') status?: EncounterStatus,
    @Query('startDate') startDate?: Date | string,
    @Query('endDate') endDate?: Date | string,
    @Query('serviceId') serviceId?: string,
    @Query('priority') priority?: EncounterPriorityLevel,
    @Query('type') type?: EncounterType
  ) {
    console.log('Filter patient encounter data', {
      page,
      limit,
      search,
      searchField,
      sortField,
      order,
      status,
      startDate,
      endDate,
      serviceId,
      priority,
      type,
    });

    const paginationDto = {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      search,
      searchField,
      sortField,
      order,
    };
    let serviceRoomIds = undefined;
    if (serviceId) {
      const serviceRooms = await firstValueFrom(
        this.userService.send('UserService.ServiceRooms.FindByService', {
          serviceId,
        })
      );

      serviceRoomIds =
        serviceRooms.map((sr: ServiceRoom) => {
          return sr.id;
        }) || ([] as string[]);
    }

    console.log('Service room ids', serviceRoomIds);

    const encountersData = await firstValueFrom(
      this.patientService.send(
        'PatientService.Encounter.FilterEncounterWithPagination',
        {
          paginationDto,
          status,
          startDate,
          endDate,
          priority,
          roomServiceIds: serviceRoomIds,
          type,
        }
      )
    );

    const encounters = encountersData?.data || [];

    const userIds = [
      ...new Set(
        encounters?.flatMap((e: PatientEncounter) => {
          const ids: string[] = [];
          if (e.createdBy) ids.push(e.createdBy);
          if (e.assignedPhysicianId) ids.push(e.assignedPhysicianId);
          return ids;
        })
      ),
    ];

    // console.log(userIds)

    const users = await firstValueFrom(
      this.userService.send('UserService.Users.GetUsersByIds', { userIds })
    );

    const combined: any[] = encounters.map((e: PatientEncounter) => {
      return {
        ...e,
        createdByUser: users.find((u: User) => u.id === e.createdBy),
        assignedPhysician: users.find(
          (u: User) => u.id === e.assignedPhysicianId
        ),
      };
    });
    return { ...encountersData, data: combined };
  }

  @Get('stats-in-date-range')
  async getStatsInDateRange(
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('roomId') roomId?: string
  ) {
    try {
      return await firstValueFrom(
        this.patientService.send(
          'PatientService.Encounter.GetStatsInDateRange',
          {
            dateFrom,
            dateTo,
            roomId,
          }
        )
      );
    } catch (error) {
      this.logger.error('Error fetching encounter stats:', error);
      throw error;
    }
  }

  @Get('stats')
  async getStats() {
    try {
      return await firstValueFrom(
        this.patientService.send('PatientService.Encounter.GetStats', {})
      );
    } catch (error) {
      this.logger.error('Error fetching encounter stats:', error);
      throw error;
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      // Validate UUID format
      if (!ValidationUtils.isValidUUID(id)) {
        throw new BadRequestException(`Invalid UUID format: ${id}`);
      }

      const encounter = await firstValueFrom(
        this.patientService.send('PatientService.Encounter.FindOne', {
          id,
        })
      );

      if (!encounter) {
        throw new NotFoundException('Encounter not found');
      }

      const encounters = [encounter];
      const userIds = [
        ...new Set(
          encounters?.flatMap((e: PatientEncounter) => {
            const ids: string[] = [];
            if (e.createdBy) ids.push(e.createdBy);
            if (e.assignedPhysicianId) ids.push(e.assignedPhysicianId);
            return ids;
          })
        ),
      ];

      // console.log(userIds)

      const users = await firstValueFrom(
        this.userService.send('UserService.Users.GetUsersByIds', { userIds })
      );

      const combined: any[] = encounters.map((e: PatientEncounter) => {
        return {
          ...e,
          createdByUser: users.find((u: User) => u.id === e.createdBy),
          assignedPhysician: users.find(
            (u: User) => u.id === e.assignedPhysicianId
          ),
        };
      });
      return combined[0];
    } catch (error) {
      this.logger.error('Error fetching encounter:', error);
      throw error;
    }
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePatientEncounterDto: UpdatePatientEncounterDto
  ) {
    try {
      // Validate UUID format
      if (!ValidationUtils.isValidUUID(id)) {
        throw new BadRequestException(`Invalid UUID format: ${id}`);
      }

      return await firstValueFrom(
        this.patientService.send('PatientService.Encounter.Update', {
          id,
          updatePatientEncounterDto,
        })
      );
    } catch (error) {
      this.logger.error('Error updating encounter:', error);
      throw error;
    }
  }

  // update transfer patient encounter
  @Patch('transfer/:id')
  @Role(Roles.PHYSICIAN)
  async transfer(
    @Param('id') id: string,
    @Body() updatePatientEncounterDto: UpdatePatientEncounterDto,
    @Req() req: IAuthenticatedRequest
  ) {
    try {
      if (!ValidationUtils.isValidUUID(id)) {
        throw new BadRequestException(`Invalid UUID format: ${id}`);
      }
      return await firstValueFrom(
        this.patientService.send('PatientService.Encounter.Transfer', {
          id,
          updatePatientEncounterDto,
          transferredBy: req.userInfo.userId,
        })
      );
    } catch (error) {
      this.logger.error('Error transferring encounter:', error);
      throw error;
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    try {
      // Validate UUID format
      if (!ValidationUtils.isValidUUID(id)) {
        throw new BadRequestException(`Invalid UUID format: ${id}`);
      }

      return await firstValueFrom(
        this.patientService.send('PatientService.Encounter.Delete', {
          id,
        })
      );
    } catch (error) {
      this.logger.error('Error deleting encounter:', error);
      throw error;
    }
  }

  @Get('patient/:patientId')
  async findByPatientId(
    @Param('patientId') patientId: string,
    @Query() pagination: RepositoryPaginationDto
  ) {
    try {
      if (!ValidationUtils.isValidUUID(patientId)) {
        throw new BadRequestException(`Invalid UUID format: ${patientId}`);
      }

      const encountersData = await firstValueFrom(
        this.patientService.send('PatientService.Encounter.FindByPatientId', {
          patientId,
          pagination,
        })
      );

      const encounters = encountersData?.data || [];

      const userIds = [
        ...new Set(
          encounters?.flatMap((e: PatientEncounter) => {
            const ids: string[] = [];
            if (e.createdBy) ids.push(e.createdBy);
            if (e.assignedPhysicianId) ids.push(e.assignedPhysicianId);
            return ids;
          })
        ),
      ];

      // console.log(userIds)

      const users = await firstValueFrom(
        this.userService.send('UserService.Users.GetUsersByIds', { userIds })
      );

      const combined: any[] = encounters.map((e: PatientEncounter) => {
        return {
          ...e,
          createdByUser: users.find((u: User) => u.id === e.createdBy),
          assignedPhysician: users.find(
            (u: User) => u.id === e.assignedPhysicianId
          ),
        };
      });
      return { ...encountersData, data: combined };
    } catch (error) {
      this.logger.error('Error fetching encounters by patient ID:', error);
      throw error;
    }
  }
}
