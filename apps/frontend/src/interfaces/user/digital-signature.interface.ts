<<<<<<< HEAD
// interfaces/digital-signature.interface.ts

export interface DigitalSignature {
=======
import { User } from "@/store/scheduleApi";
import { BaseEntity } from "../base.interface";


export interface SetupSignatureDto {
  pin: string;
  userId: string;
}

export interface SignDataDto {
  pin: string;
  data: string;
  userId: string;
}

export interface VerifySignatureDto {
  data: string;
  signature: string;
  publicKey: string;
}

export interface SignatureResponse {
  message: string;
  signatureId: string;
  signature: string;
  publicKey: string;
}

export interface VerifyResponse {
  message: string;
  isValid: boolean;
}

export interface PublicKeyResponse {
  message: string;
  publicKey: string;
}
export interface DigitalSignature extends BaseEntity {
>>>>>>> main
  id: string;
  signedData: string;
  certificateSerial: string;
  algorithm: string;
  publicKey?: string;
  privateKeyEncrypted?: string;
  pinHash?: string;
<<<<<<< HEAD
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
=======
  userId: string;
  user?:User
>>>>>>> main
}
