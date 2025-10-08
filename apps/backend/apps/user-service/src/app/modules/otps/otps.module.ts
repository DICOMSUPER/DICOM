import { Module } from '@nestjs/common';
import { OtpsController } from './otps.controller';
import { OtpService } from './otps.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Otp } from './entities/otp.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Otp]),
],
  controllers: [OtpsController],
  providers: [OtpService],
  exports: [OtpService],
})
export class OtpsModule {}
