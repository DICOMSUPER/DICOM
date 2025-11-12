import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  Logger,
  UseInterceptors,
  Req,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { Public, Role } from '@backend/shared-decorators';
import { Roles } from '@backend/shared-enums';
import {
  TransformInterceptor,
  RequestLoggingInterceptor,
} from '@backend/shared-interceptor';

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
@UseInterceptors(RequestLoggingInterceptor, TransformInterceptor)
export class DigitalSignatureController {
  private readonly logger = new Logger(DigitalSignatureController.name);

  constructor(
    @Inject('USER_SERVICE') private readonly userServiceClient: ClientProxy,
  ) { }

  @Public()
  @Get('health')
  async checkHealth() {
    this.logger.log('Health check for Digital Signature service');
    return { status: 'ok', service: 'digital-signature' };
  }

  @Role(Roles.RADIOLOGIST, Roles.PHYSICIAN, Roles.IMAGING_TECHNICIAN)
  @Post('setup')
  async setupSignature(@Req() req: any, @Body() dto: SetupSignatureDto) {
    const userId = req.userInfo.userId; // lấy từ token cookie
    const pin = dto.pin;

    return await firstValueFrom(
      this.userServiceClient.send('digital-signature.setup', { userId, pin })
    );
  }

  @Role(Roles.RADIOLOGIST, Roles.PHYSICIAN, Roles.IMAGING_TECHNICIAN)
  @Post('sign')
  @HttpCode(HttpStatus.OK)
  async signData(@Req() req: any, @Body() dto: SignDataDto) {
    // Lấy userId trực tiếp từ token đã verify trong AuthGuard
    const userId = req.userInfo.userId;
    const { pin, data } = dto;

    this.logger.log(`Received payload FE → pin=${pin}, data=${data}`);
    this.logger.log(`Signing data for userId=${userId}`);

    const result = await firstValueFrom(
      this.userServiceClient.send('digital-signature.sign', {
        userId, // dùng userId từ token
        pin,
        data,
      }),
    );

    return {
      message: 'Data signed successfully',
      signatureId: result.signatureId,
      signature: result.signature,
      publicKey: result.publicKey,
    };
  }

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

  @Get('public-key/:userId')
  async getPublicKey(@Param('userId') userId: string) {
    this.logger.log(`Getting public key for userId=${userId}`);
    const result = await firstValueFrom(
      this.userServiceClient.send('digital-signature.getPublicKey', { userId }),
    );

    return { message: result.message, publicKey: result.publicKey };
  }

  @Role(Roles.RADIOLOGIST, Roles.PHYSICIAN, Roles.IMAGING_TECHNICIAN)
  @Get(':id')
  async getById(@Param('id') id: string) {
    this.logger.log(`Getting digital signature by id=${id}`);
    const record = await firstValueFrom(
      this.userServiceClient.send('digital-signature.getById', { id }),
    );
    return record;
  }


  @Delete(':userId')
  async remove(@Param('userId') userId: string) {
    this.logger.log(`Removing signature for userId=${userId}`);
    const result = await firstValueFrom(
      this.userServiceClient.send('digital-signature.remove', { userId }),
    );

    return { message: result.message };
  }
}