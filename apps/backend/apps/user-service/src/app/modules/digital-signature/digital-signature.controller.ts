import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { DigitalSignatureService } from './digital-signature.service';

@Controller()
export class DigitalSignatureController {
  private readonly logger = new Logger(DigitalSignatureController.name);

  constructor(private readonly digitalSignatureService: DigitalSignatureService) {}

  /** Health check */
  @MessagePattern('digital-signature.check-health')
  async checkHealth() {
    this.logger.log('Health check for Digital Signature service');
    return { status: 'ok', service: 'digital-signature' };
  }

  /** 🛠️ Setup chữ ký lần đầu cho user */
  @MessagePattern('digital-signature.setup')
  async setupSignature(@Payload() payload: { userId: string; pin: string }) {
    this.logger.log(`Setting up signature for userId=${payload.userId}`);
    const result = await this.digitalSignatureService.setupSignature(payload.userId, payload.pin);
    return result;
  }

  /** 🖋️ User ký dữ liệu */
  @MessagePattern('digital-signature.sign')
  async signData(@Payload() payload: { userId: string; pin: string; data: string }) {
    this.logger.log(`Signing data for userId=${payload.userId}`);
    const result = await this.digitalSignatureService.signData(payload.userId, payload.pin, payload.data);
    return {
      message: 'Data signed successfully',
      signature: result.signature,
      publicKey: result.publicKey,
    };
  }

  /** ✅ Xác minh chữ ký */
  @MessagePattern('digital-signature.verify')
  async verifySignature(
    @Payload() payload: { data: string; signature: string; publicKey: string },
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


}
