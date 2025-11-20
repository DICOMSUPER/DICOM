"use client";

import React, { useMemo, useState } from "react";
import { DicomStudy } from "@/interfaces/image-dicom/dicom-study.interface";
import { DicomSeries } from "@/interfaces/image-dicom/dicom-series.interface";
import { DicomInstance } from "@/interfaces/image-dicom/dicom-instances.interface";
import StudyLevel from "./study-level";
import SeriesLevel from "./series-level";
import InstancesLevel from "./instance-level";

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
}: UploadedStudiesProps) {
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

  const seriesForSelectedStudy = useMemo(() => {
    if (!selectedStudy) return [];
    // series prop already reflects selectedStudy from parent hook
    return series.filter((s) => s.studyId === selectedStudy.id || true);
  }, [series, selectedStudy]);

  return (
    <div className="bg-white rounded-lg border border-gray-200 mb-8">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-base font-semibold text-gray-900">
          Uploaded Studies
        </h3>
      </div>

      <div className="divide-y divide-gray-200">
        {studies.map((study) => {
          const isStudyExpanded = !!expandedStudies[study.id];
          const name =
            study.studyDescription ||
            study.studyInstanceUid ||
            `Study ${study.id}`;
          const date = study.studyDate;
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
                date={date}
                seriesCount={study.numberOfSeries ?? studySeries.length}
                isLast={isLast}
                refetch={refetchStudy}
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
    </div>
  );
}
