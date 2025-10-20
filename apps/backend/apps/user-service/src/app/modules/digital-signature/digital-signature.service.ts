import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DigitalSignature, User } from '@backend/shared-domain';
import * as crypto from 'crypto';

@Injectable()
export class DigitalSignatureService {
  constructor(
    @InjectRepository(DigitalSignature)
    private signatureRepo: Repository<DigitalSignature>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async signData(userId: string, data: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new Error('User not found');

  
    const privateKey = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 }).privateKey;
    const sign = crypto.createSign('SHA256');
    sign.update(data);
    const signature = sign.sign(privateKey, 'base64');

    const newSignature = this.signatureRepo.create({
      signedData: signature,
      certificateSerial: 'MOCK_SERIAL_123',
      algorithm: 'RSA-SHA256',
      user,
    });
    return this.signatureRepo.save(newSignature);
  }

  async verifySignature(data: string, signature: string, publicKeyPem: string) {
    const verify = crypto.createVerify('SHA256');
    verify.update(data);
    return verify.verify(publicKeyPem, signature, 'base64');
  }
}