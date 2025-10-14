import { Module } from '@nestjs/common';
import { QualificationsService } from './qualifications.service';
import { QualificationsController } from './qualifications.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Qualification } from './entities/qualification.entity';
import { User, Department } from '@backend/shared-domain';

@Module({
  imports: [TypeOrmModule.forFeature([Qualification, User, Department])],
  controllers: [QualificationsController],
  providers: [QualificationsService],
  
})
export class QualificationsModule {}
