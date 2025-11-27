import { Injectable, Inject, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { RoomStatus } from '@backend/shared-domain';
import { EncounterStatus } from '@backend/shared-enums';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger('AnalyticsService');

  constructor(
    @Inject(process.env.USER_SERVICE_NAME || 'USER_SERVICE')
    private readonly userService: ClientProxy,
    @Inject(process.env.PATIENT_SERVICE_NAME || 'PATIENT_SERVICE')
    private readonly patientService: ClientProxy,
  ) {}

  async getAnalytics(period?: 'week' | 'month' | 'year', value?: string) {
    try {
      const [
        userStatsResult,
        departmentStatsResult,
        roomStatsResult,
        serviceStatsResult,
        patientStatsResult,
        encounterStatsResult,
      ] = await Promise.all([
        firstValueFrom(
          this.userService.send('user.get-stats', {})
        ).catch(() => ({ data: null })),
        
        firstValueFrom(
          this.userService.send('department.get-stats', {})
        ).catch(() => ({ data: null })),
        
        firstValueFrom(
          this.userService.send('room.get-stats', {})
        ).catch(() => ({ data: null })),
        
        firstValueFrom(
          this.userService.send('UserService.Services.GetStats', {})
        ).catch(() => ({ data: null })),
        
        firstValueFrom(
          this.patientService.send('PatientService.Patient.GetStats', {})
        ).catch(() => ({ data: null })),
        
        firstValueFrom(
          this.patientService.send('PatientService.Encounter.GetStats', {})
        ).catch(() => ({ data: null })),
      ]);

      const userStats = userStatsResult || {};
      const departmentStats = departmentStatsResult || {};
      const roomStats = roomStatsResult || {};
      const serviceStats = serviceStatsResult || {};
      const patientStats = patientStatsResult || {};
      const encounterStats = encounterStatsResult || {};

      const totalUsers = userStats.activeUsers || 0;
      const totalDepartments = departmentStats.activeDepartments || 0;
      const totalRooms = roomStats.activeRooms || 0;
      const totalServices = serviceStats.activeServices || 0;

      const stats = {
        totalUsers,
        totalDepartments,
        totalRooms,
        totalServices,
        totalPatients: patientStats?.totalPatients || 0,
        activePatients: patientStats?.activePatients || 0,
        newPatientsThisMonth: patientStats?.newPatientsThisMonth || 0,
        inactivePatients: patientStats?.inactivePatients || 0,
        totalEncounters: encounterStats?.totalEncounters || 0,
        todayEncounters: encounterStats?.todayEncounter || 0,
        todayStatEncounters: encounterStats?.todayStatEncounter || 0,
        encountersThisMonth: encounterStats?.encountersThisMonth || 0,
      };

      const { startDate, endDate } = this.calculateDateRange(period, value);
      
      let encountersOverTimeData: any = { data: [] };
      let patientsOverTimeData: any = { data: [] };
      let allEncountersForType: any[] = [];
      
      try {
        const allEncounters = await firstValueFrom(
          this.patientService.send('PatientService.Encounter.FindAll', {})
        ).catch(() => []);
        
        const encountersData = Array.isArray(allEncounters?.data) ? allEncounters.data : (Array.isArray(allEncounters) ? allEncounters : []);
        const filteredEncounters = encountersData.filter((e: any) => {
          if (e.isActive === false || e.isDeleted === true) return false;
          const encounterDate = e.createdAt || e.encounterDate || e.date;
          if (!encounterDate) return false;
          const date = new Date(encounterDate).toISOString().split('T')[0];
          return date >= startDate && date <= endDate;
        });
        
        allEncountersForType = filteredEncounters;
        
        allEncountersForType = filteredEncounters;
        
        const encounterDateMap = new Map<string, number>();
        const patientDateMap = new Map<string, Set<string>>();
        
        filteredEncounters.forEach((e: any) => {
          const encounterDate = e.createdAt || e.encounterDate || e.date;
          if (encounterDate) {
            const date = new Date(encounterDate).toISOString().split('T')[0];
            encounterDateMap.set(date, (encounterDateMap.get(date) || 0) + 1);
            
            if (e.patientId) {
              if (!patientDateMap.has(date)) {
                patientDateMap.set(date, new Set());
              }
              patientDateMap.get(date)?.add(e.patientId);
            }
          }
        });
        
        encountersOverTimeData = {
          data: Array.from(encounterDateMap.entries()).map(([date, count]) => ({
            date,
            count,
            encounters: count,
          })),
        };
        
        patientsOverTimeData = {
          data: Array.from(patientDateMap.entries()).map(([date, patientIds]) => ({
            date,
            count: patientIds.size,
            patients: patientIds.size,
          })),
        };
      } catch (error) {
        this.logger.warn('Could not fetch encounters/patients by date range, using fallback', error);
      }

      const encountersOverTime = this.processTimeSeriesData(
        encountersOverTimeData?.data || [],
        period,
        startDate,
        endDate,
        'encounters'
      );
      const patientsOverTime = this.processTimeSeriesData(
        patientsOverTimeData?.data || [],
        period,
        startDate,
        endDate,
        'patients'
      );
      const encountersByType = this.processEncountersByType(allEncountersForType);
      
      const departmentsDistribution = await this.getDepartmentsDistribution();
      const roomsByStatus = await this.getRoomsByStatus();
      const encountersByStatus = await this.getEncountersByStatus();

      return {
        stats,
        encountersOverTime,
        patientsOverTime,
        encountersByType,
        departmentsDistribution,
        roomsByStatus,
        encountersByStatus,
      };
    } catch (error) {
      this.logger.error('Error aggregating analytics data:', error);
      throw error;
    }
  }

  private calculateDateRange(period?: 'week' | 'month' | 'year', value?: string): { startDate: string; endDate: string } {
    const today = new Date();
    
    if (!period || !value) {
      const startDate = new Date(today);
      startDate.setDate(startDate.getDate() - 6);
      return {
        startDate: startDate.toISOString().split('T')[0],
        endDate: today.toISOString().split('T')[0],
      };
    }

    if (period === 'week') {
      const [year, week] = value.split('-W').map(Number);
      const simple = new Date(year, 0, 1 + (week - 1) * 7);
      const dow = simple.getDay();
      const ISOweekStart = simple;
      if (dow <= 4) {
        ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
      } else {
        ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
      }
      const startDate = new Date(ISOweekStart);
      const endDate = new Date(ISOweekStart);
      endDate.setDate(endDate.getDate() + 6);
      return {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
      };
    }

    if (period === 'month') {
      const [year, month] = value.split('-').map(Number);
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      return {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
      };
    }

    if (period === 'year') {
      const year = Number(value);
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year, 11, 31);
      return {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
      };
    }

    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - 6);
    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: today.toISOString().split('T')[0],
    };
  }

  private processTimeSeriesData(
    data: any[],
    period?: 'week' | 'month' | 'year',
    startDate?: string,
    endDate?: string,
    dataType: 'encounters' | 'patients' = 'encounters'
  ): Array<{ date: string; encounters?: number; patients?: number }> {
    const dataKey = dataType === 'encounters' ? 'encounters' : 'patients';
    
    if (!startDate || !endDate) {
      const result: Array<{ date: string; [key: string]: any }> = [];
      const today = new Date();
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const dayData = data.find((d: any) => d.date === dateStr);
        const count = dayData?.count || dayData?.[dataKey] || 0;
        result.push({ date: dateStr, [dataKey]: count });
      }
      return result;
    }

    const result: Array<{ date: string; [key: string]: any }> = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (period === 'week') {
      const current = new Date(start);
      while (current <= end) {
        const dateStr = current.toISOString().split('T')[0];
        const dayData = data.find((d: any) => d.date === dateStr);
        result.push({
          date: dateStr,
          [dataKey]: dayData?.count || dayData?.[dataKey] || 0,
        });
        current.setDate(current.getDate() + 1);
      }
      return result;
    }

    if (period === 'month') {
      const current = new Date(start);
      while (current <= end) {
        const dateStr = current.toISOString().split('T')[0];
        const dayData = data.find((d: any) => d.date === dateStr);
        result.push({
          date: dateStr,
          [dataKey]: dayData?.count || dayData?.[dataKey] || 0,
        });
        current.setDate(current.getDate() + 1);
      }
      return result;
    }

    if (period === 'year') {
      const monthMap = new Map<string, number>();
      
      data.forEach((d: any) => {
        if (d.date) {
          const date = new Date(d.date);
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          const count = d.count || d[dataKey] || 0;
          monthMap.set(monthKey, (monthMap.get(monthKey) || 0) + count);
        }
      });
      
      const current = new Date(start);
      while (current <= end) {
        const monthKey = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`;
        if (!monthMap.has(monthKey)) {
          monthMap.set(monthKey, 0);
        }
        current.setMonth(current.getMonth() + 1);
      }
      
      return Array.from(monthMap.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, count]) => ({
          date: `${date}-01`,
          [dataKey]: count,
        }));
    }

    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayData = data.find((d: any) => d.date === dateStr);
      const count = dayData?.count || dayData?.[dataKey] || 0;
      result.push({ date: dateStr, [dataKey]: count });
    }
    
    return result;
  }

  private processEncountersByType(data: any[]): Array<{ type: string; count: number }> {
    if (!data?.length) {
      return [];
    }
    
    const typeMap = new Map<string, number>();
    data.forEach((item: any) => {
      const type = item.encounterType || item.encounter_type || item.type || 'Unknown';
      typeMap.set(type, (typeMap.get(type) || 0) + 1);
    });
    
    return Array.from(typeMap.entries())
      .map(([type, count]) => ({ type, count }))
      .filter(item => item.count > 0);
  }


  private async getDepartmentsDistribution(): Promise<Array<{ name: string; count: number }>> {
    try {
      const result = await firstValueFrom(
        this.userService.send('department.get-all-without-pagination', {
          isActive: true,
        })
      ).catch(() => ({ data: [] }));
      
      const departmentsData = Array.isArray(result?.data) ? result.data : (Array.isArray(result) ? result : []);
      const departments = departmentsData.filter((d: any) => 
        d.isActive !== false && d.isDeleted !== true
      );
      
      const distribution = await Promise.all(
        departments.map(async (dept: any) => {
          const roomsResult = await firstValueFrom(
            this.userService.send('room.get-all-without-pagination', {
              departmentId: dept.id,
              isActive: true,
            })
          ).catch(() => ({ data: [] }));
          
          const roomsData = Array.isArray(roomsResult?.data) ? roomsResult.data : (Array.isArray(roomsResult) ? roomsResult : []);
          const rooms = roomsData.filter((r: any) => 
            r.isActive !== false && r.isDeleted !== true
          );
          
          return {
            name: dept.departmentName || 'Unknown',
            count: rooms.length,
          };
        })
      );
      
      return distribution.filter(d => d.count > 0);
    } catch (error) {
      this.logger.error('Error fetching departments distribution:', error);
      return [];
    }
  }

  private async getRoomsByStatus(): Promise<Array<{ status: string; count: number }>> {
    try {
      const result = await firstValueFrom(
        this.userService.send('room.get-all-without-pagination', {
          isActive: true,
        })
      ).catch(() => ({ data: [] }));
      
      const roomsData = Array.isArray(result?.data) ? result.data : (Array.isArray(result) ? result : []);
      const rooms = roomsData.filter((r: any) => 
        r.isActive !== false && r.isDeleted !== true
      );
      
      const statusMap = new Map<string, number>();
      const allStatuses = Object.values(RoomStatus);
      
      allStatuses.forEach((status) => {
        statusMap.set(status, 0);
      });
      
      rooms.forEach((room: any) => {
        const status = room.status || 'Unknown';
        if (statusMap.has(status)) {
          statusMap.set(status, (statusMap.get(status) || 0) + 1);
        } else {
          statusMap.set(status, 1);
        }
      });
      
      return Array.from(statusMap.entries()).map(([status, count]) => ({ status, count }));
    } catch (error) {
      this.logger.error('Error fetching rooms by status:', error);
      return [];
    }
  }

  private async getEncountersByStatus(): Promise<Array<{ status: string; count: number }>> {
    try {
      const result = await firstValueFrom(
        this.patientService.send('PatientService.Encounter.FindAll', {})
      ).catch(() => []);
      
      const encountersData = Array.isArray(result?.data) ? result.data : (Array.isArray(result) ? result : []);
      const encounters = encountersData.filter((e: any) => 
        e.isActive !== false && e.isDeleted !== true
      );
      
      const statusMap = new Map<string, number>();
      const allStatuses = Object.values(EncounterStatus);
      
      allStatuses.forEach((status) => {
        statusMap.set(status, 0);
      });
      
      encounters.forEach((encounter: any) => {
        const status = encounter.status || encounter.encounterStatus || 'Unknown';
        if (statusMap.has(status)) {
          statusMap.set(status, (statusMap.get(status) || 0) + 1);
        } else {
          statusMap.set(status, (statusMap.get(status) || 0) + 1);
        }
      });
      
      return Array.from(statusMap.entries()).map(([status, count]) => ({ status, count }));
    } catch (error) {
      this.logger.error('Error fetching encounters by status:', error);
      return [];
    }
  }

}

