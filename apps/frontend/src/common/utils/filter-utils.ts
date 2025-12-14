import { PaginationParams } from "@/common/interfaces/pagination/pagination.interface";

export function cleanFilters<T extends Record<string, any>>(
  filters: T,
  options?: {
    removeEmptyStrings?: boolean;
    removeNullValues?: boolean;
    removeUndefined?: boolean;
    removeAllValue?: boolean;
    dateFields?: (keyof T)[];
  }
): Partial<T> {
  const {
    removeEmptyStrings = true,
    removeNullValues = true,
    removeUndefined = true,
    removeAllValue = true,
    dateFields = [],
  } = options || {};

  const cleaned: any = { ...filters };

  Object.keys(cleaned).forEach((key) => {
    const value = cleaned[key];

    if (removeEmptyStrings && value === "") {
      delete cleaned[key];
      return;
    }

    if (removeNullValues && value === null) {
      delete cleaned[key];
      return;
    }

    if (removeUndefined && value === undefined) {
      delete cleaned[key];
      return;
    }

    if (removeAllValue && value === "all") {
      delete cleaned[key];
      return;
    }

    if (
      dateFields.includes(key as keyof T) &&
      value &&
      typeof value === "string"
    ) {
      try {
        if (value.includes("T")) {
          cleaned[key] = value; // Already ISO
        } else {
          const date = new Date(value);
          if (!isNaN(date.getTime())) {
            cleaned[key] = date.toISOString();
          }
        }
      } catch (error) {
        console.warn(`Failed to convert ${key} to ISO string:`, error);
      }
    }
  });

  return cleaned;
}

export function prepareApiFilters<
  TFilters extends Record<string, any>,
  TPagination extends PaginationParams
>(
  filters: TFilters,
  pagination?: TPagination,
  options?: {
    dateFields?: (keyof TFilters)[];
    removeEmptyStrings?: boolean;
  }
): Partial<TFilters & TPagination> {
  const cleanedFilters = cleanFilters(filters, {
    ...options,
    removeEmptyStrings: options?.removeEmptyStrings ?? true,
    removeNullValues: true,
    removeUndefined: true,
    removeAllValue: true,
  });

  return {
    ...cleanedFilters,
    ...pagination,
  } as Partial<TFilters & TPagination>;
}