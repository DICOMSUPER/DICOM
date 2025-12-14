import { Module } from '@nestjs/common';
import { OtpsController } from './otps.controller';
import { OtpService } from './otps.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Otp } from '@backend/shared-domain';
import { User, Department } from '@backend/shared-domain';

@Module({
  imports: [TypeOrmModule.forFeature([Otp, User, Department])],
  controllers: [OtpsController],
  providers: [OtpService],
  exports: [OtpService],
})
export class OtpsModule {}
