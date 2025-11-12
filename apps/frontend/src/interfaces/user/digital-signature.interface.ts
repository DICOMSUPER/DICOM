// interfaces/digital-signature.interface.ts

export interface DigitalSignature {
  id: string;
  signedData: string;
  certificateSerial: string;
  algorithm: string;
  publicKey?: string;
  privateKeyEncrypted?: string;
  pinHash?: string;
  createdAt: string; // Date kiểu string khi nhận từ API
  userId: string;
}

// DTO để tạo chữ ký mới
export interface CreateDigitalSignatureDto {
  userId: string;
  signedData: string;
  certificateSerial: string;
  algorithm: string;
  publicKey?: string;
  privateKeyEncrypted?: string;
  pinHash: string;
}

// DTO để cập nhật chữ ký
export interface UpdateDigitalSignatureDto {
  signedData?: string;
  certificateSerial?: string;
  algorithm?: string;
  publicKey?: string;
  privateKeyEncrypted?: string;
  pinHash?: string;
  isActive?: boolean; // nếu API có trạng thái active/inactive
}

// Bộ lọc tìm kiếm chữ ký số
export interface DigitalSignatureSearchFilters {
  userId?: string;
  certificateSerial?: string;
  algorithm?: string;
  page?: number;
  limit?: number;
}

// Response phân trang chuẩn
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
