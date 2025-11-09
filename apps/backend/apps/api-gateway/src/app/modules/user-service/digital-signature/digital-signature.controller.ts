import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Request,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { Public } from '@backend/shared-decorators';
import { Role } from '@backend/shared-decorators';
import { Roles } from '@backend/shared-enums';

// DTOs
class SetupSignatureDto {
  pin!: string;
  userId!: string;
}

class SignDataDto {
  pin!: string;
  data!: string;
  userId!: string;
}

class VerifySignatureDto {
  data!: string;
  signature!: string;
  publicKey!: string;
}

@Controller('digital-signature')
export class DigitalSignatureController {
  private readonly logger = new Logger(DigitalSignatureController.name);

  constructor(
    @Inject('USER_SERVICE') private readonly userServiceClient: ClientProxy,
  ) { }

  /** Health check */
  @Public()
  @Get('health')
  async checkHealth() {
    this.logger.log('Health check for Digital Signature service');
    return { status: 'ok', service: 'digital-signature' };
  }

  /** 🛠️ Setup chữ ký lần đầu cho user */
  @Role(Roles.RADIOLOGIST, Roles.PHYSICIAN, Roles.IMAGING_TECHNICIAN)
  @Post('setup')
  async setupSignature(@Body() dto: SetupSignatureDto) {
    this.logger.log(`Payload received: ${JSON.stringify(dto)}`);
    this.logger.log(`Setting up signature for userId=${dto.userId}`);

    return await firstValueFrom(
      this.userServiceClient.send('digital-signature.setup', {
        userId: dto.userId,
        pin: dto.pin,
      }),
    );
  }

  /** 🖋️ User ký dữ liệu */
  @Role(Roles.RADIOLOGIST, Roles.PHYSICIAN, Roles.IMAGING_TECHNICIAN)
  @Post('sign')
  @HttpCode(HttpStatus.OK)
  async signData(@Body() dto: SignDataDto) {
    this.logger.log(`Signing data for userId=${dto.userId}`);

    const result = await firstValueFrom(
      this.userServiceClient.send('digital-signature.sign', {
        userId: dto.userId,
        pin: dto.pin,
        data: dto.data,
      }),
    );

    return {
      message: 'Data signed successfully',
      signature: result.signature,
      publicKey: result.publicKey,
    };
  }

  /** ✅ Xác minh chữ ký */
  @Public()
  @Post('verify')
  @HttpCode(HttpStatus.OK)
  async verifySignature(@Body() dto: VerifySignatureDto) {
    this.logger.log(`Verifying signature`);
    const result = await firstValueFrom(
      this.userServiceClient.send('digital-signature.verify', {
        data: dto.data,
        signature: dto.signature,
        publicKey: dto.publicKey,
      }),
    );

    return {
      message: result.isValid ? 'Signature is valid' : 'Invalid signature',
      isValid: result.isValid,
    };
  }

  /** 🔑 Lấy public key của user */
  @Get('public-key/:userId')
  async getPublicKey(@Param('userId') userId: string) {
    this.logger.log(`Getting public key for userId=${userId}`);
    const result = await firstValueFrom(
      this.userServiceClient.send('digital-signature.getPublicKey', { userId }),
    );

    return { message: result.message, publicKey: result.publicKey };
  }

  /** 🗑️ Xóa signature */
  @Delete(':userId')
  async remove(@Param('userId') userId: string) {
    this.logger.log(`Removing signature for userId=${userId}`);
    const result = await firstValueFrom(
      this.userServiceClient.send('digital-signature.remove', { userId }),
    );

    return { message: result.message };
  }
}
