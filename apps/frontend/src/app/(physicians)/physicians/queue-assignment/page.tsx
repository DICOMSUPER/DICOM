'use client';


import { QueueFiltersSection } from '@/components/physicians/queue/queue-filters';
import { QueueStatsCards } from '@/components/physicians/queue/queue-stats';
import { QueueTable } from '@/components/physicians/queue/queue-table';
import { useQueue } from '@/hooks/use-queue';

export default function QueuePage() {
  const {
    queueItems,
    stats,
    searchQueries,
    filters,
    handleSearchChange,
    handleFiltersChange,
    handleReset,
  } = useQueue();

  const handleStartServing = (id: string) => {
    console.log('Start serving:', id);
    // TODO: Implement start serving functionality
  };

  const handleEdit = (id: string) => {
    console.log('Edit queue item:', id);
    // TODO: Implement edit functionality
  };

  const handleCancel = (id: string) => {
    console.log('Cancel queue item:', id);
    // TODO: Implement cancel functionality
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Medical Queue
            </h1>
            <div className="text-sm text-gray-500">
              General • Nov 23, 2022
            </div>
          </div>
        </div>

        {/* <QueueStatsCards stats={stats} /> */}
        
        <QueueFiltersSection
          searchQueries={searchQueries}
          filters={filters}
          onSearchChange={handleSearchChange}
          onFiltersChange={handleFiltersChange}
          onReset={handleReset}
        />

        <QueueTable
          queueItems={queueItems}
          onStartServing={handleStartServing}
          onEdit={handleEdit}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
}