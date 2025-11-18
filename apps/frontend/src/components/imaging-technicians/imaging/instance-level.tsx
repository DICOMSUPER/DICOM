import { DicomInstance } from "@/interfaces/image-dicom/dicom-instances.interface";
import { DicomSeries } from "@/interfaces/image-dicom/dicom-series.interface";
import { DicomStudy } from "@/interfaces/image-dicom/dicom-study.interface";
import { useRouter } from "next/navigation";
import React from "react";

export default function InstancesLevel({
  instance,
  isLast,
  selectedStudy,
  selectedSeries,
}: {
  instance: DicomInstance;
  isLast: boolean;
  selectedStudy: DicomStudy | null;
  selectedSeries: DicomSeries | null;
}) {
  const router = useRouter();

  return (
    <div
      className={` ${
        isLast ? "rounded-e-lg hover:rounded-e-lg" : ""
      } flex items-center justify-between px-6 py-3 hover:bg-blue-50 transition-colors pl-20`}
    >
      <p className=" mx-8 text-sm text-gray-700">
        {instance.fileName || instance.sopInstanceUid}
      </p>
      <button
        className="text-xs text-blue-600 hover:text-blue-700 font-medium"
        onClick={() =>
          router.push(
            `/viewer?study=${selectedStudy?.id}&series=${selectedSeries?.id}&instance=${instance.id}`
          )
        }
      >
        View
      </button>
    </div>
  );
}
