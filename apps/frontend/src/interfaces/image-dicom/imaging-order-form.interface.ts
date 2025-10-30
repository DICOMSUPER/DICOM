export interface ImagingOrder {
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
  id: string;
  orderNumber: number;
  procedureId: string;
  orderStatus: string;
  imagingOrderFormId: string;
  completedDate: string | null;
  clinicalIndication: string;
  contrastRequired: boolean;
  specialInstructions: string;
}

export interface ImagingOrderForm {
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
  id: string;
  patientId: string;
  encounterId: string;
  orderingPhysicianId: string;
  orderFormStatus: string;
  notes: string;
  roomId: string;
  imagingOrders: ImagingOrder[];
}

export interface ImagingOrderFormResponseData {
  data: ImagingOrderForm[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface ImagingOrderFormResponse {
  success: boolean;
  data: ImagingOrderFormResponseData;
  statusCode: number;
  message: string;
  timestamp: string;
  path: string;
  method: string;
  traceId: string;
}
