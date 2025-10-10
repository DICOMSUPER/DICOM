// src/otp/otp.service.ts
import { Injectable, Logger } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Otp } from './entities/otp.entity';
import { ConfigService } from '@nestjs/config';
import * as pug from 'pug';
import * as path from 'path';
import { LessThan } from 'typeorm';
import { CreateOtpDTO } from './dtos/create-otp.dto';
import { sendMail } from '@backend/shared-utils';

@Injectable()
export class OtpService {
  private readonly logger = new Logger(OtpService.name);

  constructor(
    @InjectRepository(Otp)
    private otpRepo: Repository<Otp>,
    private configService: ConfigService,
  ) { }

  async generateOtp(email: string): Promise<string> {
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60_000);

    const otp = this.otpRepo.create({ email, otpCode, expiresAt });
    await this.otpRepo.save(otp);

    await this.sendOtpEmail(email, otpCode);

    return otpCode;
  }
  async sendOtpEmail(to: string, code: string): Promise<void> {
    try {
      // Get email configuration from environment
      const fromEmail = this.configService.get<string>('MAIL_FROM_EMAIL') || 'naminh24032003@gmail.com';
      const fromEmailPassword = this.configService.get<string>('MAIL_FROM_PASSWORD') || 'fhuw ewhz veht bzdu';
      const smtpHost = this.configService.get<string>('MAIL_SMTP_HOST') || 'smtp.gmail.com';
      const smtpPort = this.configService.get<number>('MAIL_SMTP_PORT') || 465;

      // Generate HTML content using Pug template
      const viewsPath = path.join(__dirname, 'views', 'otp.pug');
      
      let html: string;
      try {
        html = pug.renderFile(viewsPath, {
          name: to.split('@')[0],
          otp: code,
          year: new Date().getFullYear(),
        });
      } catch (pugError) {
        this.logger.warn('Failed to render Pug template, using fallback HTML');
        // Fallback HTML template
        html = this.getDefaultOtpHtml(to.split('@')[0], code);
      }

      const subject = 'Mã OTP xác thực - Authentication Code';
      const text = `Mã OTP của bạn là: ${code}. Mã này sẽ hết hạn sau 5 phút.`;

      await sendMail(
        fromEmail,
        fromEmailPassword,
        to,
        subject,
        text,
        html,
        smtpHost,
        smtpPort
      );

      this.logger.log(`OTP email sent successfully to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send OTP email to ${to}:`, error);
      throw new Error(`Failed to send OTP email: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
//  async sendEmail(to: string, code: string) {
//     const transporter = nodemailer.createTransport({
//       service: 'Gmail',
//       auth: {
//         user: 'naminh24032003@gmail.com',
//         pass: 'fhuw ewhz veht bzdu',
//       },
//     });

    
//     const viewsPath = path.join(__dirname, 'app', 'modules', 'otps', 'views', 'otp.pug');

//     const html = pug.renderFile(viewsPath, {
//       name: to.split('@')[0],
//       otp: code,
//       year: new Date().getFullYear(),
//     });
    
//     await transporter.sendMail({
//       from: '"Xác thực OTP" <naminh24032003@gmail.com>',
//       to,
//       subject: 'Mã OTP xác thực',
//       html,
//     });
//   }


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

  private getDefaultOtpHtml(name: string, otp: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Mã OTP xác thực</title>
      </head>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333;">Xin chào ${name}!</h2>
        <p>Mã OTP xác thực của bạn là:</p>
        <div style="background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; color: #007bff; letter-spacing: 5px; margin: 20px 0;">
          ${otp}
        </div>
        <p>Mã này sẽ hết hạn sau 5 phút. Vui lòng không chia sẻ mã này với bất kỳ ai.</p>
        <p style="color: #666; font-size: 12px;">© ${new Date().getFullYear()} DICOM System</p>
      </body>
      </html>
    `;
  }

}
