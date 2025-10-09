import { Gender, BloodType } from '@backend/shared-enums';

export interface IPatient {
  id: string;
  patientCode: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  gender: Gender;
  phoneNumber?: string;
  address?: string;
  bloodType?: BloodType;
  insuranceNumber?: string;
  isActive: boolean;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
  conditions?: IPatientCondition[];
  encounters?: IPatientEncounter[];
}

export interface IPatientWithRelations extends IPatient {
  conditions: IPatientCondition[];
  encounters: IPatientEncounter[];
  lastEncounterDate?: Date;
}

export interface IPatientBasic {
  id: string;
  patientCode: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  gender: Gender;
  isActive: boolean;
}
