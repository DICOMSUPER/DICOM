import { Module } from '@nestjs/common';
import { DepartmentsService } from './departments.service';
import { DepartmentsController } from './departments.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Department, Room } from '@backend/shared-domain';
import { User } from '@backend/shared-domain';

@Module({
   imports: [
      TypeOrmModule.forFeature([
        Department,
        User,
        Room
      ]),
    ],
  controllers: [DepartmentsController],
  providers: [DepartmentsService],
})
export class DepartmentsModule {}
