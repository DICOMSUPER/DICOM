import { 
  Patient,
  PatientEncounter,
  DiagnosisReport,
  CreatePatientDto,
  UpdatePatientDto,
  CreatePatientEncounterDto,
  UpdatePatientEncounterDto,
  CreateDiagnosisReportDto,
  UpdateDiagnosisReportDto,
  PatientSearchFilters,
  EncounterSearchFilters,
  DiagnosisSearchFilters,
  PaginatedResponse,
  PatientStats,
  EncounterStats,
  DiagnosisStats,
  ApiResponse
} from '@/interfaces/patient/patient-workflow.interface';
import axiosInstance from '../axios';

/**
 * Patient API Service
 * Handles all patient-related API operations
 */
export class PatientApiService {
  private readonly baseUrl = '/api/patients';

  // Patient Operations
  async createPatient(data: CreatePatientDto): Promise<Patient> {
    const response = await axiosInstance.post<Patient>(
      `${this.baseUrl}`,
      data
    );
    return response.data;
  }

  async getPatientById(id: string): Promise<Patient> {
    const response = await axiosInstance.get<Patient>(
      `${this.baseUrl}/${id}`
    );
    return response.data;
  }

  async getPatientByCode(patientCode: string): Promise<Patient> {
    const response = await axiosInstance.get<Patient>(
      `${this.baseUrl}/code/${patientCode}`
    );
    return response.data;
  }

  async getAllPatients(filters: PatientSearchFilters = {}): Promise<Patient[]> {
    const response = await axiosInstance.get<Patient[]>(
      `${this.baseUrl}`,
      { params: filters }
    );
    return response.data;
  }

  async getPatientsPaginated(
    page: number = 1,
    limit: number = 10,
    filters: Omit<PatientSearchFilters, 'limit' | 'offset'> = {}
  ): Promise<PaginatedResponse<Patient>> {
    const response = await axiosInstance.get<PaginatedResponse<Patient>>(
      `${this.baseUrl}/paginated`,
      { 
        params: { 
          page, 
          limit, 
          ...filters 
        } 
      }
    );
    return response.data;
  }

  async searchPatientsByName(searchTerm: string, limit: number = 10): Promise<Patient[]> {
    const response = await axiosInstance.get<Patient[]>(
      `${this.baseUrl}/search`,
      { 
        params: { 
          q: searchTerm, 
          limit 
        } 
      }
    );
    return response.data;
  }

  async getPatientStats(): Promise<PatientStats> {
    const response = await axiosInstance.get<PatientStats>(
      `${this.baseUrl}/stats`
    );
    return response.data;
  }

  async updatePatient(id: string, data: UpdatePatientDto): Promise<Patient> {
    const response = await axiosInstance.put<Patient>(
      `${this.baseUrl}/${id}`,
      data
    );
    return response.data;
  }

  async deletePatient(id: string): Promise<void> {
    await axiosInstance.delete(`${this.baseUrl}/${id}`);
  }

  async restorePatient(id: string): Promise<Patient> {
    const response = await axiosInstance.post<Patient>(
      `${this.baseUrl}/${id}/restore`
    );
    return response.data;
  }

  // Patient Encounter Operations
  async createPatientEncounter(data: CreatePatientEncounterDto): Promise<PatientEncounter> {
    const response = await axiosInstance.post<PatientEncounter>(
      `${this.baseUrl}/${data.patientId}/encounters`,
      data
    );
    return response.data;
  }

  async getEncounterById(id: string): Promise<PatientEncounter> {
    const response = await axiosInstance.get<PatientEncounter>(
      `${this.baseUrl}/encounters/${id}`
    );
    return response.data;
  }

  async getEncountersByPatientId(patientId: string, limit?: number): Promise<PatientEncounter[]> {
    const response = await axiosInstance.get<PatientEncounter[]>(
      `${this.baseUrl}/${patientId}/encounters`,
      { params: { limit } }
    );
    return response.data;
  }

  async getAllEncounters(filters: EncounterSearchFilters = {}): Promise<PatientEncounter[]> {
    const response = await axiosInstance.get<PatientEncounter[]>(
      `${this.baseUrl}/encounters`,
      { params: filters }
    );
    return response.data;
  }

