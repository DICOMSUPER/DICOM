import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DigitalSignature, User } from '@backend/shared-domain';

@Injectable()
export class DigitalSignatureRepository {
  constructor(
    @InjectRepository(DigitalSignature)
    private readonly signatureRepo: Repository<DigitalSignature>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) { }

  async findUserById(userId: string): Promise<User | null> {
    return await this.userRepo.findOne({ where: { id: userId } });
  }

  async findSignatureByUserId(userId: string): Promise<DigitalSignature | null> {
    return await this.signatureRepo.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });
  }

  async findSignatureWithPrivateKey(userId: string): Promise<DigitalSignature | null> {
    return await this.signatureRepo
      .createQueryBuilder('ds')
      .leftJoinAndSelect('ds.user', 'user')
      .addSelect(['ds.privateKeyEncrypted', 'ds.pinHash'])
      .where('user.id = :userId', { userId })
      .getOne();
  }


  async getById(id: string): Promise<DigitalSignature | null> {
    return await this.signatureRepo.findOne({
      where: { id },
      relations: ['user'],
    });
  }


  async saveSignature(record: DigitalSignature): Promise<DigitalSignature> {
    return await this.signatureRepo.save(record);
  }

  createSignature(data: Partial<DigitalSignature>) {
    return this.signatureRepo.create(data);
  }
}
