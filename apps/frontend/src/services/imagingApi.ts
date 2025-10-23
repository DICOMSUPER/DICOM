const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface ImagingModality {
  id: string;
  modalityCode: string;
  modalityName: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DicomStudy {
  id: string;
  studyInstanceUid: string;
  studyDescription?: string;
  studyDate: string;
  studyTime?: string;
  patientId: string;
  modalityId: string;
  modality?: ImagingModality;
  orderId?: string;
  referringPhysician?: string;
  performingPhysicianId?: string;
  technicianId?: string;
  studyStatus: string;
  numberOfSeries: number;
  storagePath: string;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
  series?: DicomSeries[];
}

export interface DicomSeries {
  id: string;
  seriesInstanceUid: string;
  seriesDescription?: string;
  seriesNumber: number;
  studyId: string;
  bodyPartExamined?: string;
  seriesDate?: string;
  seriesTime?: string;
  protocolName?: string;
  numberOfInstances: number;
  createdAt: string;
  updatedAt: string;
  study?: DicomStudy; // Add study relation
}

export interface DicomInstance {
  id: string;
  sopInstanceUid: string;
  fileName: string;
  filePath: string;
  seriesId: string;
  instanceNumber: number;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  statusCode: number;
  message: string;
  timestamp: string;
  method: string;
  path: string;
  traceId: string;
}

class ImagingApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
    };

    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // DICOM Studies
  async getStudies(params?: {
    page?: number;
    limit?: number;
    search?: string;
    searchField?: string;
    sortField?: string;
    order?: 'asc' | 'desc';
  }): Promise<PaginatedResponse<DicomStudy>> {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.searchField) queryParams.append('searchField', params.searchField);
    if (params?.sortField) queryParams.append('sortField', params.sortField);
    if (params?.order) queryParams.append('order', params.order);

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/dicom-studies/paginated?${queryString}` : '/dicom-studies/paginated';
    
    return this.request<PaginatedResponse<DicomStudy>>(endpoint);
  }

  async getStudyById(id: string): Promise<DicomStudy> {
    return this.request<DicomStudy>(`/dicom-studies/${id}`);
  }

  async getStudiesByReferenceId(
    id: string,
    type: 'modality' | 'order' | 'patient' | 'performingPhysician' | 'technician' | 'referringPhysician' | 'studyInstanceUid',
    params?: {
      page?: number;
      limit?: number;
      search?: string;
      searchField?: string;
      sortField?: string;
      order?: 'asc' | 'desc';
    }
  ): Promise<PaginatedResponse<DicomStudy>> {
    const queryParams = new URLSearchParams();
    queryParams.append('type', type);
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.searchField) queryParams.append('searchField', params.searchField);
    if (params?.sortField) queryParams.append('sortField', params.sortField);
    if (params?.order) queryParams.append('order', params.order);

    return this.request<PaginatedResponse<DicomStudy>>(
      `/dicom-studies/reference/${id}?${queryParams.toString()}`
    );
  }

  // DICOM Series
  async getSeries(params?: {
    page?: number;
    limit?: number;
    search?: string;
    searchField?: string;
    sortField?: string;
    order?: 'asc' | 'desc';
  }): Promise<PaginatedResponse<DicomSeries>> {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.searchField) queryParams.append('searchField', params.searchField);
    if (params?.sortField) queryParams.append('sortField', params.sortField);
    if (params?.order) queryParams.append('order', params.order);

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/dicom-series/paginated?${queryString}` : '/dicom-series/paginated';
    
    return this.request<PaginatedResponse<DicomSeries>>(endpoint);
  }

  async getSeriesById(id: string): Promise<DicomSeries> {
    return this.request<DicomSeries>(`/dicom-series/${id}`);
  }

  async getSeriesByReferenceId(
    id: string,
    type: 'study' | 'seriesInstanceUid' | 'order' | 'modality',
    params?: {
      page?: number;
      limit?: number;
      search?: string;
      searchField?: string;
      sortField?: string;
      order?: 'asc' | 'desc';
    }
  ): Promise<ApiResponse<PaginatedResponse<DicomSeries>>> {
    const queryParams = new URLSearchParams();
    queryParams.append('type', type);
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.searchField) queryParams.append('searchField', params.searchField);
    if (params?.sortField) queryParams.append('sortField', params.sortField);
    if (params?.order) queryParams.append('order', params.order);

    return this.request<ApiResponse<PaginatedResponse<DicomSeries>>>(
      `/dicom-series/reference/${id}?${queryParams.toString()}`
    );
  }

  // DICOM Instances
  async getInstances(params?: {
    page?: number;
    limit?: number;
    search?: string;
    searchField?: string;
    sortField?: string;
    order?: 'asc' | 'desc';
  }): Promise<PaginatedResponse<DicomInstance>> {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.searchField) queryParams.append('searchField', params.searchField);
    if (params?.sortField) queryParams.append('sortField', params.sortField);
    if (params?.order) queryParams.append('order', params.order);

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/dicom-instances/paginated?${queryString}` : '/dicom-instances/paginated';
    
    return this.request<PaginatedResponse<DicomInstance>>(endpoint);
  }

  async getInstanceById(id: string): Promise<DicomInstance> {
    return this.request<DicomInstance>(`/dicom-instances/${id}`);
  }

  async getInstancesByReferenceId(
    id: string,
    type: 'sopInstanceUid' | 'series',
    params?: {
      page?: number;
      limit?: number;
      search?: string;
      searchField?: string;
      sortField?: string;
      order?: 'asc' | 'desc';
    }
  ): Promise<ApiResponse<PaginatedResponse<DicomInstance>>> {
    const queryParams = new URLSearchParams();
    queryParams.append('type', type);
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.searchField) queryParams.append('searchField', params.searchField);
    if (params?.sortField) queryParams.append('sortField', params.sortField);
    if (params?.order) queryParams.append('order', params.order);

    return this.request<ApiResponse<PaginatedResponse<DicomInstance>>>(
      `/dicom-instances/reference/${id}?${queryParams.toString()}`
    );
  }

  // DICOM Image Rendering
  async getDicomImageUrl(instanceId: string): Promise<string> {
    // This would typically call a DICOM rendering service
    // For now, return a placeholder that can be used with cornerstone
    return `${API_BASE_URL}/dicom-instances/${instanceId}/image`;
  }

  async getDicomImageThumbnail(instanceId: string): Promise<string> {
    // This would typically call a DICOM thumbnail service
    return `${API_BASE_URL}/dicom-instances/${instanceId}/thumbnail`;
  }

  // Get DICOM instances for a specific series
  async getSeriesInstances(seriesId: string): Promise<DicomInstance[]> {
    const response = await this.getInstancesByReferenceId(seriesId, 'series', {
      page: 1,
      limit: 1000
    });
    return response.data.data || [];
  }

  // Get study metadata
  async getStudyMetadata(studyId: string): Promise<{
    patientInfo: any;
    studyInfo: any;
    seriesCount: number;
    instanceCount: number;
  }> {
    const [study, seriesResponse] = await Promise.all([
      this.getStudyById(studyId),
      this.getSeriesByReferenceId(studyId, 'study', { page: 1, limit: 100 })
    ]);

    const totalInstances = await Promise.all(
      seriesResponse.data.data.map((series: any) => 
        this.getInstancesByReferenceId(series.id, 'series', { page: 1, limit: 1 })
      )
    );

    const instanceCount = totalInstances.reduce((sum: number, response: any) => sum + response.data.total, 0);

    return {
      patientInfo: {
        id: study.patientId,
        // Note: Patient details should be fetched from Patient Service
        name: 'N/A',
        birthDate: 'N/A',
        sex: 'N/A'
      },
      studyInfo: {
        id: study.id,
        description: study.studyDescription || 'N/A',
        date: study.studyDate,
        time: study.studyTime || 'N/A',
      },
      seriesCount: seriesResponse.data.total,
      instanceCount
    };
  }
}

export const imagingApi = new ImagingApiService();
