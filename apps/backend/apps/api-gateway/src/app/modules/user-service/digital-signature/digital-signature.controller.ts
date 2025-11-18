<<<<<<< HEAD
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
=======
>>>>>>> main
import { Public, Role } from '@backend/shared-decorators';
import { Roles } from '@backend/shared-enums';
import {
  RequestLoggingInterceptor,
  TransformInterceptor,
} from '@backend/shared-interceptor';
import type { IAuthenticatedRequest } from '@backend/shared-interfaces';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Logger,
  Param,
  Post,
  Req,
  UseInterceptors,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

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
    @Inject('USER_SERVICE') private readonly userServiceClient: ClientProxy
  ) {}

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
<<<<<<< HEAD
      this.userServiceClient.send('digital-signature.setup', { userId, pin })
=======
      this.userServiceClient.send('digital-signature.setup', {
        userId: dto.userId,
        pin: dto.pin,
      })
>>>>>>> main
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
<<<<<<< HEAD
        userId, // dùng userId từ token
        pin,
        data,
      }),
=======
        userId: dto.userId,
        pin: dto.pin,
        data: dto.data,
      })
>>>>>>> main
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
      })
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
      this.userServiceClient.send('digital-signature.getPublicKey', { userId })
    );

    return { message: result.message, publicKey: result.publicKey };
  }
  @Get('my-signature')
  async getMySignature(@Req() req: IAuthenticatedRequest) {
    this.logger.log(`Getting signature for user ${req.userInfo.userId}`);

    const result = await firstValueFrom(
      this.userServiceClient.send('digital-signature.getByUserId', {
        userId: req.userInfo.userId,
      })
    );

    return result;
  }


  @Get('has-signature')
  async hasSignature(@Req() req: IAuthenticatedRequest) {
    this.logger.log(`Checking if user ${req.userInfo.userId} has signature`);

    try {
      await firstValueFrom(
        this.userServiceClient.send('digital-signature.getByUserId', {
          userId: req.userInfo.userId,
        })
      );
      return { hasSignature: true };
    } catch (error) {
      return { hasSignature: false };
    }
  }

  @Role(Roles.RADIOLOGIST, Roles.PHYSICIAN, Roles.IMAGING_TECHNICIAN)
  @Get(':id')
  async getById(@Param('id') id: string) {
    this.logger.log(`Getting digital signature by id=${id}`);
    const record = await firstValueFrom(
      this.userServiceClient.send('digital-signature.getById', { id })
    );
    return record;
  }

  @Delete(':userId')
  async remove(@Param('userId') userId: string) {
    this.logger.log(`Removing signature for userId=${userId}`);
    const result = await firstValueFrom(
      this.userServiceClient.send('digital-signature.remove', { userId })
    );

    return { message: result.message };
  }

  
}
