import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { DigitalSignatureService } from './digital-signature.service';

@Controller()
export class DigitalSignatureController {
  private readonly logger = new Logger('DigitalSignatureController');

  constructor(
    private readonly digitalSignatureService: DigitalSignatureService,
  ) { }

  // Health check
  @MessagePattern('digital-signature.check-health')
  async checkHealth() {
    this.logger.log('Health check for Digital Signature service');
    return { status: 'ok', service: 'digital-signature' };
  }


}