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
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { Public } from '@backend/shared-decorators';

// DTOs để validate input
class CreateSignatureDto {
  content!: string; // Dữ liệu cần ký
}

class VerifySignatureDto {
  data!: string;       // Dữ liệu gốc
  signature!: string;  // Chữ ký cần verify
  publicKey!: string;  // Public key để verify
}

@Controller('digital-signature')
export class DigitalSignatureController {
  constructor(
    @Inject('USER_SERVICE') private readonly userServiceClient: ClientProxy,
  ) {}

  /** 🖋️ Tạo chữ ký mới cho dữ liệu */
  @Public()
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createDto: CreateSignatureDto, @Request() req: any) {
    return await firstValueFrom(
      this.userServiceClient.send('digital-signature.create', {
        userId: req.user?.id,
        content: createDto.content,
      }),
    );
  }

  /** 📋 Lấy tất cả signatures của user hiện tại */
  @Get()
  async findAll(@Request() req: any) {
    return await firstValueFrom(
      this.userServiceClient.send('digital-signature.findAll', {
        userId: req.user?.id,
      }),
    );
  }

  /** 🔍 Lấy một signature cụ thể */
  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req: any) {
    return await firstValueFrom(
      this.userServiceClient.send('digital-signature.findOne', {
        id,
        userId: req.user?.id,
      }),
    );
  }

  /** ✅ Verify chữ ký */
  @Public()
  @Post('verify')
  @HttpCode(HttpStatus.OK)
  async verify(@Body() verifyDto: VerifySignatureDto, @Request() req: any) {
    return await firstValueFrom(
      this.userServiceClient.send('digital-signature.verify', {
        data: verifyDto.data,
        signature: verifyDto.signature,
        publicKey: verifyDto.publicKey,
        userId: req.user?.id,
      }),
    );
  }

  /** 🗑️ Xóa signature */
  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req: any) {
    return await firstValueFrom(
      this.userServiceClient.send('digital-signature.remove', {
        id,
        userId: req.user?.id,
      }),
    );
  }

  /** 🔑 Lấy public key của một signature */
  @Public()
  @Get(':id/public-key')
  async getPublicKey(@Param('id') id: string) {
    return await firstValueFrom(
      this.userServiceClient.send('digital-signature.getPublicKey', { id }),
    );
  }
}