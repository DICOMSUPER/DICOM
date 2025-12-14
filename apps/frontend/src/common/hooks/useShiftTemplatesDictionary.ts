"use client";

import { useMemo } from "react";
import type { ShiftTemplate } from "@/common/interfaces/schedule/schedule.interface";
import { useGetShiftTemplatesQuery } from "@/store/scheduleApi";

interface UseShiftTemplatesDictionaryOptions {
  skip?: boolean;
  limit?: number;
}

export function useShiftTemplatesDictionary(
  options?: UseShiftTemplatesDictionaryOptions
) {
  const {
    data,
    isLoading,
    isFetching,
    error,
  } = useGetShiftTemplatesQuery(
    {
      page: 1,
      limit: options?.limit ?? 200,
      is_active: true,
    },
    {
      skip: options?.skip,
    }
  );

  const shiftTemplates: ShiftTemplate[] = useMemo(() => {
    if (!data) return [];
    if (Array.isArray((data as any)?.data)) {
      return (data as any).data;
    }
    if (Array.isArray(data)) {
      return data as ShiftTemplate[];
    }
    return [];
  }, [data]);

  const shiftTemplateMap = useMemo(() => {
    return shiftTemplates.reduce<Record<string, ShiftTemplate>>((acc, template) => {
      acc[template.shift_template_id] = template;
      return acc;
    }, {});
  }, [shiftTemplates]);

  return {
    shiftTemplates,
    shiftTemplateMap,
    isLoading: isLoading || isFetching,
    error,
  };
}

