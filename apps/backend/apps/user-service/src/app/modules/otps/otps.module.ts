import { Module } from '@nestjs/common';
import { OtpsController } from './otps.controller';
import { OtpService } from './otps.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Otp } from './entities/otp.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Otp]),
  UsersModule,
],
  controllers: [OtpsController],
  providers: [OtpService]
})
export class OtpsModule {}
