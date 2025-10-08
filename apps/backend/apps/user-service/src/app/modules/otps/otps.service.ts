// src/otp/otp.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Otp } from './entities/otp.entity';
import * as nodemailer from 'nodemailer';
import * as pug from 'pug';
import * as path from 'path';
import { LessThan } from 'typeorm';
import { CreateOtpDTO } from './dtos/create-otp.dto';

@Injectable()
export class OtpService {
  constructor(
    @InjectRepository(Otp)
    private otpRepo: Repository<Otp>,
  ) { }

  async generateOtp(email: string): Promise<string> {
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60_000);

    const otp = this.otpRepo.create({ email, otpCode, expiresAt });
    await this.otpRepo.save(otp);

    await this.sendEmail(email, otpCode);

    return otpCode;
  }

 async sendEmail(to: string, code: string) {
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: 'naminh24032003@gmail.com',
        pass: 'fhuw ewhz veht bzdu',
      },
    });

    
    const viewsPath = path.join(__dirname, 'app', 'modules', 'otps', 'views', 'otp.pug');

    const html = pug.renderFile(viewsPath, {
      name: to.split('@')[0],
      otp: code,
      year: new Date().getFullYear(),
    });
    
    await transporter.sendMail({
      from: '"Xác thực OTP" <naminh24032003@gmail.com>',
      to,
      subject: 'Mã OTP xác thực',
      html,
    });
  }


  async verifyOtp(createOtpDto: CreateOtpDTO): Promise<boolean> {
    const { email, code } = createOtpDto;

    const otp = await this.otpRepo.findOne({
      where: { email, otpCode: code },
      order: { createdAt: 'DESC' }
    });

    if (!otp) {
      return false;
    }

    const now = new Date();
    if (otp.expiresAt < now) {
      await this.otpRepo.delete(otp.id);
      return false;
    }

    await this.otpRepo.delete(otp.id);
    return true;
  }

  async cleanupExpiredOtps(): Promise<void> {
    const now = new Date();
    await this.otpRepo.delete({
      expiresAt: LessThan(now),
    });
  }

}
