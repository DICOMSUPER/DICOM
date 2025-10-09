import { EncounterType } from '@backend/shared-enums';
import { VitalSignsCollection } from './vital-signs.interface';

export interface IPatientEncounter {
  id: string;
  patientId: string;
  encounterDate: Date;
  encounterType: EncounterType;
  chiefComplaint?: string;
  symptoms?: string;
  vitalSigns?: VitalSignsCollection;
  assignedPhysicianId?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  isDeleted?: boolean;
  patient?: IPatientBasic;
}

export interface IEncounterWithDetails extends IPatientEncounter {
  patient?: {
    id: string;
    patientCode: string;
    firstName: string;
    lastName: string;
  };
  diagnosesCount?: number;
}
