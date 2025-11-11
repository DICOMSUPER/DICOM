import { DicomStudy } from "@/interfaces/image-dicom/dicom-study.interface";
import { Folder } from "lucide-react";
import React from "react";

export default function StudyLevel({
  studies,
  handleStudyClick,
}: {
  studies: DicomStudy[];
  handleStudyClick: (study: DicomStudy) => void;
}) {
  return (
    <div className="space-y-2">
      {studies && studies.length > 0 ? (
        studies.map((study) => (
          <div
            key={study.id}
            className="group flex items-center cursor-pointer p-3 rounded-lg border border-[var(--border)] bg-[var(--background)] hover:bg-[var(--surface)] hover:border-[var(--primary)] hover:shadow-md transition-all duration-200 ease-in-out"
            onClick={() => handleStudyClick(study)}
          >
            <div className="text-[var(--primary)] group-hover:text-[var(--primary)] transition-colors duration-200">
              <Folder className="w-5 h-5 text-blue-500" />
            </div>
            <span
              className="ml-2 font-medium text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors duration-200"
              title={`${study.studyInstanceUid} - [${study.studyDate}]`}
            >
              {study.studyDescription ||
                `Study ...${study.studyInstanceUid.slice(-7)}`}
            </span>
            <span className="ml-auto text-sm text-[var(--neutral)] group-hover:text-[var(--secondary)] transition-colors duration-200">
              {study.series?.length || 0} series
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
