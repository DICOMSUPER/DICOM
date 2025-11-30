import {
  Transport,
  ClientProxyFactory,
  ClientProxy,
} from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

import {
  CreateDicomInstanceDto,
  DicomInstance,
  DicomSeries,
} from '@backend/shared-domain';
import {
  IMAGING_SERVICE,
  MESSAGE_PATTERNS,
} from '../../../support/constant/microservice.constant';

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function runDicomInstanceE2ETests(port = 5003, host = 'localhost') {
  describe('DicomInstanceController (e2e)', () => {
    let client: ClientProxy;
    let createdInstanceId: string | null = null;

    beforeAll(async () => {
      client = ClientProxyFactory.create({
        transport: Transport.TCP,
        options: { host, port },
      });
    });

    afterAll(async () => {
      // Cleanup if something remained
      if (createdInstanceId) {
        const deletePattern = `${IMAGING_SERVICE}.DicomInstances.${MESSAGE_PATTERNS.DELETE}`;
        try {
          await firstValueFrom(
            client.send<boolean>(deletePattern, { id: createdInstanceId })
          );
        } catch {}
      }
      await client.close();
    });

    it('should create a dicom instance via message pattern', async () => {
      // Get all instances first (priority step)
      const findAllInstancesPattern = `${IMAGING_SERVICE}.DicomInstances.${MESSAGE_PATTERNS.FIND_ALL}`;
      const existingInstances = await firstValueFrom(
        client.send<DicomInstance[]>(findAllInstancesPattern, {})
      );

      expect(Array.isArray(existingInstances)).toBe(true);

      // Get all series, pick one random seriesId
      const findAllSeriesPattern = `${IMAGING_SERVICE}.DicomSeries.${MESSAGE_PATTERNS.FIND_ALL}`;
      const series = await firstValueFrom(
        client.send<DicomSeries[]>(findAllSeriesPattern, {})
      );

      if (!series || series.length === 0) {
        throw new Error('No dicom series available to attach instance');
      }

      const randomSeries = series[Math.floor(Math.random() * series.length)];

      const createPattern = `${IMAGING_SERVICE}.DicomInstances.${MESSAGE_PATTERNS.CREATE}`;

      const dto: CreateDicomInstanceDto = {
        sopInstanceUid: uuidv4(),
        sopClassUID: uuidv4(),
        seriesId: randomSeries.id,
        instanceNumber: Math.floor(Math.random() * 100) + 1,
        filePath: `/e2e/path/${Date.now()}.dcm`,
        fileName: `E2E_Instance_${Date.now()}.dcm`,
        numberOfFrame: 1,
        imagePosition: { x: 0, y: 0, z: 0 },
        imageOrientation: { row: [1, 0, 0], col: [0, 1, 0] },
        pixelSpacing: { row: 0.5, col: 0.5 },
        sliceThickness: 5.0,
        windowCenter: 40,
        windowWidth: 400,
        rows: 512,
        columns: 512,
      };

      const payload = { createDicomInstanceDto: dto };

      const created = await firstValueFrom(
        client.send<DicomInstance>(createPattern, payload)
      );

      expect(created).toBeDefined();
      expect(created.id).toBeDefined();
      expect(created.seriesId).toBe(dto.seriesId);
      expect(created.sopInstanceUid).toBe(dto.sopInstanceUid);

      createdInstanceId = created.id;
    });

    it('should find all dicom instances via message pattern', async () => {
      // Get all first (priority)
      const pattern = `${IMAGING_SERVICE}.DicomInstances.${MESSAGE_PATTERNS.FIND_ALL}`;
      const result = await firstValueFrom(
        client.send<DicomInstance[]>(pattern, {})
      );

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThanOrEqual(0);
    });

    it('should find one dicom instance by ID via message pattern', async () => {
      // Get all first (priority)
      const findAllPattern = `${IMAGING_SERVICE}.DicomInstances.${MESSAGE_PATTERNS.FIND_ALL}`;
      const allInstances = await firstValueFrom(
        client.send<DicomInstance[]>(findAllPattern, {})
      );

      const targetId = createdInstanceId ?? allInstances[0]?.id;
      if (!targetId) {
        throw new Error('No dicom instances found to test findOne');
      }

      const findOnePattern = `${IMAGING_SERVICE}.DicomInstances.${MESSAGE_PATTERNS.FIND_ONE}`;
      const result = await firstValueFrom(
        client.send<DicomInstance | null>(findOnePattern, { id: targetId })
      );

      expect(result).toBeDefined();
      expect(result?.id).toBe(targetId);
    });

    it('should update a dicom instance via message pattern', async () => {
      // Get all first (priority)
      const findAllPattern = `${IMAGING_SERVICE}.DicomInstances.${MESSAGE_PATTERNS.FIND_ALL}`;
      const allInstances = await firstValueFrom(
        client.send<DicomInstance[]>(findAllPattern, {})
      );

      const targetId = createdInstanceId ?? allInstances[0]?.id;
      if (!targetId) {
        throw new Error('No dicom instances found to test update');
      }

      const updatePattern = `${IMAGING_SERVICE}.DicomInstances.${MESSAGE_PATTERNS.UPDATE}`;
      const newFileName = `Updated_E2E_${Date.now()}.dcm`;
      const updatePayload = {
        id: targetId,
        updateDicomInstanceDto: { fileName: newFileName },
      };

      const updated = await firstValueFrom(
        client.send<DicomInstance | null>(updatePattern, updatePayload)
      );

      expect(updated).toBeDefined();
      expect(updated?.id).toBe(targetId);
      expect(updated?.fileName).toBe(newFileName);
    });

    it('should remove the created dicom instance via message pattern', async () => {
      // Get all first (priority)
      const findAllPattern = `${IMAGING_SERVICE}.DicomInstances.${MESSAGE_PATTERNS.FIND_ALL}`;
      const allInstances = await firstValueFrom(
        client.send<DicomInstance[]>(findAllPattern, {})
      );

      const targetId =
        createdInstanceId ??
        allInstances.find((i) => i.fileName?.startsWith('E2E_Instance_'))?.id;
      if (!targetId) {
        // If none found, skip deletion gracefully
        return;
      }

      const deletePattern = `${IMAGING_SERVICE}.DicomInstances.${MESSAGE_PATTERNS.DELETE}`;
      const result = await firstValueFrom(
        client.send<boolean>(deletePattern, { id: targetId })
      );

      expect(result).toBe(true);
      createdInstanceId = null;
    });
  });
}
