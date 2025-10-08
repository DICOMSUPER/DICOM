import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, Matches } from 'class-validator';

export class CreateOtpDTO {
  @ApiProperty({
    description: 'Email',
    example: 'minhdeptrai@gmail.com',
  })
  @IsNotEmpty({ message: 'Email is not empty' })
  @IsEmail({}, { message: 'Invalid email' })
  email!: string;

  @ApiProperty({
    description: 'Otp (6 digit number)',
    example: '123456',
  })
  @IsNotEmpty({ message: 'Code is not empty' })
  @Matches(/^\d{6}$/, { message: 'Code must be a 6-digit number' })
  code!: string;
}
