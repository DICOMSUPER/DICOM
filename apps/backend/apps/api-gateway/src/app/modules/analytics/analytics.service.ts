import { Injectable, Inject, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { RoomStatus } from '@backend/shared-domain';
import { EncounterStatus, OrderStatus, DiagnosisStatus } from '@backend/shared-enums';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger('AnalyticsService');

  constructor(
    @Inject(process.env.USER_SERVICE_NAME || 'USER_SERVICE')
    private readonly userService: ClientProxy,
    @Inject(process.env.PATIENT_SERVICE_NAME || 'PATIENT_SERVICE')
    private readonly patientService: ClientProxy,
    @Inject(process.env.IMAGING_SERVICE_NAME || 'IMAGING_SERVICE')
    private readonly imagingService: ClientProxy,
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

      // Extract data from responses (handle both wrapped and unwrapped responses)
      const userStats = userStatsResult?.data || userStatsResult || {};
      const departmentStats = departmentStatsResult?.data || departmentStatsResult || {};
      const roomStats = roomStatsResult?.data || roomStatsResult || {};
      const serviceStats = serviceStatsResult?.data || serviceStatsResult || {};
      const patientStats = patientStatsResult?.data || patientStatsResult || {};
      const encounterStats = encounterStatsResult?.data || encounterStatsResult || {};

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
    dataType: 'encounters' | 'patients' | 'reports' | 'imagingOrders' = 'encounters'
  ): Array<{ date: string; encounters?: number; patients?: number; reports?: number; imagingOrders?: number }> {
    const dataKey = dataType === 'encounters' ? 'encounters' : 
                   dataType === 'patients' ? 'patients' :
                   dataType === 'reports' ? 'reports' : 'imagingOrders';
    
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
        const status = room.status;
        // Only count if status is a valid RoomStatus enum value
        if (status && Object.values(RoomStatus).includes(status)) {
          statusMap.set(status, (statusMap.get(status) || 0) + 1);
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
        const status = encounter.status || encounter.encounterStatus;
        // Only count if status is a valid EncounterStatus enum value
        if (status && Object.values(EncounterStatus).includes(status)) {
          statusMap.set(status, (statusMap.get(status) || 0) + 1);
        }
      });
      
      return Array.from(statusMap.entries()).map(([status, count]) => ({ status, count }));
    } catch (error) {
      this.logger.error('Error fetching encounters by status:', error);
      return [];
    }
  }

  async getReceptionAnalytics(period?: 'week' | 'month' | 'year', value?: string) {
    try {
      const [
        patientStatsResult,
        encounterStatsResult,
      ] = await Promise.all([
        firstValueFrom(
          this.patientService.send('PatientService.Patient.GetStats', {})
        ).catch(() => ({ data: null })),
        firstValueFrom(
          this.patientService.send('PatientService.Encounter.GetStats', {})
        ).catch(() => ({ data: null })),
      ]);

      // Extract data from responses (handle both wrapped and unwrapped responses)
      const patientStats = patientStatsResult?.data || patientStatsResult || {};
      const encounterStats = encounterStatsResult?.data || encounterStatsResult || {};

      const stats = {
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
      const encountersByStatus = await this.getEncountersByStatus();

      return {
        stats,
        encountersOverTime,
        patientsOverTime,
        encountersByType,
        encountersByStatus,
      };
    } catch (error) {
      this.logger.error('Error aggregating reception analytics data:', error);
      throw error;
    }
  }

  async getPhysicianAnalytics(period?: 'week' | 'month' | 'year', value?: string) {
    try {
      const [
        patientStatsResult,
        encounterStatsResult,
        diagnosisReportsResult,
        imagingOrdersResult,
      ] = await Promise.all([
        firstValueFrom(
          this.patientService.send('PatientService.Patient.GetStats', {})
        ).catch(() => null),
        firstValueFrom(
          this.patientService.send('PatientService.Encounter.GetStats', {})
        ).catch(() => null),
        firstValueFrom(
          this.patientService.send('PatientService.DiagnosisReport.GetStats', {})
        ).catch(() => null),
        firstValueFrom(
          this.imagingService.send('ImagingService.ImagingOrder.GetStats', {})
        ).catch(() => null),
      ]);

      // Extract data from responses (handle both wrapped and unwrapped responses)
      const patientStats = patientStatsResult?.data || patientStatsResult || {};
      const encounterStats = encounterStatsResult?.data || encounterStatsResult || {};
      const diagnosisStats = diagnosisReportsResult?.data || diagnosisReportsResult || {};
      const imagingStats = imagingOrdersResult?.data || imagingOrdersResult || {};

      // Calculate pending encounters from actual encounter data
      let pendingEncountersCount = 0;
      try {
        const allEncounters = await firstValueFrom(
          this.patientService.send('PatientService.Encounter.FindAll', {})
        ).catch(() => []);
        
        const encountersData = Array.isArray(allEncounters?.data) ? allEncounters.data : (Array.isArray(allEncounters) ? allEncounters : []);
        const pendingEncounters = encountersData.filter((e: any) => {
          if (e.isActive === false || e.isDeleted === true) return false;
          const status = e.status || e.encounterStatus;
          return status === EncounterStatus.WAITING || status === EncounterStatus.ARRIVED;
        });
        pendingEncountersCount = pendingEncounters.length;
      } catch (error) {
        this.logger.warn('Could not calculate pending encounters, using fallback', error);
      }

      // Calculate imaging order stats from FindAll data (GetStats might not exist)
      let totalImagingOrders = 0;
      let pendingImagingOrders = 0;
      let completedImagingOrders = 0;
      try {
        const allImagingOrders = await firstValueFrom(
          this.imagingService.send('ImagingService.ImagingOrder.FindAll', {})
        ).catch(() => []);
        
        const ordersData = Array.isArray(allImagingOrders?.data) ? allImagingOrders.data : (Array.isArray(allImagingOrders) ? allImagingOrders : []);
        const activeOrders = ordersData.filter((o: any) => o.isActive !== false && o.isDeleted !== true);
        totalImagingOrders = activeOrders.length;
        
        pendingImagingOrders = activeOrders.filter((o: any) => {
          const status = o.orderStatus || o.status;
          return status === OrderStatus.PENDING || status === OrderStatus.IN_PROGRESS;
        }).length;
        
        completedImagingOrders = activeOrders.filter((o: any) => {
          const status = o.orderStatus || o.status;
          return status === OrderStatus.COMPLETED;
        }).length;
      } catch (error) {
        this.logger.warn('Could not calculate imaging order stats, using fallback', error);
        // Fallback to stats from GetStats if available
        totalImagingOrders = imagingStats?.total || imagingStats?.totalOrders || 0;
        pendingImagingOrders = imagingStats?.pending || imagingStats?.pendingOrders || 0;
        completedImagingOrders = imagingStats?.completed || imagingStats?.completedOrders || 0;
      }

      const stats = {
        totalPatients: patientStats?.totalPatients || 0,
        activePatients: patientStats?.activePatients || 0,
        todayEncounters: encounterStats?.todayEncounter || encounterStats?.todayEncounters || 0,
        pendingEncounters: pendingEncountersCount,
        completedReports: diagnosisStats?.resolved || diagnosisStats?.completedReports || 0,
        pendingReports: diagnosisStats?.active || diagnosisStats?.pendingReports || 0,
        totalImagingOrders: totalImagingOrders,
        pendingImagingOrders: pendingImagingOrders,
        completedImagingOrders: completedImagingOrders,
      };

      const { startDate, endDate } = this.calculateDateRange(period, value);
      
      let encountersOverTimeData: any = { data: [] };
      let reportsOverTimeData: any = { data: [] };
      let imagingOrdersOverTimeData: any = { data: [] };
      
      try {
        const [allEncounters, allReports, allImagingOrders] = await Promise.all([
          firstValueFrom(
            this.patientService.send('PatientService.Encounter.FindAll', {})
          ).catch(() => []),
          firstValueFrom(
            this.patientService.send('PatientService.DiagnosisReport.FindAll', {})
          ).catch(() => []),
          firstValueFrom(
            this.imagingService.send('ImagingService.ImagingOrder.FindAll', {})
          ).catch(() => []),
        ]);
        
        const encountersData = Array.isArray(allEncounters?.data) ? allEncounters.data : (Array.isArray(allEncounters) ? allEncounters : []);
        const reportsData = Array.isArray(allReports?.data) ? allReports.data : (Array.isArray(allReports) ? allReports : []);
        const imagingOrdersData = Array.isArray(allImagingOrders?.data) ? allImagingOrders.data : (Array.isArray(allImagingOrders) ? allImagingOrders : []);
        
        const filteredEncounters = encountersData.filter((e: any) => {
          if (e.isActive === false || e.isDeleted === true) return false;
          const encounterDate = e.createdAt || e.encounterDate || e.date;
          if (!encounterDate) return false;
          const date = new Date(encounterDate).toISOString().split('T')[0];
          return date >= startDate && date <= endDate;
        });
        
        const filteredReports = reportsData.filter((r: any) => {
          if (r.isActive === false || r.isDeleted === true) return false;
          const reportDate = r.createdAt || r.diagnosisDate || r.date;
          if (!reportDate) return false;
          const date = new Date(reportDate).toISOString().split('T')[0];
          return date >= startDate && date <= endDate;
        });
        
        const filteredImagingOrders = imagingOrdersData.filter((o: any) => {
          if (o.isActive === false || o.isDeleted === true) return false;
          const orderDate = o.createdAt || o.orderDate || o.date;
          if (!orderDate) return false;
          const date = new Date(orderDate).toISOString().split('T')[0];
          return date >= startDate && date <= endDate;
        });
        
        const encounterDateMap = new Map<string, number>();
        const reportDateMap = new Map<string, number>();
        const imagingOrderDateMap = new Map<string, number>();
        
        filteredEncounters.forEach((e: any) => {
          const encounterDate = e.createdAt || e.encounterDate || e.date;
          if (encounterDate) {
            const date = new Date(encounterDate).toISOString().split('T')[0];
            encounterDateMap.set(date, (encounterDateMap.get(date) || 0) + 1);
          }
        });
        
        filteredReports.forEach((r: any) => {
          const reportDate = r.createdAt || r.diagnosisDate || r.date;
          if (reportDate) {
            const date = new Date(reportDate).toISOString().split('T')[0];
            reportDateMap.set(date, (reportDateMap.get(date) || 0) + 1);
          }
        });
        
        filteredImagingOrders.forEach((o: any) => {
          const orderDate = o.createdAt || o.orderDate || o.date;
          if (orderDate) {
            const date = new Date(orderDate).toISOString().split('T')[0];
            imagingOrderDateMap.set(date, (imagingOrderDateMap.get(date) || 0) + 1);
          }
        });
        
        encountersOverTimeData = {
          data: Array.from(encounterDateMap.entries()).map(([date, count]) => ({
            date,
            count,
            encounters: count,
          })),
        };
        
        reportsOverTimeData = {
          data: Array.from(reportDateMap.entries()).map(([date, count]) => ({
            date,
            count,
            reports: count,
          })),
        };
        
        imagingOrdersOverTimeData = {
          data: Array.from(imagingOrderDateMap.entries()).map(([date, count]) => ({
            date,
            count,
            imagingOrders: count,
          })),
        };
      } catch (error) {
        this.logger.warn('Could not fetch physician data by date range, using fallback', error);
      }

      const encountersOverTime = this.processTimeSeriesData(
        encountersOverTimeData?.data || [],
        period,
        startDate,
        endDate,
        'encounters'
      );
      const reportsOverTime = this.processTimeSeriesData(
        reportsOverTimeData?.data || [],
        period,
        startDate,
        endDate,
        'reports'
      );
      const imagingOrdersOverTime = this.processTimeSeriesData(
        imagingOrdersOverTimeData?.data || [],
        period,
        startDate,
        endDate,
        'imagingOrders'
      );
      
      const encountersByStatus = await this.getEncountersByStatus();
      const reportsByStatus = await this.getReportsByStatus();
      const imagingOrdersByStatus = await this.getImagingOrdersByStatus();

      return {
        stats,
        encountersOverTime,
        reportsOverTime,
        imagingOrdersOverTime,
        encountersByStatus,
        reportsByStatus,
        imagingOrdersByStatus,
      };
    } catch (error) {
      this.logger.error('Error aggregating physician analytics data:', error);
      throw error;
    }
  }

  private async getReportsByStatus(): Promise<Array<{ status: string; count: number }>> {
    try {
      const result = await firstValueFrom(
        this.patientService.send('PatientService.DiagnosisReport.FindAll', {})
      ).catch(() => []);
      
      const reportsData = Array.isArray(result?.data) ? result.data : (Array.isArray(result) ? result : []);
      const reports = reportsData.filter((r: any) => 
        r.isActive !== false && r.isDeleted !== true
      );
      
      const statusMap = new Map<string, number>();
      
      reports.forEach((report: any) => {
        const status = report.diagnosisStatus || report.status;
        // Only count if status is a valid DiagnosisStatus enum value
        if (status && Object.values(DiagnosisStatus).includes(status)) {
          statusMap.set(status, (statusMap.get(status) || 0) + 1);
        }
      });
      
      return Array.from(statusMap.entries()).map(([status, count]) => ({ status, count }));
    } catch (error) {
      this.logger.error('Error fetching reports by status:', error);
      return [];
    }
  }

  private async getImagingOrdersByStatus(): Promise<Array<{ status: string; count: number }>> {
    try {
      const result = await firstValueFrom(
        this.imagingService.send('ImagingService.ImagingOrder.FindAll', {})
      ).catch(() => []);
      
      const ordersData = Array.isArray(result?.data) ? result.data : (Array.isArray(result) ? result : []);
      const orders = ordersData.filter((o: any) => 
        o.isActive !== false && o.isDeleted !== true
      );
      
      const statusMap = new Map<string, number>();
      
      orders.forEach((order: any) => {
        const status = order.orderStatus || order.status;
        // Only count if status is a valid OrderStatus enum value
        if (status && Object.values(OrderStatus).includes(status)) {
          statusMap.set(status, (statusMap.get(status) || 0) + 1);
        }
      });
      
      return Array.from(statusMap.entries()).map(([status, count]) => ({ status, count }));
    } catch (error) {
      this.logger.error('Error fetching imaging orders by status:', error);
      return [];
    }
  }

}

