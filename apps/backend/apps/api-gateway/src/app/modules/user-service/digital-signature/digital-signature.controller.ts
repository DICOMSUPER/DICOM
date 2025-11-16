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
  async setupSignature(@Body() dto: SetupSignatureDto) {
    this.logger.log(`Payload received: ${JSON.stringify(dto)}`);
    this.logger.log(`Setting up signature for userId=${dto.userId}`);

    return await firstValueFrom(
      this.userServiceClient.send('digital-signature.setup', {
        userId: dto.userId,
        pin: dto.pin,
      })
    );
  }

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
      })
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

  /**
   * Check if user has digital signature
   */
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
}
