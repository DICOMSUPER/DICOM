import { DynamicModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({})
export class BackendEntitiesModule {
  static forFeature(entities: any[]): DynamicModule {
    return {
      module: BackendEntitiesModule,
      imports: [TypeOrmModule.forFeature(entities)],
      exports: [TypeOrmModule],
    };
  }
}