// src/otp/otp.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Otp } from './entities/otp.entity';
import * as nodemailer from 'nodemailer';
import { UsersService } from '../users/users.service';
import * as pug from 'pug';
import * as path from 'path';
import { CreateOtpDTO } from './dtos/create-otp.dto';

@Injectable()
export class OtpService {
  constructor(
    @InjectRepository(Otp)
    private otpRepo: Repository<Otp>,
    private usersService: UsersService,
  ) {}

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

    const html = pug.renderFile(path.join(__dirname, 'views', 'otp.pug'), {
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

  // async verifyOtp(createOtpDto: CreateOtpDTO): Promise<boolean> {
  //   const { email, code } = createOtpDto;

  //   const otp = await this.otpRepo.findOne({ where: { email } });

  //   if (!otp) {
  //     return false;
  //   }

  //   if (otp.code !== code) {
  //     return false;
  //   }

  //   const now = new Date();
  //   if (otp.expiresAt < now) {
  //     await this.otpRepo.delete(otp.id);
  //     return false;
  //   }

  //   const user = await this.usersService.findByEmail(email);
  //   if (!user) {
  //     return false;
  //   }

  //   await this.usersService.updateByid(user.id, { is_verified: true });
  //   await this.otpRepo.delete(otp.id);

  //   return true;
  //}
}
