import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { DigitalSignatureService } from './digital-signature.service';
import { handleErrorFromMicroservices } from '@backend/shared-utils';

@Controller()
export class DigitalSignatureController {
  private readonly logger = new Logger(DigitalSignatureController.name);

  constructor(private readonly digitalSignatureService: DigitalSignatureService) {}

  @MessagePattern('digital-signature.check-health')
  async checkHealth() {
    this.logger.log('Health check for Digital Signature service');
    return { status: 'ok', service: 'digital-signature' };
  }

  @MessagePattern('digital-signature.setup')
  async setupSignature(@Payload() payload: { userId: string; pin: string }) {
    try {
      this.logger.log(`Setting up signature for userId=${payload.userId}`);
      const result = await this.digitalSignatureService.setupSignature(
        payload.userId,
        payload.pin
      );
      return result;
    } catch (error) {
      this.logger.error(`Setup signature error: ${(error as Error).message}`);
      throw handleErrorFromMicroservices(
        error,
        'Failed to setup digital signature',
        'DigitalSignatureController.setupSignature'
      );
    }
  }

  @MessagePattern('digital-signature.sign')
  async signData(@Payload() payload: { userId: string; pin: string; data: string }) {
    try {
      this.logger.log(`Signing data for userId=${payload.userId}`);
      const result = await this.digitalSignatureService.signData(
        payload.userId,
        payload.pin,
        payload.data
      );
      return {
        message: 'Data signed successfully',
        signature: result.signature,
        publicKey: result.publicKey,
      };
    } catch (error) {
      this.logger.error(`Sign data error: ${(error as Error).message}`);
      throw handleErrorFromMicroservices(
        error,
        'Failed to sign data',
        'DigitalSignatureController.signData'
      );
    }
  }

  @MessagePattern('digital-signature.verify')
  async verifySignature(
    @Payload() payload: { data: string; signature: string; publicKey: string }
  ) {
    try {
      this.logger.log(`Verifying signature`);
      const result = await this.digitalSignatureService.verifySignature(
        payload.data,
        payload.signature,
        payload.publicKey
      );
      return {
        message: result.isValid ? 'Signature is valid' : 'Invalid signature',
        isValid: result.isValid,
      };
    } catch (error) {
      this.logger.error(`Verify signature error: ${(error as Error).message}`);
      throw handleErrorFromMicroservices(
        error,
        'Failed to verify signature',
        'DigitalSignatureController.verifySignature'
      );
    }
  }
}