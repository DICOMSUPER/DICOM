import {
  Transport,
  ClientProxyFactory,
  ClientProxy,
} from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

import {
  CreateDicomSeriesDto,
  DicomSeries,
  DicomStudy,
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

function randomTime() {
  const hh = String(Math.floor(Math.random() * 24)).padStart(2, '0');
  const mm = String(Math.floor(Math.random() * 60)).padStart(2, '0');
  const ss = String(Math.floor(Math.random() * 60)).padStart(2, '0');
  return `${hh}:${mm}:${ss}`;
}

export function runDicomSeriesE2ETests(port = 5003, host = 'localhost') {
  describe('DicomSeriesController (e2e)', () => {
    let client: ClientProxy;
    let createdSeriesId: string | null = null;

    beforeAll(async () => {
      client = ClientProxyFactory.create({
        transport: Transport.TCP,
        options: { host, port },
      });
    });

    afterAll(async () => {
      // Cleanup if something remained
      if (createdSeriesId) {
        const deletePattern = `${IMAGING_SERVICE}.DicomSeries.${MESSAGE_PATTERNS.DELETE}`;
        try {
          await firstValueFrom(
            client.send<boolean>(deletePattern, { id: createdSeriesId })
          );
        } catch {}
      }
      await client.close();
    });

    it('should create a dicom series via message pattern', async () => {
      // Get all series first (priority step)
      const findAllSeriesPattern = `${IMAGING_SERVICE}.DicomSeries.${MESSAGE_PATTERNS.FIND_ALL}`;
      const existingSeries = await firstValueFrom(
        client.send<DicomSeries[]>(findAllSeriesPattern, {})
      );

      expect(Array.isArray(existingSeries)).toBe(true);

      // Get all studies, pick one random studyId
      const findAllStudiesPattern = `${IMAGING_SERVICE}.DicomStudies.${MESSAGE_PATTERNS.FIND_ALL}`;
      const studies = await firstValueFrom(
        client.send<DicomStudy[]>(findAllStudiesPattern, {})
      );

      if (!studies || studies.length === 0) {
        throw new Error('No dicom studies available to attach series');
      }

      const randomStudy = studies[Math.floor(Math.random() * studies.length)];

      const createPattern = `${IMAGING_SERVICE}.DicomSeries.${MESSAGE_PATTERNS.CREATE}`;

      const dto: CreateDicomSeriesDto = {
        seriesInstanceUid: uuidv4(),
        studyId: randomStudy.id,
        seriesNumber: Math.floor(Math.random() * 100) + 1,
        seriesDescription: `E2E Series ${Date.now()}`,
        bodyPartExamined: 'CHEST',
        seriesDate: new Date(),
        seriesTime: randomTime(),
        protocolName: 'E2E Protocol',
        numberOfInstances: 0,
      };

      const payload = { createDicomSeriesDto: dto };

      const created = await firstValueFrom(
        client.send<DicomSeries>(createPattern, payload)
      );

      expect(created).toBeDefined();
      expect(created.id).toBeDefined();
      expect(created.studyId).toBe(dto.studyId);
      expect(created.seriesInstanceUid).toBe(dto.seriesInstanceUid);

      createdSeriesId = created.id;
    });

    it('should find all dicom series via message pattern', async () => {
      // Get all first (priority)
      const pattern = `${IMAGING_SERVICE}.DicomSeries.${MESSAGE_PATTERNS.FIND_ALL}`;
      const result = await firstValueFrom(
        client.send<DicomSeries[]>(pattern, {})
      );

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThanOrEqual(0);
    });

    it('should find one dicom series by ID via message pattern', async () => {
      // Get all first (priority)
      const findAllPattern = `${IMAGING_SERVICE}.DicomSeries.${MESSAGE_PATTERNS.FIND_ALL}`;
      const allSeries = await firstValueFrom(
        client.send<DicomSeries[]>(findAllPattern, {})
      );

      const targetId = createdSeriesId ?? allSeries[0]?.id;
      if (!targetId) {
        throw new Error('No dicom series found to test findOne');
      }

      const findOnePattern = `${IMAGING_SERVICE}.DicomSeries.${MESSAGE_PATTERNS.FIND_ONE}`;
      const result = await firstValueFrom(
        client.send<DicomSeries | null>(findOnePattern, { id: targetId })
      );

      expect(result).toBeDefined();
      expect(result?.id).toBe(targetId);
    });

    it('should update a dicom series via message pattern', async () => {
      // Get all first (priority)
      const findAllPattern = `${IMAGING_SERVICE}.DicomSeries.${MESSAGE_PATTERNS.FIND_ALL}`;
      const allSeries = await firstValueFrom(
        client.send<DicomSeries[]>(findAllPattern, {})
      );

      const targetId = createdSeriesId ?? allSeries[0]?.id;
      if (!targetId) {
        throw new Error('No dicom series found to test update');
      }

      const updatePattern = `${IMAGING_SERVICE}.DicomSeries.${MESSAGE_PATTERNS.UPDATE}`;
      const newDescription = `Updated E2E Series ${Date.now()}`;
      const updatePayload = {
        id: targetId,
        updateDicomSeriesDto: { seriesDescription: newDescription },
      };

      const updated = await firstValueFrom(
        client.send<DicomSeries | null>(updatePattern, updatePayload)
      );

      expect(updated).toBeDefined();
      expect(updated?.id).toBe(targetId);
      expect(updated?.seriesDescription).toBe(newDescription);
    });

    it('should remove the created dicom series via message pattern', async () => {
      // Get all first (priority)
      const findAllPattern = `${IMAGING_SERVICE}.DicomSeries.${MESSAGE_PATTERNS.FIND_ALL}`;
      const allSeries = await firstValueFrom(
        client.send<DicomSeries[]>(findAllPattern, {})
      );

      const targetId =
        createdSeriesId ??
        allSeries.find((s) => s.seriesDescription?.startsWith('E2E Series'))
          ?.id;
      if (!targetId) {
        // If none found, skip deletion gracefully
        return;
      }

      const deletePattern = `${IMAGING_SERVICE}.DicomSeries.${MESSAGE_PATTERNS.DELETE}`;
      const result = await firstValueFrom(
        client.send<boolean>(deletePattern, { id: targetId })
      );

      expect(result).toBe(true);
      createdSeriesId = null;
    });
  });
}
