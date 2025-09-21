'use client';

import { useState, useMemo } from 'react';
import { QueueFilters } from '@/interfaces/patient/patient-visit.interface';
import { QueueAssignment } from '@/interfaces/patient/queue.interface';
import { mockQueueData } from '@/data/mock-queue';
import { QueueStatus, VisitType } from '@/enums/patient.enum';

export function useQueue() {
  const [queueItems] = useState<QueueAssignment[]>(mockQueueData);

  const [stats, setStats] = useState<Record<QueueStatus, number>>({
    [QueueStatus.WAITING]: 0,
    [QueueStatus.COMPLETED]: 0,
  });

  const [searchQueries, setSearchQueries] = useState({
    regId: '',
    mobileNo: '',
    name: ''
  });

  const [filters, setFilters] = useState<QueueFilters>({
    status: 'All',
    visitType: 'All',
    period: 'today'
  });

  const filteredQueueItems = useMemo(() => {
    return queueItems.filter((item) => {
      const patient = item.visit.patient;

      // Search filters
      const matchesRegId =
        !searchQueries.regId ||
        patient.patient_code?.toLowerCase().includes(searchQueries.regId.toLowerCase());

      const matchesMobile =
        !searchQueries.mobileNo ||
        patient.phone?.includes(searchQueries.mobileNo);

      const fullName = `${patient.first_name} ${patient.last_name}`.toLowerCase();
      const matchesName =
        !searchQueries.name ||
        fullName.includes(searchQueries.name.toLowerCase());

      // Status filter
      const matchesStatus =
        !filters.status ||
        filters.status === 'All' ||
        item.status === filters.status;

      // Visit type filter
      const matchesVisitType =
        !filters.visitType ||
        filters.visitType === 'All' ||
        item.visit.visit_type === filters.visitType;

      return (
        matchesRegId &&
        matchesMobile &&
        matchesName &&
        matchesStatus &&
        matchesVisitType
      );
    });
  }, [queueItems, searchQueries, filters]);

  const handleSearchChange = (field: string, value: string) => {
    setSearchQueries((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFiltersChange = (newFilters: QueueFilters) => {
    setFilters(newFilters);
  };

  const handleReset = () => {
    setSearchQueries({
      regId: '',
      mobileNo: '',
      name: '',
    });
    setFilters({
      status: 'All',
      visitType: 'All',
      period: 'today',
    });
  };

  return {
    queueItems: filteredQueueItems,
    stats,
    searchQueries,
    filters,
    handleSearchChange,
    handleFiltersChange,
    handleReset,
  };
}
