import { DynamicModule } from '@nestjs/common';
interface DatabaseModuleOptions {
    prefix: string;
    defaultDbName?: string;
}
export declare class DatabaseModule {
    static forService(options: DatabaseModuleOptions): DynamicModule;
}
export {};
//# sourceMappingURL=database.module.d.ts.map