import { Module } from '@nestjs/common';
import { DepartmentsService } from './departments.service';
import { DepartmentsController } from './departments.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Department } from './entities/department.entity';
import { User, Qualification } from '@backend/shared-domain';

@Module({
   imports: [
      TypeOrmModule.forFeature([
        Department,
        User,
        Qualification,
      ]),
    ],
  controllers: [DepartmentsController],
  providers: [DepartmentsService],
})
export class DepartmentsModule {}
