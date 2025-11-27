import { BaseEntity as TypeOrmBaseEntity } from 'typeorm';
export declare abstract class BaseEntity extends TypeOrmBaseEntity {
    createdAt: Date;
    updatedAt: Date;
    isDeleted: boolean;
}
//# sourceMappingURL=base.entity.d.ts.map