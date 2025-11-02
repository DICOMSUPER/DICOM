import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DigitalSignature, User } from '@backend/shared-domain';
import * as crypto from 'crypto';

@Injectable()
export class DigitalSignatureService {
  private readonly logger = new Logger(DigitalSignatureService.name);
  private readonly encryptionSecret = process.env.KEY_ENCRYPTION_SECRET || 'default-secret'; // 🔒 nên set trong .env

  constructor(
    @InjectRepository(DigitalSignature)
    private readonly signatureRepo: Repository<DigitalSignature>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  /** 🔐 Sinh cặp khóa RSA (2048 bit) cho user, lưu vào DB */
  private generateKeyPair() {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
    });

    const publicKeyPem = publicKey.export({ type: 'pkcs1', format: 'pem' }).toString();
    const privateKeyPem = privateKey.export({ type: 'pkcs1', format: 'pem' }).toString();

    return { publicKeyPem, privateKeyPem };
  }

  /** 🔒 Mã hoá private key bằng AES-256-CBC */
  private encryptPrivateKey(privateKey: string): string {
    const iv = crypto.randomBytes(16);
    const key = crypto.createHash('sha256').update(this.encryptionSecret).digest();
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);

    let encrypted = cipher.update(privateKey, 'utf8', 'base64');
    encrypted += cipher.final('base64');

    return iv.toString('base64') + ':' + encrypted;
  }

  /** 🔓 Giải mã private key */
  private decryptPrivateKey(encrypted: string): string {
    const [ivBase64, encryptedData] = encrypted.split(':');
    const iv = Buffer.from(ivBase64, 'base64');
    const key = crypto.createHash('sha256').update(this.encryptionSecret).digest();
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);

    let decrypted = decipher.update(encryptedData, 'base64', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  /** 🖋️ Ký dữ liệu và lưu chữ ký vào DB */
  async signData(userId: string, data: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    // 🔎 Kiểm tra user đã có keypair chưa
    let signatureRecord = await this.signatureRepo.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });

    let privateKeyPem: string;
    let publicKeyPem: string;

    if (!signatureRecord) {
      // 🔐 Chưa có -> sinh mới
      const { publicKeyPem: pub, privateKeyPem: priv } = this.generateKeyPair();
      privateKeyPem = priv;
      publicKeyPem = pub;

      const encryptedPrivateKey = this.encryptPrivateKey(privateKeyPem);

      signatureRecord = this.signatureRepo.create({
        signedData: '', // Chưa ký
        certificateSerial: 'USER_CERT_' + userId,
        algorithm: 'RSA-SHA256',
        publicKey: publicKeyPem,
        privateKeyEncrypted: encryptedPrivateKey,
        user,
      });

      await this.signatureRepo.save(signatureRecord);
    } else {
      // 🔓 Lấy lại private key đã mã hoá
      privateKeyPem = this.decryptPrivateKey(signatureRecord.privateKeyEncrypted!);
      publicKeyPem = signatureRecord.publicKey!;
    }

    // 🧾 Ký dữ liệu
    const sign = crypto.createSign('SHA256');
    sign.update(data);
    const signature = sign.sign(privateKeyPem, 'base64');

    // ✅ Lưu chữ ký mới vào DB
    signatureRecord.signedData = signature;
    await this.signatureRepo.save(signatureRecord);

    this.logger.log(`User ${userId} signed data successfully.`);
    return {
      signature,
      publicKeyPem,
    };
  }

  /** ✅ Xác minh chữ ký */
  async verifySignature(data: string, signature: string, publicKeyPem: string) {
    const verify = crypto.createVerify('SHA256');
    verify.update(data);
    const isValid = verify.verify(publicKeyPem, signature, 'base64');
    return { isValid };
  }
}
