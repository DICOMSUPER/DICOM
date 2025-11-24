import { Column } from 'typeorm';
import { BaseEntity as TypeOrmBaseEntity } from 'typeorm';
export abstract class BaseEntity extends TypeOrmBaseEntity {
  @Column({
    name: 'created_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt!: Date;

  @Column({
    name: 'updated_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt!: Date;

  @Column({ name: 'is_deleted', default: false })
  isDeleted!: boolean;
}
