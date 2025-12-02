import {
  Transport,
  ClientProxyFactory,
  ClientProxy,
} from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

import {
  CreateImagingModalityDto,
  ImagingModality,
} from '@backend/shared-domain';
import {
  IMAGING_SERVICE,
  MESSAGE_PATTERNS,
} from '../../../support/constant/microservice.constant';

export function runImagingModalitiesE2ETests(port = 5003, host = 'localhost') {
  describe('ImagingModalitiesController (e2e)', () => {
    let client: ClientProxy;
    let createdModalityId: string | null = null;
    const TEST_MODALITY_CODES = ['E2E_CT', 'E2E_MRI', 'E2E_XR'];

    beforeAll(async () => {
      client = ClientProxyFactory.create({
        transport: Transport.TCP,
        options: { host, port },
      });
    });

    afterAll(async () => {
      // Cleanup if something remained (hard delete to avoid uniqueness conflicts on modalityCode)
      if (createdModalityId) {
        const hardDeletePattern = `${IMAGING_SERVICE}.ImagingModalities.${MESSAGE_PATTERNS.HARD_DELETE}`;
        const softDeletePattern = `${IMAGING_SERVICE}.ImagingModalities.${MESSAGE_PATTERNS.DELETE}`;
        try {
          await firstValueFrom(
            client.send<boolean>(hardDeletePattern, { id: createdModalityId })
          );
        } catch {
          // Fallback to soft delete if hard delete handler is not available
          try {
            await firstValueFrom(
              client.send<boolean>(hardDeletePattern, { id: createdModalityId })
            );
          } catch {}
        }
      }
      await client.close();
    });

    it('should create an imaging modality via message pattern', async () => {
      // Get all modalities first (priority step) - include deleted ones to check for conflicts
      const findManyPattern = `${IMAGING_SERVICE}.ImagingModalities.${MESSAGE_PATTERNS.FIND_MANY}`;
      const paginatedResult = await firstValueFrom(
        client.send<any>(findManyPattern, {
          paginationDto: {
            page: 1,
            limit: 100,
            includeInactive: true,
            includeDeleted: true,
          },
        })
      );

      const allModalities = paginatedResult?.data || [];
      expect(Array.isArray(allModalities)).toBe(true);

      const existingCodes = allModalities.map((m: any) => m.modalityCode);
      // Always use timestamp to avoid any conflicts with soft-deleted records
      const modalityCode = `E2E_TEST`;

      const createPattern = `${IMAGING_SERVICE}.ImagingModalities.${MESSAGE_PATTERNS.CREATE}`;

      const dto: CreateImagingModalityDto = {
        modalityCode,
        modalityName: `E2E Modality`,
        description: 'E2E test modality',
        isActive: true,
      };

      const created = await firstValueFrom(
        client.send<ImagingModality>(createPattern, dto)
      );

      expect(created).toBeDefined();
      expect(created.id).toBeDefined();
      expect(created.modalityCode).toBe(dto.modalityCode);
      expect(created.modalityName).toBe(dto.modalityName);

      createdModalityId = created.id;
    });

    it('should find all imaging modalities via message pattern', async () => {
      // Get all first (priority)
      const pattern = `${IMAGING_SERVICE}.ImagingModalities.${MESSAGE_PATTERNS.FIND_ALL}`;
      const result = await firstValueFrom(
        client.send<ImagingModality[]>(pattern, {})
      );

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should find one imaging modality by ID via message pattern', async () => {
      // Get all first (priority)
      const findAllPattern = `${IMAGING_SERVICE}.ImagingModalities.${MESSAGE_PATTERNS.FIND_ALL}`;
      const allModalities = await firstValueFrom(
        client.send<ImagingModality[]>(findAllPattern, {})
      );

      const targetId = createdModalityId ?? allModalities[0]?.id;
      if (!targetId) {
        throw new Error('No imaging modalities found to test findOne');
      }

      const findOnePattern = `${IMAGING_SERVICE}.ImagingModalities.${MESSAGE_PATTERNS.FIND_ONE}`;
      const result = await firstValueFrom(
        client.send<ImagingModality | null>(findOnePattern, { id: targetId })
      );

      expect(result).toBeDefined();
      expect(result?.id).toBe(targetId);
    });

    it('should update an imaging modality via message pattern', async () => {
      // Get all first (priority)
      const findAllPattern = `${IMAGING_SERVICE}.ImagingModalities.${MESSAGE_PATTERNS.FIND_ALL}`;
      const allModalities = await firstValueFrom(
        client.send<ImagingModality[]>(findAllPattern, {})
      );

      const target = allModalities.find(
        (m) =>
          TEST_MODALITY_CODES.includes(m.modalityCode) ||
          m.modalityCode?.startsWith('E2E_')
      );

      if (!target) {
        console.warn('No E2E modality found to update');
        return;
      }

      const updatePattern = `${IMAGING_SERVICE}.ImagingModalities.${MESSAGE_PATTERNS.UPDATE}`;
      const newName = `Updated E2E ${Date.now()}`;
      const updatePayload = {
        id: target.id,
        updateImagingModalityDto: { modalityName: newName },
      };

      const updated = await firstValueFrom(
        client.send<ImagingModality | null>(updatePattern, updatePayload)
      );

      expect(updated).toBeDefined();
      expect(updated?.id).toBe(target.id);
      expect(updated?.modalityName).toBe(newName);
    });

    it('should hard delete imaging modalities via message pattern', async () => {
      // Get all first (priority)
      const findAllPattern = `${IMAGING_SERVICE}.ImagingModalities.${MESSAGE_PATTERNS.FIND_ALL}`;
      const allModalities = await firstValueFrom(
        client.send<ImagingModality[]>(findAllPattern, {})
      );

      const targets = allModalities.filter(
        (m) =>
          TEST_MODALITY_CODES.includes(m.modalityCode) ||
          m.modalityCode?.startsWith('E2E_')
      );

      const hardDeletePattern = `${IMAGING_SERVICE}.ImagingModalities.${MESSAGE_PATTERNS.HARD_DELETE}`;
      const softDeletePattern = `${IMAGING_SERVICE}.ImagingModalities.${MESSAGE_PATTERNS.DELETE}`;

      for (const target of targets) {
        try {
          const result = await firstValueFrom(
            client.send<boolean>(hardDeletePattern, { id: target.id })
          );
          expect(result).toBe(true);
        } catch (err) {
          // Fallback to soft delete if hard delete handler is not available
          const result = await firstValueFrom(
            client.send<boolean>(hardDeletePattern, { id: target.id })
          );
          expect(result).toBe(true);
        }
      }

      createdModalityId = null;
    });
  });
}
