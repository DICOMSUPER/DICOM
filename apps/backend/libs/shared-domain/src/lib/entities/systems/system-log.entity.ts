import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';
import { BaseEntity } from '@backend/database';
import { LogLevel, LogCategory } from '@backend/shared-enums';

@Entity('system_logs')
@Index(['category'])
export class SystemLog extends BaseEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'log_id' })
  id!: string;

  @Column({ name: 'log_level', type: 'enum', enum: LogLevel })
  logLevel!: LogLevel;

  @Column({ type: 'enum', enum: LogCategory })
  category!: LogCategory;

  @Column({ type: 'text' })
  message!: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  timestamp!: Date;
}
