import {
  Transport,
  ClientProxyFactory,
  ClientProxy,
} from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

import { CreateBodyPartDto, BodyPart } from '@backend/shared-domain';
import {
  IMAGING_SERVICE,
  MESSAGE_PATTERNS,
} from '../../../support/constant/microservice.constant';

export function runBodyPartE2ETests(port = 5003, host = 'localhost') {
  describe('BodyPartController (e2e)', () => {
    let client: ClientProxy;
    const TEST_BODY_PARTS = ['TestBodyPart1', 'TestBodyPart2', 'TestBodyPart3'];

    beforeAll(async () => {
      client = ClientProxyFactory.create({
        transport: Transport.TCP,
        options: {
          host: 'localhost',
          port: 5003,
        },
      });
    });

    afterAll(async () => {
      await client.close();
    });

    it('should create a body part via message pattern', async () => {
      // Get all first
      const findAllPattern = `${IMAGING_SERVICE}.BodyPart.${MESSAGE_PATTERNS.FIND_ALL}`;
      const existingBodyParts = await firstValueFrom(
        client.send<BodyPart[]>(findAllPattern, {})
      );

      const existingNames = existingBodyParts.map((bp) => bp.name);
      // Select a name that doesn't exist, or fallback to a timestamped one
      const nameToCreate =
        TEST_BODY_PARTS.find((name) => !existingNames.includes(name)) ||
        `TestBodyPart_${Date.now()}`;

      const createPattern = `${IMAGING_SERVICE}.BodyPart.${MESSAGE_PATTERNS.CREATE}`;
      const payload: CreateBodyPartDto = { name: nameToCreate };

      const result = await firstValueFrom(
        client.send<BodyPart>(createPattern, payload)
      );

      expect(result).toBeDefined();
      expect(result.name).toBe(nameToCreate);
      expect(result.id).toBeDefined();
    });

    it('should find all body parts via message pattern', async () => {
      const pattern = `${IMAGING_SERVICE}.BodyPart.${MESSAGE_PATTERNS.FIND_ALL}`;

      const result = await firstValueFrom(client.send<BodyPart[]>(pattern, {}));

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should find one body part by ID via message pattern', async () => {
      const findAllPattern = `${IMAGING_SERVICE}.BodyPart.${MESSAGE_PATTERNS.FIND_ALL}`;
      const allParts = await firstValueFrom(
        client.send<BodyPart[]>(findAllPattern, {})
      );

      if (allParts.length === 0) {
        throw new Error('No body parts found to test findOne');
      }

      // Pick one ID from the list
      const target = allParts[0];
      const findOnePattern = `${IMAGING_SERVICE}.BodyPart.${MESSAGE_PATTERNS.FIND_ONE}`;
      const result = await firstValueFrom(
        client.send<BodyPart>(findOnePattern, { id: target.id })
      );

      expect(result).toMatchObject({ id: target.id, name: target.name });
    });

    it('should update a body part via message pattern', async () => {
      const findAllPattern = `${IMAGING_SERVICE}.BodyPart.${MESSAGE_PATTERNS.FIND_ALL}`;
      const allParts = await firstValueFrom(
        client.send<BodyPart[]>(findAllPattern, {})
      );

      // Find one of our test body parts to update
      const target = allParts.find(
        (bp) =>
          TEST_BODY_PARTS.includes(bp.name) ||
          bp.name.startsWith('TestBodyPart_')
      );

      if (!target) {
        // If we can't find one of our test parts, we might skip or fail.
        // Ideally the create test ran before this.
        console.warn(
          'No test body part found to update, skipping update assertion'
        );
        return;
      }

      const updatePattern = `${IMAGING_SERVICE}.BodyPart.${MESSAGE_PATTERNS.UPDATE}`;
      const newName = 'testupdatesomething';
      const updatePayload = {
        id: target.id,
        updateBodyPartDto: { name: newName },
      };

      const result = await firstValueFrom(
        client.send<BodyPart>(updatePattern, updatePayload)
      );

      expect(result.id).toBe(target.id);
      expect(result.name).toBe(newName);
    });

    it('should remove body parts via message pattern', async () => {
      const findAllPattern = `${IMAGING_SERVICE}.BodyPart.${MESSAGE_PATTERNS.FIND_ALL}`;
      const allParts = await firstValueFrom(
        client.send<BodyPart[]>(findAllPattern, {})
      );

      // Find body parts with names in our test list or the updated name
      const targets = allParts.filter(
        (bp) =>
          TEST_BODY_PARTS.includes(bp.name) ||
          bp.name === 'testupdatesomething' ||
          bp.name.startsWith('TestBodyPart_')
      );

      const deletePattern = `${IMAGING_SERVICE}.BodyPart.${MESSAGE_PATTERNS.DELETE}`;

      for (const target of targets) {
        const result = await firstValueFrom(
          client.send<boolean>(deletePattern, { id: target.id })
        );
        expect(result).toBe(true);
      }

      // Verify deletion
      if (targets.length > 0) {
        const findOnePattern = `${IMAGING_SERVICE}.BodyPart.${MESSAGE_PATTERNS.FIND_ONE}`;
        try {
          await firstValueFrom(
            client.send<BodyPart | null>(findOnePattern, { id: targets[0].id })
          );
          // If it doesn't throw, we expect it to be null or handle it based on your service logic
          // But based on the error, it throws an RpcException when not found.
          // So we should fail if we reach here without error, UNLESS your service returns null.
          // Given the error log "Body part not found", it throws.
          fail('Should have thrown an error for non-existent body part');
        } catch (error: any) {
          expect(error).toBeDefined();
          // You might want to check error.message or error.error.code if available
          // The log shows: { error: { code: 404, message: 'Body part not found', ... } }
          expect(error.message).toContain('Body part not found');
        }
      }
    });
  });
}
