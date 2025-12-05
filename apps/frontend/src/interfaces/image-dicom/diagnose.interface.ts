export interface CreateDiagnosisPayload {
  encounterId: string;        
  studyId: string;           
  diagnosisName: string;      
  description: string;        
  diagnosisType: "primary" | "secondary" | "other"; 
  severity: "mild" | "moderate" | "severe";        
  diagnosisDate: string;    
  diagnosedBy: string; 
  diagnosisStatus:DiagnosisStatus;
  notes?: string;            
}


export enum DiagnosisStatus {                
  PENDING_APPROVAL = 'pending_approval', 
  APPROVED = 'approved',                
  REJECTED = 'rejected',                 
  DRAFT = 'draft',                           
}
