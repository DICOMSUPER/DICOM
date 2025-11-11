import { Services } from "@/types";
import { PatientEncounter } from "../patient/patient-workflow.interface";
import { Room } from "./room.interface";


export interface ServiceRoom {
  id: string; 
  serviceId: string; 
  roomId: string; 
  service: Services; 
  room: Room; 
  isActive: boolean; 
  notes?: string; 
  patientEncounter?: PatientEncounter[]; 
}