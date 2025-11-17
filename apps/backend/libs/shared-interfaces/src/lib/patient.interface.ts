import { Gender, BloodType } from '@backend/shared-enums';
import { IPatientCondition } from './patient-condition.interface';
import { IPatientEncounter } from './patient-encounter.interface';

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
