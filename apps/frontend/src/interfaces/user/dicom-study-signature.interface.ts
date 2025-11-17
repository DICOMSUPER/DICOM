import { SignatureType } from "@/enums/signature-type";
import { BaseEntity } from "../base.interface";
import { DicomStudy } from "../image-dicom/dicom-study.interface";

export interface DicomStudySignature extends BaseEntity {
  studyId: string;
  signatureId: string;
  userId: string;
  signatureType: SignatureType;
  signedDataHash?: string;
  signedData: string;
  signatureValue: string;
  publicKey: string;
  certificateSerial: string;
  signedAt: Date;
  algorithm: string;
  study?: DicomStudy;
}

export interface SignStudyDto {
  studyId: string;
  pin: string;
}

export interface VerifyStudySignatureDto {
  studyId: string;
  signatureType: SignatureType;
}

export interface SignStudyResponse {
  message: string;
  study: {
    id: string;
    status: string;
    verifiedAt?: string;
    approvedAt?: string;
  };
}

export interface VerifySignatureResponse {
  isValid: boolean;
  signedAt: string;
  userId: string;
  certificateSerial: string;
}

export interface SignatureDetails {
  id: string;
  signatureType: SignatureType;
  userId: string;
  signedAt: string;
  certificateSerial: string;
}
