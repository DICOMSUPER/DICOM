import { DicomInstance } from "@/common/interfaces/image-dicom/dicom-instances.interface";

type InstanceLike = Partial<DicomInstance> & {
  instanceNumber?: number | string | null;
  sopInstanceUid?: string;
};

export const extractSortingMetadata = (
  instance: InstanceLike
): DicomInstance => {
  const instanceNumber = Number(instance.instanceNumber ?? 0);

  return {
    ...(instance as DicomInstance),
    instanceNumber: Number.isFinite(instanceNumber) ? instanceNumber : 0,
  };
};

export const smartSort = (instances: DicomInstance[]) => {
  return [...instances].sort((a, b) => {
    const numberDiff = (a.instanceNumber ?? 0) - (b.instanceNumber ?? 0);
    if (numberDiff !== 0) {
      return numberDiff;
    }

    const aUid = a.sopInstanceUid ?? "";
    const bUid = b.sopInstanceUid ?? "";
    return aUid.localeCompare(bUid);
  });
};

