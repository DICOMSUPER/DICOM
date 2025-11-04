export interface CreateDiagnosisPayload {
  encounterId: string;        
  studyId: string;           
  diagnosisName: string;      
  description: string;        
  diagnosisType: "primary" | "secondary" | "other"; 
  severity: "mild" | "moderate" | "severe";        
  diagnosisDate: string;    
  diagnosedBy: string;       
  notes?: string;            
}