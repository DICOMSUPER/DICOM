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
  id: string;
  signedData: string;
  certificateSerial: string;
  algorithm: string;
  publicKey?: string;
  privateKeyEncrypted?: string;
  pinHash?: string;
  userId: string;
  user?:User
}
