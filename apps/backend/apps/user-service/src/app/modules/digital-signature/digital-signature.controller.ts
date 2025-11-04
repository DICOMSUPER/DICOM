import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { DigitalSignatureService } from './digital-signature.service';

@Controller()
export class DigitalSignatureController {
  private readonly logger = new Logger('DigitalSignatureController');

  constructor(
    private readonly digitalSignatureService: DigitalSignatureService,
  ) {}

  @MessagePattern('digital-signature.check-health')
  async checkHealth() {
    this.logger.log('Health check for Digital Signature service');
    return { status: 'ok', service: 'digital-signature' };
  }

  /** 🖋️ Ký dữ liệu - tạo signature mới */
  @MessagePattern('digital-signature.create')
  async signData(@Payload() payload: { userId: string; content: string }) {
    this.logger.log(`Signing data for userId=${payload.userId}`);
    const result = await this.digitalSignatureService.signData(
      payload.userId,
      payload.content,
    );
    return {
      message: 'Data signed successfully',
      signature: result.signature,
      publicKey: result.publicKeyPem,
    };
  }

  /** 📋 Lấy tất cả signatures của user */
  @MessagePattern('digital-signature.findAll')
  async findAll(@Payload() payload: { userId: string }) {
    this.logger.log(`Finding all signatures for userId=${payload.userId}`);
    // Service chưa có method này, cần thêm vào service
    return {
      message: 'Feature not implemented yet',
      data: [],
    };
  }

  /** 🔍 Lấy một signature cụ thể */
  @MessagePattern('digital-signature.findOne')
  async findOne(@Payload() payload: { id: string; userId: string }) {
    this.logger.log(`Finding signature id=${payload.id}`);
    // Service chưa có method này, cần thêm vào service
    return {
      message: 'Feature not implemented yet',
      data: null,
    };
  }

  /** ✅ Xác minh chữ ký */
  @MessagePattern('digital-signature.verify')
  async verifySignature(
    @Payload() payload: {
      id?: string;
      data: string;
      signature: string;
      publicKey: string;
      userId?: string;
    },
  ) {
    this.logger.log(`Verifying signature`);
    const result = await this.digitalSignatureService.verifySignature(
      payload.data,
      payload.signature,
      payload.publicKey,
    );

    return {
      message: result.isValid ? 'Signature is valid' : 'Invalid signature',
      isValid: result.isValid,
    };
  }

  /** 🗑️ Xóa signature */
  @MessagePattern('digital-signature.remove')
  async remove(@Payload() payload: { id: string; userId: string }) {
    this.logger.log(`Removing signature id=${payload.id}`);
    // Service chưa có method này, cần thêm vào service
    return {
      message: 'Feature not implemented yet',
    };
  }

  /** 🔑 Lấy public key */
  @MessagePattern('digital-signature.getPublicKey')
  async getPublicKey(@Payload() payload: { id: string }) {
    this.logger.log(`Getting public key for id=${payload.id}`);
    // Service chưa có method này, cần thêm vào service
    return {
      message: 'Feature not implemented yet',
      publicKey: null,
    };
  }
}