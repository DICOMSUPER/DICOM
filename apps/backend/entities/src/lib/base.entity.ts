import { Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { BaseEntity as TypeOrmBaseEntity } from 'typeorm';

export abstract class BaseEntity extends TypeOrmBaseEntity {
  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @Column({ name: 'is_deleted', default: false }) //add for soft delete
  isDeleted!: boolean;
}
