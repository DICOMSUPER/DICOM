import { 
  PatientCondition,
  CreatePatientConditionDto,
  UpdatePatientConditionDto,
  PatientConditionSearchFilters
} from '@/interfaces/patient/patient-condition.interface';
import axiosInstance from '../axios';

/**
 * Patient Condition API Service
 * Handles all patient condition-related API operations
 */
export class PatientConditionApiService {
  private readonly baseUrl = '/api/patient-conditions';

  // Patient Condition Operations
  async createCondition(data: CreatePatientConditionDto): Promise<PatientCondition> {
    const response = await axiosInstance.post<PatientCondition>(
      `${this.baseUrl}`,
      data
    );
    return response.data;
  }

  async getConditionById(id: string): Promise<PatientCondition> {
    const response = await axiosInstance.get<PatientCondition>(
      `${this.baseUrl}/${id}`
    );
    return response.data;
  }

  async getConditionsByPatientId(patientId: string): Promise<PatientCondition[]> {
    const response = await axiosInstance.get<PatientCondition[]>(
      `${this.baseUrl}/patient/${patientId}`
    );
    return response.data;
  }

  async getAllConditions(filters?: PatientConditionSearchFilters): Promise<PatientCondition[]> {
    const response = await axiosInstance.get<PatientCondition[]>(
      `${this.baseUrl}`,
      { params: filters }
    );
    return response.data;
  }

  async updateCondition(id: string, data: UpdatePatientConditionDto): Promise<PatientCondition> {
    const response = await axiosInstance.patch<PatientCondition>(
      `${this.baseUrl}/${id}`,
      data
    );
    return response.data;
  }

  async deleteCondition(id: string): Promise<void> {
    await axiosInstance.delete(`${this.baseUrl}/${id}`);
  }

  // Bulk operations
  async createConditionsForPatient(patientId: string, conditions: Omit<CreatePatientConditionDto, 'patientId'>[]): Promise<PatientCondition[]> {
    const conditionPromises = conditions.map(condition => 
      this.createCondition({ ...condition, patientId })
    );
    return Promise.all(conditionPromises);
  }

  async updatePatientConditions(patientId: string, conditions: CreatePatientConditionDto[]): Promise<PatientCondition[]> {
    // First, get existing conditions
    const existingConditions = await this.getConditionsByPatientId(patientId);
    
    // Delete existing conditions
    const deletePromises = existingConditions.map(condition => 
      this.deleteCondition(condition.id)
    );
    await Promise.all(deletePromises);
    
    // Create new conditions
    return this.createConditionsForPatient(patientId, conditions);
  }
}

// Export singleton instance
export const patientConditionApiService = new PatientConditionApiService();
