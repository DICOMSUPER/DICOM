"use client";

import React, { useMemo, useState } from "react";
import { RefreshCw, FolderOpen, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DicomStudy } from "@/interfaces/image-dicom/dicom-study.interface";
import { DicomSeries } from "@/interfaces/image-dicom/dicom-series.interface";
import { DicomInstance } from "@/interfaces/image-dicom/dicom-instances.interface";
import StudyLevel from "./study-level";
import SeriesLevel from "./series-level";
import InstancesLevel from "./instance-level";
import SignatureModal from "./signature-modal";
import SetupSignatureModal from "./setup-signature-modal";

interface UploadedStudiesProps {
  studies: DicomStudy[];
  series: DicomSeries[];
  instances: DicomInstance[];
  selectedStudy: DicomStudy | null;
  selectedSeries: DicomSeries | null;
  onStudySelect: (study: DicomStudy | null) => void;
  onSeriesSelect: (series: DicomSeries | null) => void;
  refetchStudy: () => void;
  forwardingStudyId: string | null;
  setForwardingStudyId: (id: string) => void;
  isLoading?: boolean;
  isError?: boolean;
}

export default function UploadedStudies({
  studies,
  series,
  instances,
  selectedStudy,
  selectedSeries,
  onStudySelect,
  onSeriesSelect,
  refetchStudy,
  forwardingStudyId,
  setForwardingStudyId,
  isLoading = false,
  isError = false,
}: UploadedStudiesProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [expandedStudies, setExpandedStudies] = useState<
    Record<string, boolean>
  >({});
  const [expandedSeries, setExpandedSeries] = useState<Record<string, boolean>>(
    {}
  );

  const toggleStudy = (studyId: string) => {
    setExpandedStudies((prev) => {
      const willExpand = !prev[studyId];
      // accordion: only one study open at a time
      const next = willExpand ? { [studyId]: true } : {};
      return next;
    });

    const currentlyExpanded = !!expandedStudies[studyId];
    if (!currentlyExpanded) {
      // expanding → select study
      const study = studies.find((s) => s.id === studyId) || null;
      onStudySelect(study);
      // reset series expansion when switching study
      setExpandedSeries({});
      onSeriesSelect(null);
    } else {
      // collapsing → clear if it was the selected study
      if (selectedStudy?.id === studyId) {
        onStudySelect(null);
        onSeriesSelect(null);
      }
    }
  };

  const toggleSeries = (seriesId: string) => {
    setExpandedSeries((prev) => {
      const willExpand = !prev[seriesId];
      // accordion within current study: only one series open
      const next = willExpand ? { [seriesId]: true } : {};
      return next;
    });

    const currentlyExpanded = !!expandedSeries[seriesId];
    if (!currentlyExpanded) {
      // expanding → select series
      const ser = series.find((s) => s.id === seriesId) || null;
      if (ser) onSeriesSelect(ser);
    } else {
      // collapsing → clear if it was the selected series
      if (selectedSeries?.id === seriesId) {
        onSeriesSelect(null);
      }
    }
  };

  const formatCreatedAt = (date: string): string => {
    const dateObj = new Date(date);
    const [day, month, year] = dateObj.toLocaleDateString("vi-VN").split("/");
    return `${parseInt(day)}/${parseInt(month)}/${year.slice(2)}`;
  };

  const seriesForSelectedStudy = useMemo(() => {
    if (!selectedStudy) return [];
    // series prop already reflects selectedStudy from parent hook
    return series.filter((s) => s.studyId === selectedStudy.id || true);
  }, [series, selectedStudy]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetchStudy();
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-8">
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <h3 className="text-base font-semibold text-gray-900">
          Uploaded Studies
          {studies.length > 0 && (
            <span className="ml-2 text-sm font-normal text-gray-500">
              ({studies.length})
            </span>
          )}
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing || isLoading}
          className="h-8 px-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
        >
          <RefreshCw className={`h-4 w-4 mr-1.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="px-5 py-20 mx-auto flex flex-col justify-center items-center bg-gray-50/50 rounded-b-lg">
          <div className="p-4 bg-gray-100 rounded-full mb-4">
            <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
          </div>
          <span className="text-gray-500 font-medium">
            Loading studies...
          </span>
        </div>
      )}

      {/* Error State */}
      {isError && !isLoading && (
        <div className="px-5 py-20 mx-auto flex flex-col justify-center items-center bg-red-50/50 rounded-b-lg">
          <div className="p-4 bg-red-100 rounded-full mb-4">
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
          <span className="text-red-600 font-semibold mb-2">
            Failed to load studies
          </span>
          <p className="text-sm text-red-500 mb-4">
            An error occurred while fetching studies. Please try again.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className="border-red-200 text-red-600 hover:bg-red-50"
          >
            <RefreshCw className="h-4 w-4 mr-1.5" />
            Try Again
          </Button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !isError && studies.length === 0 && (
        <div className="px-5 py-20 mx-auto flex flex-col justify-center items-center bg-gray-50/50 rounded-b-lg">
          <div className="p-4 bg-gray-100 rounded-full mb-4">
            <FolderOpen className="h-8 w-8 text-gray-400" />
          </div>
          <span className="text-gray-600 font-semibold mb-1">
            No Studies Uploaded
          </span>
          <p className="text-sm text-gray-500">
            Upload DICOM files to see studies here
          </p>
        </div>
      )}

      {/* Studies List */}
      {!isLoading && !isError && studies.length > 0 && (
        <div className="divide-y divide-gray-200">
          {studies.map((study) => {
            const isStudyExpanded = !!expandedStudies[study.id];
            const name =
              study.studyDescription ||
              study.studyInstanceUid ||
              `Study ${study.id}`;
            const date = study.createdAt;
            const studySeries =
              selectedStudy?.id === study.id ? seriesForSelectedStudy : [];
            const isLast = studies[studies.length - 1] === study;
            return (
              <div key={study.id}>
                {/* Study Level */}
                <StudyLevel
                  study={study}
                  isExpanded={isStudyExpanded}
                  onToggle={toggleStudy}
                  name={name}
                  date={date ? formatCreatedAt(date.toString()) : 'N/A'}
                  seriesCount={study.numberOfSeries ?? studySeries.length}
                  isLast={isLast}
                  refetch={refetchStudy}
                  forwardingStudyId={forwardingStudyId}
                  setForwardingStudyId={setForwardingStudyId}
                />

                {/* Series Level - Hidden by default */}
                {isStudyExpanded && (
                  <div className="bg-gray-50 divide-y divide-gray-200">
                    {studySeries.map((ser) => {
                      const isSeriesExpanded = !!expandedSeries[ser.id];
                      const serName =
                        ser.seriesDescription ||
                        ser.seriesInstanceUid ||
                        `Series ${ser.id}`;
                      const seriesInstances =
                        selectedSeries?.id === ser.id ? instances : [];
                      const isLastSeries =
                        studySeries[studySeries.length - 1] === ser;
                      return (
                        <div key={ser.id}>
                          {/* Series Header */}
                          <SeriesLevel
                            series={ser}
                            isExpanded={isSeriesExpanded}
                            onToggle={toggleSeries}
                            name={serName}
                            instanceCount={
                              ser.numberOfInstances ?? seriesInstances.length
                            }
                            isLast={isLastSeries}
                          />

                          {/* Instances Level - Hidden by default */}
                          {isSeriesExpanded && (
                            <div className="bg-white border-t border-gray-200">
                              {seriesInstances.map((instance, index) => (
                                <InstancesLevel
                                  key={instance.id}
                                  instance={instance}
                                  isLast={index === seriesInstances.length - 1}
                                  selectedStudy={selectedStudy}
                                  selectedSeries={selectedSeries}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
