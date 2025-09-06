import { HttpStatus, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import nodemailer from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';

export const sendMail = async (
  fromEmail: string,
  fromEmailPassword: string,
  toEmail: string,
  subject: string,
  text: string,
  html?: string,
  host?: string,
  port?: number
) => {
  const logger = new Logger('SharedUtils - SendMail');

  if (!fromEmail || !fromEmailPassword || !toEmail) {
    throw new RpcException({
      code: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Missing required information to send mail',
      location: 'SharedUtils - SendMail',
    });
  }

  const transporter = nodemailer.createTransport({
    host: host || 'smtp.gmail.com',
    port: port || 465,
    secure: true,
    auth: {
      user: fromEmail,
      pass: fromEmailPassword,
    },
  });

  const options: Mail.Options = {
    from: fromEmail,
    to: toEmail,
    subject: subject,
    text: text,
    html: html,
  };

  await transporter.sendMail(options);

  transporter.verify((error, success) => {
    if (error) {
      logger.error('SMTP failed:', error);
    } else {
      logger.log('SMTP server is ready to take messages');
    }
  });
};
