'use client';

import { StatsCards } from '@/components/ui/stats-cards';
import { FileText, CheckCircle, Clock, UserCheck, Printer, Scan } from 'lucide-react';
import { DicomStudyStatsInDateRange } from '@/interfaces/patient/patient-workflow.interface';

interface StudyStatsCardsProps {
  stats: DicomStudyStatsInDateRange | undefined;
  isLoading?: boolean;
}

export function StudyStatsCards({ stats, isLoading = false }: StudyStatsCardsProps) {
  const todayStats = stats?.today || {
    totalDicomStudies: 0,
    totalScannedStudies: 0,
    totalPendingApprovalStudies: 0,
    totalApprovedStudies: 0,
    totalTechnicianVerifiedStudies: 0,
    totalResultPrintedStudies: 0,
  };

  const totalStats = stats?.total || {
    totalDicomStudies: 0,
    totalScannedStudies: 0,
    totalPendingApprovalStudies: 0,
    totalApprovedStudies: 0,
    totalTechnicianVerifiedStudies: 0,
    totalResultPrintedStudies: 0,
  };

  const statsData = [
    {
      title: 'Total Studies',
      value: `${todayStats.totalDicomStudies} / ${totalStats.totalDicomStudies}`,
      description: 'Today / All time',
      icon: FileText,
      isLoading,
    },
    {
      title: 'Scanned',
      value: `${todayStats.totalScannedStudies} / ${totalStats.totalScannedStudies}`,
      description: 'Today / All time',
      icon: Scan,
      isLoading,
    },
    {
      title: 'Pending Approval',
      value: `${todayStats.totalPendingApprovalStudies} / ${totalStats.totalPendingApprovalStudies}`,
      description: 'Today / All time',
      icon: Clock,
      isLoading,
    },
    {
      title: 'Approved',
      value: `${todayStats.totalApprovedStudies} / ${totalStats.totalApprovedStudies}`,
      description: 'Today / All time',
      icon: CheckCircle,
      isLoading,
    },
    {
      title: 'Technician Verified',
      value: `${todayStats.totalTechnicianVerifiedStudies} / ${totalStats.totalTechnicianVerifiedStudies}`,
      description: 'Today / All time',
      icon: UserCheck,
      isLoading,
    },
    {
      title: 'Result Printed',
      value: `${todayStats.totalResultPrintedStudies} / ${totalStats.totalResultPrintedStudies}`,
      description: 'Today / All time',
      icon: Printer,
      isLoading,
    },
  ];

  return <StatsCards stats={statsData} className="lg:grid-cols-3 xl:grid-cols-6" />;
}

