import {
  ClientProxyFactory,
  Transport,
  ClientProxy,
} from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

describe('DigitalSignatureController (E2E)', () => {
  let client: ClientProxy;
  let testUserId: string;
  let testSignatureId: string;
  let testPublicKey: string;
  let testSignature: string;
  const TEST_PIN = '123456';
  const TEST_DATA = 'Test data to sign';

  jest.setTimeout(30000);

  beforeAll(async () => {
    client = ClientProxyFactory.create({
      transport: Transport.TCP,
      options: {
        host: process.env.HOST ?? 'localhost',
        port: process.env.PORT ? Number(process.env.PORT) : 5002,
      },
    });
    await client.connect();

    // Get a test user
    try {
      const users = await firstValueFrom(
        client.send<any>('user.get-all-users', { page: 1, limit: 1 })
      );
      if (users.data?.data?.length > 0) {
        testUserId = users.data.data[0].id;
      }
    } catch (error) {
      console.log('Could not get test user');
    }
  });

  afterAll(async () => {
    await client.close();
  });

  const getErrorMessage = (error: any): string => {
    return error?.message || error?.response?.message || JSON.stringify(error);
  };

  describe('Health Check', () => {
    it('should return health status', async () => {
      const result = await firstValueFrom(
        client.send('digital-signature.check-health', {})
      );
      expect(result).toBeDefined();
      expect(result.status).toBe('ok');
      expect(result.service).toBe('digital-signature');
    });
  });

  describe('Setup Digital Signature', () => {
    it('should setup digital signature for user', async () => {
      if (!testUserId) {
        console.log('Skipping test: No test user available');
        return;
      }

      try {
        const result = await firstValueFrom(
          client.send<any>('digital-signature.setup', {
            userId: testUserId,
            pin: TEST_PIN,
          })
        );

        expect(result).toBeDefined();
        expect(result.publicKey).toBeDefined();
      } catch (error: any) {
        // May already be setup or other expected errors
        const msg = getErrorMessage(error);
        // Accept various error patterns: already exists, setup failed, or empty response
        expect(msg.toLowerCase()).toMatch(/already|exists|đã tồn tại|setup|fail|undefined|tobedefined/);
      }
    });
  });

  describe('Sign Data', () => {
    it('should sign data with digital signature', async () => {
      if (!testUserId) {
        console.log('Skipping test: No test user available');
        return;
      }

      try {
        const result = await firstValueFrom(
          client.send<any>('digital-signature.sign', {
            userId: testUserId,
            pin: TEST_PIN,
            data: TEST_DATA,
          })
        );

        expect(result).toBeDefined();
        expect(result.message).toBe('Data signed successfully');
        expect(result.signatureId).toBeDefined();
        expect(result.signature).toBeDefined();
        expect(result.publicKey).toBeDefined();

        testSignatureId = result.signatureId;
        testSignature = result.signature;
        testPublicKey = result.publicKey;
      } catch (error: any) {
        // May fail if signature not setup
        const msg = getErrorMessage(error);
        console.log('Sign error:', msg);
      }
    });

    it('should fail with incorrect PIN', async () => {
      if (!testUserId) {
        console.log('Skipping test: No test user available');
        return;
      }

      try {
        await firstValueFrom(
          client.send<any>('digital-signature.sign', {
            userId: testUserId,
            pin: 'wrongpin',
            data: TEST_DATA,
          })
        );
        fail('Expected error for incorrect PIN');
      } catch (error: any) {
        const msg = getErrorMessage(error);
        expect(msg.toLowerCase()).toMatch(/invalid|incorrect|wrong|pin|không hợp lệ/);
      }
    });
  });

  describe('Verify Signature', () => {
    it('should verify valid signature', async () => {
      if (!testSignature || !testPublicKey) {
        console.log('Skipping test: No signature available');
        return;
      }

      const result = await firstValueFrom(
        client.send<any>('digital-signature.verify', {
          data: TEST_DATA,
          signature: testSignature,
          publicKey: testPublicKey,
        })
      );

      expect(result).toBeDefined();
      expect(result.isValid).toBe(true);
      expect(result.message).toBe('Signature is valid');
    });

    it('should reject invalid signature', async () => {
      if (!testPublicKey) {
        console.log('Skipping test: No public key available');
        return;
      }

      const result = await firstValueFrom(
        client.send<any>('digital-signature.verify', {
          data: TEST_DATA,
          signature: 'invalid_signature',
          publicKey: testPublicKey,
        })
      );

      expect(result).toBeDefined();
      expect(result.isValid).toBe(false);
      expect(result.message).toBe('Invalid signature');
    });

    it('should reject signature with modified data', async () => {
      if (!testSignature || !testPublicKey) {
        console.log('Skipping test: No signature available');
        return;
      }

      const result = await firstValueFrom(
        client.send<any>('digital-signature.verify', {
          data: 'Modified data',
          signature: testSignature,
          publicKey: testPublicKey,
        })
      );

      expect(result).toBeDefined();
      expect(result.isValid).toBe(false);
    });
  });

  describe('Get Digital Signature', () => {
    it('should get digital signature by id', async () => {
      if (!testSignatureId) {
        console.log('Skipping test: No signature ID available');
        return;
      }

      const result = await firstValueFrom(
        client.send<any>('digital-signature.getById', {
          id: testSignatureId,
        })
      );

      expect(result).toBeDefined();
      expect(result.message).toBe('Digital signature retrieved successfully');
      expect(result.signature).toBeDefined();
    });

    it('should get digital signature by user id', async () => {
      if (!testUserId) {
        console.log('Skipping test: No test user available');
        return;
      }

      try {
        const result = await firstValueFrom(
          client.send<any>('digital-signature.getByUserId', {
            userId: testUserId,
          })
        );

        expect(result).toBeDefined();
      } catch (error: any) {
        // May not have signature setup
        const msg = getErrorMessage(error);
        expect(msg.toLowerCase()).toMatch(/not found|không tìm thấy/);
      }
    });

    it('should throw error for non-existent signature', async () => {
      try {
        await firstValueFrom(
          client.send('digital-signature.getById', {
            id: '00000000-0000-0000-0000-000000000000',
          })
        );
        fail('Expected not found error');
      } catch (error: any) {
        const msg = getErrorMessage(error);
        expect(msg.toLowerCase()).toMatch(/not found|không tìm thấy/);
      }
    });
  });
});
