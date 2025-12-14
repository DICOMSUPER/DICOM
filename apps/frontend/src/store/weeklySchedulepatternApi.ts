import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "@/common/lib/axiosBaseQuery";
import { PaginatedResponse, QueryParams } from "@/common/interfaces/pagination/pagination.interface";
import { mapApiResponse } from "@/common/utils/adpater";
import { CreateWeeklySchedulePatternDto, UpdateWeeklySchedulePatternDto, WeeklySchedulePattern } from "@/common/interfaces/user/week-schedule-pattern.interface";



// ====== RTK QUERY API ======
export const weeklySchedulePatternApi = createApi({
  reducerPath: "weeklySchedulePatternApi",
  baseQuery: axiosBaseQuery("/weekly-schedule-patterns"),
  tagTypes: ["WeeklySchedulePattern"],
  endpoints: (builder) => ({
    // Get all weekly schedule patterns with filters
    getWeeklySchedulePatterns: builder.query<
      PaginatedResponse<WeeklySchedulePattern>,
      QueryParams
    >({
      query: (params) => ({
        url: "",
        method: "GET",
        params,
      }),
      transformResponse: (response: any) =>
        mapApiResponse<WeeklySchedulePattern>(response),
      providesTags: ["WeeklySchedulePattern"],
    }),

    // Get weekly schedule pattern by ID
    getWeeklySchedulePatternById: builder.query<WeeklySchedulePattern, string>({
      query: (id) => ({
        url: `/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [
        { type: "WeeklySchedulePattern", id },
      ],
    }),

    // Create new weekly schedule pattern
    createWeeklySchedulePattern: builder.mutation<
      WeeklySchedulePattern,
      CreateWeeklySchedulePatternDto
    >({
      query: (data) => ({
        url: "",
        method: "POST",
        data,
      }),
      invalidatesTags: ["WeeklySchedulePattern"],
    }),

    // Update weekly schedule pattern
    updateWeeklySchedulePattern: builder.mutation<
      WeeklySchedulePattern,
      { id: string; data: UpdateWeeklySchedulePatternDto }
    >({
      query: ({ id, data }) => ({
        url: `/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "WeeklySchedulePattern", id },
        "WeeklySchedulePattern",
      ],
    }),

    // Delete weekly schedule pattern
    deleteWeeklySchedulePattern: builder.mutation<void, string>({
      query: (id: string) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["WeeklySchedulePattern"],
    }),
  }),
});

// ====== AUTO-GENERATED HOOKS ======
export const {
  useGetWeeklySchedulePatternsQuery,
  useGetWeeklySchedulePatternByIdQuery,
  useCreateWeeklySchedulePatternMutation,
  useUpdateWeeklySchedulePatternMutation,
  useDeleteWeeklySchedulePatternMutation,
} = weeklySchedulePatternApi;
