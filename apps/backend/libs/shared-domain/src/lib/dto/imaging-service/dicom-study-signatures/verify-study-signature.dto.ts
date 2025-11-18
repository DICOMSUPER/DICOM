import { SignatureType } from '@backend/shared-enums';
import { IsEnum, IsNotEmpty, IsUUID } from 'class-validator';

export class VerifyStudySignatureDto {
  @IsUUID()
  @IsNotEmpty()
  studyId!: string;

  @IsEnum(SignatureType)
  @IsNotEmpty()
  signatureType!: SignatureType;
}
