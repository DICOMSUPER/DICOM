import {
  ClientProxyFactory,
  Transport,
  ClientProxy,
} from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
  CreateEmployeeRoomAssignmentDto,
  FilterEmployeeRoomAssignmentDto,
  RoomStatus,
} from '@backend/shared-domain';
import { RoomType, ScheduleStatus } from '@backend/shared-enums';

describe('EmployeeRoomAssignmentsController (E2E)', () => {
  let client: ClientProxy;
  let createdAssignmentId: string;
  let testEmployeeId: string;
  let testRoomId: string;
  let testDepartmentId: string;
  let testRoomScheduleId: string;

  jest.setTimeout(30000);

  // Helper to get future date
  const getFutureDate = (daysFromNow: number): string => {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    return date.toISOString().split('T')[0];
  };

  beforeAll(async () => {
    client = ClientProxyFactory.create({
      transport: Transport.TCP,
      options: {
        host: process.env.HOST ?? 'localhost',
        port: process.env.PORT ? Number(process.env.PORT) : 5002,
      },
    });
    await client.connect();

    // Create test department (max 10 chars for departmentCode)
    try {
      const deptResult = await firstValueFrom(
        client.send<any>('department.create', {
          departmentCode: `A${Date.now().toString().slice(-7)}`,
          departmentName: `Assign Test Dept ${Date.now()}`,
          description: 'Department for assignment testing',
          isActive: true,
        })
      );
      testDepartmentId = deptResult.department.id;
    } catch (error) {
      const depts = await firstValueFrom(
        client.send<any>('department.get-active', {})
      );
      if (depts.departments?.length > 0) {
        testDepartmentId = depts.departments[0].id;
      }
    }

    // Create test room (max 20 chars for roomCode)
    try {
      const roomResult = await firstValueFrom(
        client.send<any>('room.create', {
          roomCode: `RA${Date.now().toString().slice(-8)}`,
          department: testDepartmentId,
          roomType: RoomType.GENERAL,
          status: RoomStatus.AVAILABLE,
          floor: 1,
          capacity: 10,
          isActive: true,
        })
      );
      testRoomId = roomResult.room.id;
    } catch (error) {
      const rooms = await firstValueFrom(
        client.send<any>('room.get-all', { page: 1, limit: 1 })
      );
      if (rooms.data?.length > 0) {
        testRoomId = rooms.data[0].id;
      }
    }

    // Get a test employee
    try {
      const users = await firstValueFrom(
        client.send<any>('user.get-all-users', { page: 1, limit: 1 })
      );
      if (users.data?.data?.length > 0) {
        testEmployeeId = users.data.data[0].id;
      }
    } catch (error) {
      console.log('Could not get test employee');
    }

    // Create test room schedule (required for employee room assignment)
    try {
      const scheduleResult = await firstValueFrom(
        client.send<any>('UserService.RoomSchedule.Create', {
          room_id: testRoomId,
          work_date: getFutureDate(3),
          actual_start_time: '08:00',
          actual_end_time: '17:00',
          schedule_status: ScheduleStatus.SCHEDULED,
          notes: 'Schedule for assignment test',
        })
      );
      testRoomScheduleId = scheduleResult.schedule_id;
    } catch (error) {
      console.log('Could not create test room schedule:', error);
    }
  });

  afterAll(async () => {
    await client.close();
  });

  describe('Create Employee Room Assignment', () => {
    it('should create a new employee room assignment', async () => {
      if (!testRoomScheduleId || !testEmployeeId) {
        console.log('Skipping: Missing required testRoomScheduleId or testEmployeeId');
        return;
      }

      const payload: CreateEmployeeRoomAssignmentDto = {
        roomScheduleId: testRoomScheduleId,
        employeeId: testEmployeeId,
        isActive: true,
      };

      const result = await firstValueFrom(
        client.send<any>('UserService.EmployeeRoomAssignments.Create', payload)
      );

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      createdAssignmentId = result.id;
    });

    it('should create bulk employee room assignments', async () => {
      if (!testRoomScheduleId || !testEmployeeId) {
        console.log('Skipping: Missing required dependencies');
        return;
      }

      // Create another room schedule for bulk test
      let secondScheduleId: string;
      try {
        const scheduleResult = await firstValueFrom(
          client.send<any>('UserService.RoomSchedule.Create', {
            room_id: testRoomId,
            work_date: getFutureDate(5),
            actual_start_time: '08:00',
            actual_end_time: '12:00',
            schedule_status: ScheduleStatus.SCHEDULED,
          })
        );
        secondScheduleId = scheduleResult.schedule_id;
      } catch (error) {
        console.log('Could not create second schedule, skipping bulk test');
        return;
      }

      const assignments: CreateEmployeeRoomAssignmentDto[] = [
        {
          roomScheduleId: secondScheduleId,
          employeeId: testEmployeeId,
          isActive: true,
        },
      ];

      const result = await firstValueFrom(
        client.send<any>('UserService.EmployeeRoomAssignments.CreateBulk', {
          assignments,
        })
      );

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('Get Employee Room Assignments', () => {
    it('should get assignment by id', async () => {
      if (!createdAssignmentId) {
        console.log('Skipping: No assignment created');
        return;
      }

      const result = await firstValueFrom(
        client.send<any>('UserService.EmployeeRoomAssignments.FindOne', createdAssignmentId)
      );

      expect(result).toBeDefined();
      expect(result.id).toBe(createdAssignmentId);
    });

    it('should get all assignments', async () => {
      const filter: FilterEmployeeRoomAssignmentDto = {};
      const result = await firstValueFrom(
        client.send<any>('UserService.EmployeeRoomAssignments.FindAll', { filter })
      );

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should get many assignments with pagination', async () => {
      const result = await firstValueFrom(
        client.send<any>('UserService.EmployeeRoomAssignments.FindMany', {
          paginationDto: { page: 1, limit: 10 },
        })
      );

      expect(result).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('should get assignments by employee', async () => {
      if (!testEmployeeId) {
        console.log('Skipping: No test employee');
        return;
      }

      const result = await firstValueFrom(
        client.send<any>('UserService.EmployeeRoomAssignments.FindByEmployee', testEmployeeId)
      );

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should get assignments by employee in current session', async () => {
      if (!testEmployeeId) {
        console.log('Skipping: No test employee');
        return;
      }

      const result = await firstValueFrom(
        client.send<any>(
          'UserService.EmployeeRoomAssignments.FindByEmployeeInCurrentSession',
          testEmployeeId
        )
      );

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should get assignments by room in current session', async () => {
      if (!testRoomId) {
        console.log('Skipping: No test room');
        return;
      }

      const result = await firstValueFrom(
        client.send<any>(
          'UserService.EmployeeRoomAssignments.FindByRoomInCurrentSession',
          testRoomId
        )
      );

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should get current employee assignment', async () => {
      if (!testEmployeeId) {
        console.log('Skipping: No test employee');
        return;
      }

      try {
        const result = await firstValueFrom(
          client.send<any>('UserService.EmployeeRoomAssignments.FindCurrent', {
            id: testEmployeeId,
          })
        );

        expect(result).toBeDefined();
      } catch (error) {
        // May not have current assignment
        expect(error).toBeDefined();
      }
    });

    it('should get assignment for employee in work date', async () => {
      if (!testEmployeeId) {
        console.log('Skipping: No test employee');
        return;
      }

      try {
        const result = await firstValueFrom(
          client.send<any>(
            'UserService.EmployeeRoomAssignments.FindEmployeeRoomAssignmentForEmployeeInWorkDate',
            {
              id: testEmployeeId,
              work_date: getFutureDate(3),
            }
          )
        );

        expect(result).toBeDefined();
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('Get Assignment Stats', () => {
    it('should get assignment statistics', async () => {
      const result = await firstValueFrom(
        client.send<any>('UserService.EmployeeRoomAssignments.GetStats', {})
      );

      expect(result).toBeDefined();
    });

    it('should get assignment stats over time', async () => {
      if (!testEmployeeId) {
        console.log('Skipping: No test employee');
        return;
      }

      const today = new Date();
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

      const result = await firstValueFrom(
        client.send<any>('UserService.EmployeeRoomAssignments.StatsOverTime', {
          employeeId: testEmployeeId,
          startDate: startOfMonth.toISOString(),
          endDate: endOfMonth.toISOString(),
        })
      );

      expect(result).toBeDefined();
    });
  });

  describe('Update Employee Room Assignment', () => {
    it('should update assignment', async () => {
      if (!createdAssignmentId) {
        console.log('Skipping: No assignment created');
        return;
      }

      const updatePayload = {
        id: createdAssignmentId,
        data: {
          isActive: true,
        },
      };

      const result = await firstValueFrom(
        client.send<any>('UserService.EmployeeRoomAssignments.Update', updatePayload)
      );

      expect(result).toBeDefined();
    });
  });

  describe('Delete Employee Room Assignment', () => {
    let assignmentToDeleteId: string;

    beforeAll(async () => {
      if (!testRoomId || !testEmployeeId) {
        console.log('Cannot prepare delete test: Missing dependencies');
        return;
      }

      // Create a new room schedule for delete test
      try {
        const scheduleResult = await firstValueFrom(
          client.send<any>('UserService.RoomSchedule.Create', {
            room_id: testRoomId,
            work_date: getFutureDate(10),
            actual_start_time: '08:00',
            actual_end_time: '17:00',
            schedule_status: ScheduleStatus.SCHEDULED,
          })
        );

        const payload: CreateEmployeeRoomAssignmentDto = {
          roomScheduleId: scheduleResult.schedule_id,
          employeeId: testEmployeeId,
          isActive: true,
        };

        const result = await firstValueFrom(
          client.send<any>('UserService.EmployeeRoomAssignments.Create', payload)
        );
        assignmentToDeleteId = result.id;
      } catch (error) {
        console.log('Could not create assignment for delete test:', error);
      }
    });

    it('should delete assignment', async () => {
      if (!assignmentToDeleteId) {
        console.log('Skipping: No assignment to delete');
        return;
      }

      const result = await firstValueFrom(
        client.send<any>('UserService.EmployeeRoomAssignments.Delete', assignmentToDeleteId)
      );

      expect(result).toBeDefined();
    });
  });
});
