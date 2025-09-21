import axiosInstance from '../axios';
import {
  QueueAssignment,
  CreateQueueAssignmentDto,
  UpdateQueueAssignmentDto,
  QueueAssignmentSearchFilters,
  QueueStats
} from '@/interfaces/patient/queue-assignment.interface';

export class QueueAssignmentApiService {
  private readonly baseUrl = '/api/queue-assignments';

  async createQueueAssignment(data: CreateQueueAssignmentDto): Promise<QueueAssignment> {
    const response = await axiosInstance.post<QueueAssignment>(`${this.baseUrl}`, data);
    return response.data;
  }

  async getQueueAssignmentById(id: string): Promise<QueueAssignment> {
    const response = await axiosInstance.get<QueueAssignment>(`${this.baseUrl}/${id}`);
    return response.data;
  }

  async getAllQueueAssignments(filters: QueueAssignmentSearchFilters = {}): Promise<QueueAssignment[]> {
    const response = await axiosInstance.get<QueueAssignment[]>(`${this.baseUrl}`, { params: filters });
    return response.data;
  }

  async getQueueAssignmentsByVisitId(visitId: string): Promise<QueueAssignment[]> {
    const response = await axiosInstance.get<QueueAssignment[]>(`${this.baseUrl}`, { 
      params: { visitId } 
    });
    return response.data;
  }

  async updateQueueAssignment(id: string, data: UpdateQueueAssignmentDto): Promise<QueueAssignment> {
    const response = await axiosInstance.put<QueueAssignment>(`${this.baseUrl}/${id}`, data);
    return response.data;
  }

  async deleteQueueAssignment(id: string): Promise<void> {
    await axiosInstance.delete(`${this.baseUrl}/${id}`);
  }

  async getQueueStats(): Promise<QueueStats> {
    const response = await axiosInstance.get<QueueStats>(`${this.baseUrl}/stats`);
    return response.data;
  }

  async getNextQueueNumber(): Promise<number> {
    const response = await axiosInstance.get<{ nextNumber: number }>(`${this.baseUrl}/next-number`);
    return response.data.nextNumber;
  }

  async assignPatientToQueue(visitId: string, priority: string = 'routine', roomId?: string): Promise<QueueAssignment> {
    const nextNumber = await this.getNextQueueNumber();
    
    const assignmentData: CreateQueueAssignmentDto = {
      visitId,
      queueNumber: nextNumber,
      roomId,
      priority: priority as any,
      status: 'waiting' as any,
      createdBy: 'current-user-id' // TODO: Get from auth context
    };

    return await this.createQueueAssignment(assignmentData);
  }

  async updateQueueStatus(id: string, status: string): Promise<QueueAssignment> {
    return await this.updateQueueAssignment(id, { status: status as any });
  }

  async completeQueueAssignment(id: string): Promise<QueueAssignment> {
    return await this.updateQueueStatus(id, 'completed');
  }

  async expireQueueAssignment(id: string): Promise<QueueAssignment> {
    return await this.updateQueueStatus(id, 'expired');
  }
}

export const queueAssignmentApiService = new QueueAssignmentApiService();
