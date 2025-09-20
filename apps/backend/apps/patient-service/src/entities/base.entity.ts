import { Entity } from 'typeorm';
import { Column as TypeOrmColumn } from 'typeorm';
import { CreateDateColumn as TypeOrmCreateDateColumn } from 'typeorm';
import { UpdateDateColumn as TypeOrmUpdateDateColumn } from 'typeorm';
import { PrimaryColumn as TypeOrmPrimaryColumn } from 'typeorm';
import { BaseEntity as TypeOrmBaseEntity } from 'typeorm';

@Entity()
export abstract class BaseEntity extends TypeOrmBaseEntity {
  @TypeOrmPrimaryColumn({
    type: 'varchar',
    length: 50,
    name: 'id'
  })
  id!: string;

  @TypeOrmCreateDateColumn({
    type: 'timestamp',
    name: 'created_at'
  })
  createdAt!: Date;

  @TypeOrmUpdateDateColumn({
    type: 'timestamp',
    name: 'updated_at'
  })
  updatedAt!: Date;

  @TypeOrmColumn({
    type: 'boolean',
    name: 'is_deleted',
    default: false
  })
  isDeleted!: boolean;
}