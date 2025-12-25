import { MachineStatus } from "@/common/enums/machine-status.enum";
import { ImagingModality } from "@/common/interfaces/image-dicom/imaging_modality.interface";
import { BaseEntity } from "../base.interface";

export interface ModalityMachine extends BaseEntity {
  id: string;
  name: string;
  modalityId: string;
  modality?: ImagingModality;
  manufacturer?: string;
  model?: string;
  serialNumber?: string;
  roomId?: string;
  status: MachineStatus;
}

export interface CreateModalityMachineDto {
  name: string;
  modalityId: string;
  manufacturer?: string;
  model?: string;
  serialNumber?: string;
  roomId?: string;
  status?: MachineStatus;
}

export type UpdateModalityMachineDto = Partial<CreateModalityMachineDto>;
