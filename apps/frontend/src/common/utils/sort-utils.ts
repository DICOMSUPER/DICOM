import { SortConfig } from '@/components/ui/data-table';

export function mapSortFieldToBackend(field: string): string {
  if (field.includes('.')) {
    const parts = field.split('.');
    return parts[0] + parts.slice(1).map(p => p.charAt(0).toUpperCase() + p.slice(1)).join('');
  }
  
  return field;
}

export function sortConfigToQueryParams(sortConfig: SortConfig | null | undefined): {
  sortBy?: string;
  order?: 'asc' | 'desc';
} {
  if (!sortConfig?.field || !sortConfig.direction) {
    return {};
  }

  return {
    sortBy: mapSortFieldToBackend(sortConfig.field),
    order: sortConfig.direction,
  };
}


