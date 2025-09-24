"use client";

import React, { useState } from "react";
import SmallBreadCrumb from "@/components/common/SmallBreadCrumb";
import { Folder, File } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function UploadedStudies({ studies }: { studies?: any[] }) {
  // Navigation state
  const [currentLevel, setCurrentLevel] = useState<
    "studies" | "series" | "instances"
  >("studies");
  const [selectedStudy, setSelectedStudy] = useState<any>(null);
  const [selectedSeries, setSelectedSeries] = useState<any>(null);

  // Generate breadcrumb items
  const getBreadcrumbItems = () => {
    const items = [
      {
        label: "Studies",
        customOnclick: () => {
          setCurrentLevel("studies");
          setSelectedStudy(null);
          setSelectedSeries(null);
        },
      },
    ];

    if (selectedStudy) {
      items.push({
        label:
          selectedStudy.study_description || `Study ${selectedStudy.study_id}`,
        customOnclick: () => {
          setCurrentLevel("series");
          setSelectedSeries(null);
        },
      });
    }

    if (selectedSeries) {
      items.push({
        label:
          selectedSeries.series_description ||
          `Series ${selectedSeries.series_id}`,
        customOnclick: () => setCurrentLevel("instances"),
      });
    }

    return items;
  };

  // Handle navigation
  const handleStudyClick = (study: any) => {
    setSelectedStudy(study);
    setCurrentLevel("series");
    setSelectedSeries(null);
  };

  const handleSeriesClick = (series: any) => {
    setSelectedSeries(series);
    setCurrentLevel("instances");
  };

  // Render current level content
  const renderCurrentLevel = () => {
    if (currentLevel === "studies") {
      return (
        <div className="space-y-2">
          {studies && studies.length > 0 ? (
            studies.map((study) => (
              <div
                key={study.study_id}
                className="group flex items-center cursor-pointer p-3 rounded-lg border border-[var(--border)] bg-[var(--background)] hover:bg-[var(--surface)] hover:border-[var(--primary)] hover:shadow-md transition-all duration-200 ease-in-out"
                onClick={() => handleStudyClick(study)}
              >
                <div className="text-[var(--primary)] group-hover:text-[var(--primary)] transition-colors duration-200">
                  <Folder className="w-5 h-5 text-blue-500" />
                </div>
                <span className="ml-2 font-medium text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors duration-200">
                  {study.study_description || `Study ${study.study_id}`}
                </span>
                <span className="ml-auto text-sm text-[var(--neutral)] group-hover:text-[var(--secondary)] transition-colors duration-200">
                  {study.series.length} series
                </span>
              </div>
            ))
          ) : (
            <div className="bg-[var(--surface)] rounded-lg shadow p-6 border border-[var(--border)] cursor-not-allowed border-dashed">
              <h6 className="italic text-center font-semibold text-[var(--neutral)]">
                No studies uploaded yet
              </h6>
            </div>
          )}
        </div>
      );
    }

    if (currentLevel === "series" && selectedStudy) {
      return (
        <div className="space-y-2">
          {selectedStudy.series.map((series: any) => (
            <div
              key={series.series_id}
              className="group flex items-center cursor-pointer p-3 rounded-lg border border-[var(--border)] bg-[var(--background)] hover:bg-[var(--surface)] hover:border-[var(--primary)] hover:shadow-md transition-all duration-200 ease-in-out"
              onClick={() => handleSeriesClick(series)}
            >
              <div className="text-[var(--primary)] group-hover:text-[var(--primary)] transition-colors duration-200">
                <Folder className="w-5 h-5 text-blue-500" />
              </div>
              <span className="ml-2 font-medium text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors duration-200">
                {series.series_description || `Series ${series.series_id}`}
              </span>
              <span className="ml-auto text-sm text-[var(--neutral)] group-hover:text-[var(--secondary)] transition-colors duration-200">
                {series.instances.length} instances
              </span>
            </div>
          ))}
        </div>
      );
    }

    if (currentLevel === "instances" && selectedSeries) {
      return (
        <div className="space-y-2 cursor-pointer">
          {selectedSeries.instances.map((instance: any) => (
            <Link
              href={`/viewer2?StudyInstanceUIDs=${instance.sop_instance_uid}`}
              key={instance.instance_id}
            >
              <div className="flex items-center p-3 rounded-lg border border-[var(--border)] bg-[var(--surface)]">
                <div className="text-[var(--neutral)]">
                  <File className="w-5 h-5 text-blue-500" />
                </div>
                <span className="ml-2 text-[var(--foreground)]">
                  {instance.file_name || `Instance ${instance.instance_id}`}
                </span>
                <span className="ml-auto text-sm text-[var(--neutral)]">
                  {instance.rows}x{instance.columns}
                </span>
                <Button className="ml-5" variant={"destructive"}>
                  Recapture Required
                </Button>
              </div>
            </Link>
          ))}
        </div>
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
