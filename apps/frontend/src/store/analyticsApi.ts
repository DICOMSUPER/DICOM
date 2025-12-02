import { axiosBaseQuery } from "@/lib/axiosBaseQuery";
import { createApi } from "@reduxjs/toolkit/query/react";
import { ApiResponse } from "@/interfaces/patient/patient-workflow.interface";

export interface AnalyticsStats {
  totalUsers: number;
  totalDepartments: number;
  totalRooms: number;
  totalServices: number;
  totalPatients: number;
  activePatients: number;
  newPatientsThisMonth: number;
  inactivePatients: number;
  totalEncounters: number;
  todayEncounters: number;
  todayStatEncounters: number;
  encountersThisMonth: number;
}

export interface ChartDataPoint {
  date: string;
  encounters: number;
  patients: number;
}

export interface AnalyticsData {
  stats: AnalyticsStats;
  encountersOverTime: ChartDataPoint[];
  patientsOverTime: ChartDataPoint[];
  encountersByType: { type: string; count: number }[];
  departmentsDistribution?: { name: string; count: number }[];
  roomsByStatus?: { status: string; count: number }[];
  encountersByStatus?: { status: string; count: number }[];
}

export interface GetAnalyticsParams {
  period?: 'week' | 'month' | 'year';
  value?: string;
}

export const analyticsApi = createApi({
  reducerPath: "analyticsApi",
  baseQuery: axiosBaseQuery("/analytics"),
  tagTypes: ["AnalyticsStats"],
  endpoints: (builder) => ({
    getAnalytics: builder.query<ApiResponse<AnalyticsData>, GetAnalyticsParams | void>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params?.period) queryParams.append('period', params.period);
        if (params?.value) queryParams.append('value', params.value);
        const queryString = queryParams.toString();
        return {
          url: `/stats${queryString ? `?${queryString}` : ''}`,
          method: "GET",
        };
      },
      providesTags: ["AnalyticsStats"],
    }),
    getReceptionAnalytics: builder.query<ApiResponse<AnalyticsData>, GetAnalyticsParams | void>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params?.period) queryParams.append('period', params.period);
        if (params?.value) queryParams.append('value', params.value);
        const queryString = queryParams.toString();
        return {
          url: `/reception-stats${queryString ? `?${queryString}` : ''}`,
          method: "GET",
        };
      },
      providesTags: ["AnalyticsStats"],
    }),
    getPhysicianAnalytics: builder.query<ApiResponse<PhysicianAnalyticsData>, GetAnalyticsParams | void>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params?.period) queryParams.append('period', params.period);
        if (params?.value) queryParams.append('value', params.value);
        const queryString = queryParams.toString();
        return {
          url: `/physician-stats${queryString ? `?${queryString}` : ''}`,
          method: "GET",
        };
      },
      providesTags: ["AnalyticsStats"],
    }),
  }),
});

export interface PhysicianAnalyticsStats {
  totalPatients: number;
  activePatients: number;
  todayEncounters: number;
  pendingEncounters: number;
  completedReports: number;
  pendingReports: number;
  totalImagingOrders: number;
  pendingImagingOrders: number;
  completedImagingOrders: number;
}

export interface PhysicianChartDataPoint {
  date: string;
  encounters?: number;
  reports?: number;
  imagingOrders?: number;
}

export interface PhysicianAnalyticsData {
  stats: PhysicianAnalyticsStats;
  encountersOverTime: PhysicianChartDataPoint[];
  reportsOverTime: PhysicianChartDataPoint[];
  imagingOrdersOverTime: PhysicianChartDataPoint[];
  encountersByStatus?: { status: string; count: number }[];
  reportsByStatus?: { status: string; count: number }[];
  imagingOrdersByStatus?: { status: string; count: number }[];
}

export const { useGetAnalyticsQuery, useGetReceptionAnalyticsQuery, useGetPhysicianAnalyticsQuery } = analyticsApi;

