import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';
import { DigitalSignatureRepository } from './digital-signature.repository';
import {
  DigitalSignatureNotFoundException,
  DigitalSignatureAlreadyExistsException,
  InvalidPinException,
  KeyGenerationFailedException,
  EncryptionFailedException,
  DecryptionFailedException,
  SigningFailedException,
  VerificationFailedException,
  UserNotFoundException,
  ResourceNotFoundException,
  BusinessLogicException,
} from '@backend/shared-exception';

@Injectable()
export class DigitalSignatureService {
  constructor(private readonly repo: DigitalSignatureRepository) {}

  private readonly logger = new Logger(DigitalSignatureService.name);

  private generateKeyPair() {
    try {
      const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
        modulusLength: 2048,
      });

      return {
        publicKeyPem: publicKey
          .export({ type: 'pkcs1', format: 'pem' })
          .toString(),
        privateKeyPem: privateKey
          .export({ type: 'pkcs1', format: 'pem' })
          .toString(),
      };
    } catch (error: any) {
      this.logger.error('Failed to generate RSA key pair', error.stack);
      throw new KeyGenerationFailedException({ originalError: error.message });
    }
  }

  private encryptPrivateKeyWithPin(privateKey: string, pin: string): string {
    try {
      const iv = crypto.randomBytes(16);
      const key = crypto.createHash('sha256').update(pin).digest();
      const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);

      let encrypted = cipher.update(privateKey, 'utf8', 'base64');
      encrypted += cipher.final('base64');

      return iv.toString('base64') + ':' + encrypted;
    } catch (error: any) {
      this.logger.error('Failed to encrypt private key', error.stack);
      throw new EncryptionFailedException({ originalError: error.message });
    }
  }

  private decryptPrivateKeyWithPin(encrypted: string, pin: string): string {
    try {
      const [ivBase64, encryptedData] = encrypted.split(':');
      const iv = Buffer.from(ivBase64, 'base64');
      const key = crypto.createHash('sha256').update(pin).digest();
      const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);

      let decrypted = decipher.update(encryptedData, 'base64', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error: any) {
      this.logger.error('Failed to decrypt private key', error.stack);
      throw new DecryptionFailedException({ originalError: error.message });
    }
  }

  async setupSignature(userId: string, pin: string) {
    const user = await this.repo.findUserById(userId);
    if (!user) throw new UserNotFoundException(userId);

    const exists = await this.repo.findSignatureByUserId(userId);
    if (exists) throw new DigitalSignatureAlreadyExistsException(userId);

    const pinHash = await bcrypt.hash(pin, 10);
    const { publicKeyPem, privateKeyPem } = this.generateKeyPair();
    const encryptedPrivateKey = this.encryptPrivateKeyWithPin(
      privateKeyPem,
      pin
    );

    const record = this.repo.createSignature({
      user,
      publicKey: publicKeyPem,
      privateKeyEncrypted: encryptedPrivateKey,
      pinHash,
      certificateSerial: `USER_CERT_${userId}`,
      algorithm: 'RSA-SHA256',
      signedData: '',
    });

    return {
      message: 'Digital signature has been created successfully',
      data: await this.repo.saveSignature(record),
    };
  }
  async signData(userId: string, pin: string, data: string) {
    const record = await this.repo.findSignatureWithPrivateKey(userId);
    if (!record) throw new DigitalSignatureNotFoundException(userId);

    const isPinMatch = await bcrypt.compare(pin, record.pinHash!);
    if (!isPinMatch) throw new InvalidPinException();

    const privateKeyPem = this.decryptPrivateKeyWithPin(
      record.privateKeyEncrypted!,
      pin
    );

    try {
      const sign = crypto.createSign('SHA256');
      sign.update(data);
      const signature = sign.sign(privateKeyPem, 'base64');

      return {
        signatureId: record.id,
        signature,
        publicKey: record.publicKey,
      };
    } catch (error: any) {
      this.logger.error('Failed to sign data', error.stack);
      throw new SigningFailedException({ originalError: error.message });
    }
  }

  async verifySignature(data: string, signature: string, publicKey: string) {
    try {
      const verify = crypto.createVerify('SHA256');
      verify.update(data);
      return { isValid: verify.verify(publicKey, signature, 'base64') };
    } catch (error: any) {
      this.logger.error('Signature verification failed', error.stack);
      throw new VerificationFailedException({ originalError: error.message });
    }
  }
  async getById(id: string) {
    if (!id) throw new BusinessLogicException('ID must be provided');
    const record = await this.repo.getById(id);
    if (!record) throw new ResourceNotFoundException('DigitalSignature', id);
    return record;
  }

  async getByUserId(userId: string) {
    const record = await this.repo.findSignatureByUserId(userId);
    if (!record) {
      throw new ResourceNotFoundException(
        'DigitalSignature',
        `userId: ${userId}. Digital signature not found. Please setup your digital signature first.`
      );
    }

    return {
      id: record.id,
      userId: record.userId,
      certificateSerial: record.certificateSerial,
      algorithm: record.algorithm,
      publicKey: record.publicKey,
      createdAt: record.createdAt,
    };
  }
}
