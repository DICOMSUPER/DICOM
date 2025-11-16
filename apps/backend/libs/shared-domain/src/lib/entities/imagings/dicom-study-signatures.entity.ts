import { BaseEntity } from '@backend/database';
import { SignatureType } from '@backend/shared-enums';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { DicomStudy } from './dicom-study.entity';

@Entity('dicom_study_signatures')
@Index('idx_study_signature', ['studyId', 'signatureId'], { unique: true })
// @Index('idx_study_id', ['studyId'])
@Index('idx_signature_id', ['signatureId'])
export class DicomStudySignature extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'study_id' })
  studyId!: string;

  @Column({ type: 'uuid', name: 'digital_signature_id' })
  signatureId!: string;

  @Column({ type: 'uuid', name: 'user_id' })
  userId!: string;

  @Column({ type: 'varchar', length: 50, name: 'signature_type' })
  signatureType!: SignatureType;

  @Column({ type: 'text', nullable: true, name: 'signed_data_hash' })
  signedDataHash?: string;

  @Column({ name: 'signed_data', type: 'text' })
  signedData!: string;

  @Column({ name: 'signature_value', type: 'text' })
  signatureValue!: string;
  //   denormalization

  @Column({ name: 'public_key', type: 'text' })
  publicKey!: string;

  @Column({ name: 'certificate_serial' })
  certificateSerial!: string;

  @CreateDateColumn({ name: 'signed_at' })
  signedAt!: Date;
  //

  @Column({ name: 'algorithm', default: 'RSA-SHA256' })
  algorithm!: string;

  @ManyToOne(() => DicomStudy, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'study_id' })
  study!: DicomStudy;

  //   signatureData!: DigitalSignature;
}
