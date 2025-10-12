import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum RoomType {
  CT = 'CT',
  WC = 'WC'
}

@Entity('rooms')
export class Room {
  @PrimaryGeneratedColumn('uuid')
  room_id!: string;

  @Column({ type: 'varchar', length: 20, unique: true, nullable: false })
  room_code!: string;

  @Column({ type: 'enum', enum: RoomType, nullable: false })
  room_type!: RoomType;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'boolean', default: true })
  is_active!: boolean;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
