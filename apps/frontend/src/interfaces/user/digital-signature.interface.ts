// interfaces/digital-signature.interface.ts

import { User } from "@/store/scheduleApi";
import { BaseEntity } from "../base.interface";

// Dùng để đăng ký mã PIN lần đầu
export interface SetupSignatureDto {
  pin: string;
  userId: string;
}

// Dùng để ký dữ liệu
export interface SignDataDto {
  pin: string;
  data: string;
  userId: string;
}

// Dùng để verify chữ ký
export interface VerifySignatureDto {
  data: string;
  signature: string;
  publicKey: string;
}

// Response trả về sau khi ký
export interface SignatureResponse {
  message: string;
  signatureId: string;
  signature: string;
  publicKey: string;
}

// Response verify
export interface VerifyResponse {
  message: string;
  isValid: boolean;
}

export interface PublicKeyResponse {
  message: string;
  publicKey: string;
}

// Entity chính của chữ ký số
export interface DigitalSignature extends BaseEntity {
  id: string;
  signedData: string;
  certificateSerial: string;
  algorithm: string;
  publicKey?: string;
  privateKeyEncrypted?: string;
  pinHash?: string;
  userId: string;
  user?: User;
}

// DTO tạo chữ ký
export interface CreateDigitalSignatureDto {
  userId: string;
  signedData: string;
  certificateSerial: string;
  algorithm: string;
  publicKey?: string;
  privateKeyEncrypted?: string;
  pinHash: string;
}

// DTO cập nhật chữ ký
export interface UpdateDigitalSignatureDto {
  signedData?: string;
  certificateSerial?: string;
  algorithm?: string;
  publicKey?: string;
  privateKeyEncrypted?: string;
  pinHash?: string;
  isActive?: boolean;
}

// Bộ lọc khi tìm chữ ký số
export interface DigitalSignatureSearchFilters {
  userId?: string;
  certificateSerial?: string;
  algorithm?: string;
  page?: number;
  limit?: number;
}

// Phân trang chuẩn
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
