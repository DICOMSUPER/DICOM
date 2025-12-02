import {
  Transport,
  ClientProxyFactory,
  ClientProxy,
} from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

import {
  CreateImageAnnotationDto,
  ImageAnnotation,
  DicomInstance,
} from '@backend/shared-domain';
import { AnnotationType, AnnotationStatus } from '@backend/shared-enums';
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

export function runImageAnnotationsE2ETests(port = 5003, host = 'localhost') {
  describe('ImageAnnotationsController (e2e)', () => {
    let client: ClientProxy;
    let createdAnnotationId: string | null = null;

    beforeAll(async () => {
      client = ClientProxyFactory.create({
        transport: Transport.TCP,
        options: { host, port },
      });
    });

    afterAll(async () => {
      // Cleanup if something remained
      if (createdAnnotationId) {
        const deletePattern = `${IMAGING_SERVICE}.ImageAnnotations.${MESSAGE_PATTERNS.DELETE}`;
        try {
          await firstValueFrom(
            client.send<boolean>(deletePattern, { id: createdAnnotationId })
          );
        } catch {}
      }
      await client.close();
    });

    it('should create an image annotation via message pattern', async () => {
      // Get all annotations first (priority step)
      const findAllAnnotationsPattern = `${IMAGING_SERVICE}.ImageAnnotations.${MESSAGE_PATTERNS.FIND_ALL}`;
      const existingAnnotations = await firstValueFrom(
        client.send<ImageAnnotation[]>(findAllAnnotationsPattern, {})
      );

      expect(Array.isArray(existingAnnotations)).toBe(true);

      // Get all instances, pick one random instanceId
      const findAllInstancesPattern = `${IMAGING_SERVICE}.DicomInstances.${MESSAGE_PATTERNS.FIND_ALL}`;
      const instances = await firstValueFrom(
        client.send<DicomInstance[]>(findAllInstancesPattern, {})
      );

      if (!instances || instances.length === 0) {
        throw new Error('No dicom instances available to attach annotation');
      }

      const randomInstance =
        instances[Math.floor(Math.random() * instances.length)];

      const createPattern = `${IMAGING_SERVICE}.ImageAnnotations.${MESSAGE_PATTERNS.CREATE}`;

      const dto: CreateImageAnnotationDto = {
        instanceId: randomInstance.id,
        annotationType: AnnotationType.LENGTH,
        annotationData: {
          type: 'Length',
          points: [
            { x: 100, y: 100 },
            { x: 200, y: 200 },
          ],
        },
        coordinates: { x: 150, y: 150 },
        measurementValue: 141.42,
        measurementUnit: 'mm',
        textContent: `E2E Annotation ${Date.now()}`,
        colorCode: '#FF5733',
        annotationStatus: AnnotationStatus.DRAFT,
        annotatorId: uuidv4(),
        annotationDate: new Date().toISOString(),
        notes: 'E2E test annotation',
      };

      const payload = { createImageAnnotationDto: dto };

      const created = await firstValueFrom(
        client.send<ImageAnnotation>(createPattern, payload)
      );

      expect(created).toBeDefined();
      expect(created.id).toBeDefined();
      expect(created.instanceId).toBe(dto.instanceId);
      expect(created.annotationType).toBe(dto.annotationType);

      createdAnnotationId = created.id;
    });

    it('should find all image annotations via message pattern', async () => {
      // Get all first (priority)
      const pattern = `${IMAGING_SERVICE}.ImageAnnotations.${MESSAGE_PATTERNS.FIND_ALL}`;
      const result = await firstValueFrom(
        client.send<ImageAnnotation[]>(pattern, {})
      );

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThanOrEqual(0);
    });

    it('should find one image annotation by ID via message pattern', async () => {
      // Get all first (priority)
      const findAllPattern = `${IMAGING_SERVICE}.ImageAnnotations.${MESSAGE_PATTERNS.FIND_ALL}`;
      const allAnnotations = await firstValueFrom(
        client.send<ImageAnnotation[]>(findAllPattern, {})
      );

      const targetId = createdAnnotationId ?? allAnnotations[0]?.id;
      if (!targetId) {
        throw new Error('No image annotations found to test findOne');
      }

      const findOnePattern = `${IMAGING_SERVICE}.ImageAnnotations.${MESSAGE_PATTERNS.FIND_ONE}`;
      const result = await firstValueFrom(
        client.send<ImageAnnotation | null>(findOnePattern, { id: targetId })
      );

      expect(result).toBeDefined();
      expect(result?.id).toBe(targetId);
    });

    it('should update an image annotation via message pattern', async () => {
      // Get all first (priority)
      const findAllPattern = `${IMAGING_SERVICE}.ImageAnnotations.${MESSAGE_PATTERNS.FIND_ALL}`;
      const allAnnotations = await firstValueFrom(
        client.send<ImageAnnotation[]>(findAllPattern, {})
      );

      const targetId = createdAnnotationId ?? allAnnotations[0]?.id;
      if (!targetId) {
        throw new Error('No image annotations found to test update');
      }

      const updatePattern = `${IMAGING_SERVICE}.ImageAnnotations.${MESSAGE_PATTERNS.UPDATE}`;
      const newTextContent = `Updated E2E Annotation ${Date.now()}`;
      const updatePayload = {
        id: targetId,
        updateImageAnnotationDto: {
          textContent: newTextContent,
          annotationStatus: AnnotationStatus.FINAL,
        },
      };

      const updated = await firstValueFrom(
        client.send<ImageAnnotation | null>(updatePattern, updatePayload)
      );

      expect(updated).toBeDefined();
      expect(updated?.id).toBe(targetId);
      expect(updated?.textContent).toBe(newTextContent);
      expect(updated?.annotationStatus).toBe(AnnotationStatus.FINAL);
    });

    it('should remove the created image annotation via message pattern', async () => {
      // Get all first (priority)
      const findAllPattern = `${IMAGING_SERVICE}.ImageAnnotations.${MESSAGE_PATTERNS.FIND_ALL}`;
      const allAnnotations = await firstValueFrom(
        client.send<ImageAnnotation[]>(findAllPattern, {})
      );

      const targetId =
        createdAnnotationId ??
        allAnnotations.find((a) => a.textContent?.startsWith('E2E Annotation'))
          ?.id;
      if (!targetId) {
        // If none found, skip deletion gracefully
        return;
      }

      const deletePattern = `${IMAGING_SERVICE}.ImageAnnotations.${MESSAGE_PATTERNS.DELETE}`;
      const result = await firstValueFrom(
        client.send<boolean>(deletePattern, { id: targetId })
      );

      expect(result).toBe(true);
      createdAnnotationId = null;
    });
  });
}
