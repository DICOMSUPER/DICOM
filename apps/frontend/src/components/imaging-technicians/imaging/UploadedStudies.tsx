"use client";

import React, { useEffect } from "react";
import SmallBreadCrumb from "@/components/common/SmallBreadCrumb";
import { Folder, File } from "lucide-react";
import Link from "next/link";
import { DicomStudy } from "@/interfaces/image-dicom/dicom-study.interface";
import { DicomSeries } from "@/interfaces/image-dicom/dicom-series.interface";
import { DicomInstance } from "@/interfaces/image-dicom/dicom-instances.interface";
import StudyLevel from "./study-level";
import SeriesLevel from "./series-level";
import InstancesLevel from "./instance-level";
import { toast } from "sonner";
interface UploadedStudiesProps {
  studies: DicomStudy[];
  series: DicomSeries[];
  instances: DicomInstance[];
  selectedStudy: DicomStudy | null;
  selectedSeries: DicomSeries | null;
  onStudySelect: (study: DicomStudy | null) => void;
  onSeriesSelect: (series: DicomSeries | null) => void;
}

export default function UploadedStudies({
  studies,
  series,
  instances,
  selectedStudy,
  selectedSeries,
  onStudySelect,
  onSeriesSelect,
}: UploadedStudiesProps) {
  // Derive current level from selections
  const currentLevel = selectedSeries
    ? "instances"
    : selectedStudy
    ? "series"
    : "studies";

  // Generate breadcrumb items
  const getBreadcrumbItems = () => {
    const items = [
      {
        label: "Studies",
        customOnclick: () => {
          onStudySelect(null);
          onSeriesSelect(null);
        },
      },
    ];

    if (selectedStudy) {
      items.push({
        label: selectedStudy.studyDescription || `Study ${selectedStudy.id}`,
        customOnclick: () => {
          onSeriesSelect(null);
        },
      });
    }

    if (selectedSeries) {
      items.push({
        label:
          selectedSeries.seriesDescription || `Series ${selectedSeries.id}`,
        customOnclick: () => {}, // Already at instances level
      });
    }

    return items;
  };

  // Handle study click
  const handleStudyClick = (study: DicomStudy) => {
    onStudySelect(study);
    onSeriesSelect(null); // Reset series when selecting a new study
  };

  // Handle series click
  const handleSeriesClick = (series: DicomSeries) => {
    onSeriesSelect(series);
  };

  // Render current level content
  const renderCurrentLevel = () => {
    if (currentLevel === "studies") {
      return (
        <StudyLevel studies={studies} handleStudyClick={handleStudyClick} />
      );
    }

    if (currentLevel === "series" && selectedStudy) {
      return (
        <SeriesLevel
          series={series}
          handleSeriesClick={handleSeriesClick}
        ></SeriesLevel>
      );
    }

    if (currentLevel === "instances" && selectedSeries) {
      return (
        <InstancesLevel
          instances={instances}
          selectedSeries={selectedSeries}
          selectedStudy={selectedStudy}
        />
      );
    }

    return null;
  };

  return (
    <div className="bg-[var(--background)] rounded-lg shadow-lg p-6 border border-[var(--border)]">
      <h3 className="text-lg font-semibold mb-4 text-[var(--foreground)]">
        Uploaded Studies
      </h3>

      {/* Breadcrumb Navigation */}
      {studies && studies.length > 0 && (
        <SmallBreadCrumb list={getBreadcrumbItems()} />
      )}

      {/* Current Level Content */}
      <div className="mt-4">{renderCurrentLevel()}</div>
    </div>
  );
}
