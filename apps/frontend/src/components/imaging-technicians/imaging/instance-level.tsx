import { DicomInstance } from "@/interfaces/image-dicom/dicom-instances.interface";
import { DicomSeries } from "@/interfaces/image-dicom/dicom-series.interface";
import { DicomStudy } from "@/interfaces/image-dicom/dicom-study.interface";
import { File } from "lucide-react";
import Link from "next/link";
import React from "react";

export default function InstancesLevel({
  instances,
  selectedStudy,
  selectedSeries,
}: {
  instances: DicomInstance[];
  selectedStudy: DicomStudy | null;
  selectedSeries: DicomSeries | null;
}) {
  return (
    <div className="space-y-2 cursor-pointer">
      {instances && instances.length > 0 ? (
        instances.map((instance) => (
          <Link
            href={`/viewer?study=${selectedStudy?.id}&series=${selectedSeries?.id}&instance=${instance.id}`}
            key={instance.id}
          >
            <div className="flex items-center p-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--background)] hover:border-[var(--primary)] hover:shadow-md transition-all duration-200 ease-in-out">
              <div className="text-[var(--neutral)]">
                <File className="w-5 h-5 text-blue-500" />
              </div>
              <span
                className="ml-2 text-[var(--foreground)]"
                title={instance.fileName}
              >
                {`...${instance.fileName.slice(-10)}` ||
                  `Instance ${instance.id}`}
              </span>
              <span className="ml-auto text-sm text-[var(--neutral)]">
                {instance.rows}x{instance.columns}
              </span>
            </div>
          </Link>
        ))
      ) : (
        <div className="bg-[var(--surface)] rounded-lg shadow p-6 border border-[var(--border)] cursor-not-allowed border-dashed">
          <h6 className="italic text-center font-semibold text-[var(--neutral)]">
            No instances found for this series
          </h6>
        </div>
      )}
    </div>
  );
}