  async getEncountersPaginated(
    page: number = 1,
    limit: number = 10,
    filters: Omit<EncounterSearchFilters, 'limit' | 'offset'> = {}
  ): Promise<PaginatedResponse<PatientEncounter>> {
    const response = await axiosInstance.get<PaginatedResponse<PatientEncounter>>(
      `${this.baseUrl}/encounters/paginated`,
      { 
        params: { 
          page, 
          limit, 
          ...filters 
        } 
      }
    );
    return response.data;
  }

  async getEncounterStats(patientId?: string): Promise<EncounterStats> {
    const response = await axiosInstance.get<EncounterStats>(
      `${this.baseUrl}/encounters/stats`,
      { params: patientId ? { patientId } : {} }
    );
    return response.data;
  }

  async updateEncounter(id: string, data: UpdatePatientEncounterDto): Promise<PatientEncounter> {
    const response = await axiosInstance.put<PatientEncounter>(
      `${this.baseUrl}/encounters/${id}`,
      data
    );
    return response.data;
  }

  async deleteEncounter(id: string): Promise<void> {
    await axiosInstance.delete(`${this.baseUrl}/encounters/${id}`);
  }

  // Diagnosis Report Operations
  async createDiagnosisReport(data: CreateDiagnosisReportDto): Promise<DiagnosisReport> {
    const response = await axiosInstance.post<DiagnosisReport>(
      `${this.baseUrl}/encounters/${data.encounterId}/diagnoses`,
      data
    );
    return response.data;
  }

  async getDiagnosisById(id: string): Promise<DiagnosisReport> {
    const response = await axiosInstance.get<DiagnosisReport>(
      `${this.baseUrl}/diagnoses/${id}`
    );
    return response.data;
  }

  async getDiagnosesByEncounterId(encounterId: string): Promise<DiagnosisReport[]> {
    const response = await axiosInstance.get<DiagnosisReport[]>(
      `${this.baseUrl}/encounters/${encounterId}/diagnoses`
    );
    return response.data;
  }

  async getDiagnosesByPatientId(patientId: string, limit?: number): Promise<DiagnosisReport[]> {
    const response = await axiosInstance.get<DiagnosisReport[]>(
      `${this.baseUrl}/${patientId}/diagnoses`,
      { params: { limit } }
    );
    return response.data;
  }

  async getAllDiagnoses(filters: DiagnosisSearchFilters = {}): Promise<DiagnosisReport[]> {
    const response = await axiosInstance.get<DiagnosisReport[]>(
      `${this.baseUrl}/diagnoses`,
      { params: filters }
    );
    return response.data;
  }

  async getDiagnosesPaginated(
    page: number = 1,
    limit: number = 10,
    filters: Omit<DiagnosisSearchFilters, 'limit' | 'offset'> = {}
  ): Promise<PaginatedResponse<DiagnosisReport>> {
    const response = await axiosInstance.get<PaginatedResponse<DiagnosisReport>>(
      `${this.baseUrl}/diagnoses/paginated`,
      { 
        params: { 
          page, 
          limit, 
          ...filters 
        } 
      }
    );
    return response.data;
  }

  async getDiagnosisStats(patientId?: string): Promise<DiagnosisStats> {
    const response = await axiosInstance.get<DiagnosisStats>(
      `${this.baseUrl}/diagnoses/stats`,
      { params: patientId ? { patientId } : {} }
    );
    return response.data;
  }

  async getFollowupRequiredDiagnoses(limit?: number): Promise<DiagnosisReport[]> {
    const response = await axiosInstance.get<DiagnosisReport[]>(
      `${this.baseUrl}/diagnoses/followup`,
      { params: { limit } }
    );
    return response.data;
  }

  async updateDiagnosis(id: string, data: UpdateDiagnosisReportDto): Promise<DiagnosisReport> {
    const response = await axiosInstance.put<DiagnosisReport>(
      `${this.baseUrl}/diagnoses/${id}`,
      data
    );
    return response.data;
  }

  async deleteDiagnosis(id: string): Promise<void> {
    await axiosInstance.delete(`${this.baseUrl}/diagnoses/${id}`);
  }

}

// Export singleton instance
export const patientApiService = new PatientApiService();
