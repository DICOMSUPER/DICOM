import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';
import { BaseEntity } from '@backend/database';
import { AuditAction } from '@backend/shared-enums';

@Entity('audit_log')
@Index(['userId'])
@Index(['action'])
export class AuditLog extends BaseEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'audit_id' })
  id!: string;

  @Column({ name: 'user_id', type: 'uuid'})
  userId!: string;


  @Column({ name: 'ip_address', length: 45 })
  ipAddress!: string;

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent?: string;

  @Column({ type: 'enum', enum: AuditAction })
  action!: AuditAction;

  @Column({ name: 'entity_type', length: 100, nullable: true })
  entityType?: string;

  @Column({ name: 'entity_id', type: 'uuid', nullable: true })
  entityId?: string;

  @Column({ name: 'old_values', type: 'json', nullable: true })
  oldValues?: object;

  @Column({ name: 'new_values', type: 'json', nullable: true })
  newValues?: object;

//   @Column({ type: 'enum', enum: AuditResult })
//   result!: AuditResult;

//   @Column({ name: 'error_message', type: 'text', nullable: true })
//   errorMessage?: string;


  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  timestamp!: Date;
}
