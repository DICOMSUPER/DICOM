import {
  Transport,
  ClientProxyFactory,
  ClientProxy,
} from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

import {
  CreateImageSegmentationLayerDto,
  ImageSegmentationLayer,
  DicomInstance,
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

export function runImageSegmentationLayersE2ETests(
  port = 5003,
  host = 'localhost'
) {
  describe('ImageSegmentationLayersController (e2e)', () => {
    let client: ClientProxy;
    let createdLayerId: string | null = null;

    beforeAll(async () => {
      client = ClientProxyFactory.create({
        transport: Transport.TCP,
        options: { host, port },
      });
    });

    afterAll(async () => {
      // Cleanup if something remained
      if (createdLayerId) {
        const deletePattern = `${IMAGING_SERVICE}.ImageSegmentationLayers.${MESSAGE_PATTERNS.DELETE}`;
        try {
          await firstValueFrom(
            client.send<boolean>(deletePattern, { id: createdLayerId })
          );
        } catch {}
      }
      await client.close();
    });

    it('should create an image segmentation layer via message pattern', async () => {
      // Get all layers first (priority step)
      const findAllLayersPattern = `${IMAGING_SERVICE}.ImageSegmentationLayers.${MESSAGE_PATTERNS.FIND_ALL}`;
      const existingLayers = await firstValueFrom(
        client.send<ImageSegmentationLayer[]>(findAllLayersPattern, {})
      );

      expect(Array.isArray(existingLayers)).toBe(true);

      // Get all instances, pick one random instanceId
      const findAllInstancesPattern = `${IMAGING_SERVICE}.DicomInstances.${MESSAGE_PATTERNS.FIND_ALL}`;
      const instances = await firstValueFrom(
        client.send<DicomInstance[]>(findAllInstancesPattern, {})
      );

      if (!instances || instances.length === 0) {
        throw new Error(
          'No dicom instances available to attach segmentation layer'
        );
      }

      const randomInstance =
        instances[Math.floor(Math.random() * instances.length)];

      const createPattern = `${IMAGING_SERVICE}.ImageSegmentationLayers.${MESSAGE_PATTERNS.CREATE}`;

      const dto: CreateImageSegmentationLayerDto = {
        layerName: `E2E Layer ${Date.now()}`,
        instanceId: randomInstance.id,
        segmentatorId: uuidv4(),
        notes: 'E2E test segmentation layer',
        frame: 1,
        snapshots: [
          {
            segmentIndex: 0,
            label: 'Lung',
            color: '#FF0000',
            opacity: 0.5,
            segmentData: {
              type: 'polygon',
              points: [
                [10, 10],
                [50, 10],
                [50, 50],
                [10, 50],
              ],
            },
          },
          {
            segmentIndex: 1,
            label: 'Heart',
            color: '#00FF00',
            opacity: 0.6,
            segmentData: {
              type: 'polygon',
              points: [
                [60, 60],
                [100, 60],
                [100, 100],
                [60, 100],
              ],
            },
          },
        ],
      };

      const payload = { createImageSegmentationLayerDto: dto };

      const created = await firstValueFrom(
        client.send<ImageSegmentationLayer>(createPattern, payload)
      );

      expect(created).toBeDefined();
      expect(created.id).toBeDefined();
      expect(created.instanceId).toBe(dto.instanceId);
      expect(created.layerName).toBe(dto.layerName);

      createdLayerId = created.id;
    });

    it('should find all image segmentation layers via message pattern', async () => {
      // Get all first (priority)
      const pattern = `${IMAGING_SERVICE}.ImageSegmentationLayers.${MESSAGE_PATTERNS.FIND_ALL}`;
      const result = await firstValueFrom(
        client.send<ImageSegmentationLayer[]>(pattern, {})
      );

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThanOrEqual(0);
    });

    it('should find one image segmentation layer by ID via message pattern', async () => {
      // Get all first (priority)
      const findAllPattern = `${IMAGING_SERVICE}.ImageSegmentationLayers.${MESSAGE_PATTERNS.FIND_ALL}`;
      const allLayers = await firstValueFrom(
        client.send<ImageSegmentationLayer[]>(findAllPattern, {})
      );

      const targetId = createdLayerId ?? allLayers[0]?.id;
      if (!targetId) {
        throw new Error('No image segmentation layers found to test findOne');
      }

      const findOnePattern = `${IMAGING_SERVICE}.ImageSegmentationLayers.${MESSAGE_PATTERNS.FIND_ONE}`;
      const result = await firstValueFrom(
        client.send<ImageSegmentationLayer | null>(findOnePattern, {
          id: targetId,
        })
      );

      expect(result).toBeDefined();
      expect(result?.id).toBe(targetId);
    });

    it('should update an image segmentation layer via message pattern', async () => {
      // Get all first (priority)
      const findAllPattern = `${IMAGING_SERVICE}.ImageSegmentationLayers.${MESSAGE_PATTERNS.FIND_ALL}`;
      const allLayers = await firstValueFrom(
        client.send<ImageSegmentationLayer[]>(findAllPattern, {})
      );

      const targetId = createdLayerId ?? allLayers[0]?.id;
      if (!targetId) {
        throw new Error('No image segmentation layers found to test update');
      }

      const updatePattern = `${IMAGING_SERVICE}.ImageSegmentationLayers.${MESSAGE_PATTERNS.UPDATE}`;
      const newLayerName = `Updated E2E Layer ${Date.now()}`;
      const updatePayload = {
        id: targetId,
        updateImageSegmentationLayerDto: {
          layerName: newLayerName,
          notes: 'Updated notes',
        },
      };

      const updated = await firstValueFrom(
        client.send<ImageSegmentationLayer | null>(updatePattern, updatePayload)
      );

      expect(updated).toBeDefined();
      expect(updated?.id).toBe(targetId);
      expect(updated?.layerName).toBe(newLayerName);
    });

    it('should remove the created image segmentation layer via message pattern', async () => {
      // Get all first (priority)
      const findAllPattern = `${IMAGING_SERVICE}.ImageSegmentationLayers.${MESSAGE_PATTERNS.FIND_ALL}`;
      const allLayers = await firstValueFrom(
        client.send<ImageSegmentationLayer[]>(findAllPattern, {})
      );

      const targetId =
        createdLayerId ??
        allLayers.find((l) => l.layerName?.startsWith('E2E Layer'))?.id;
      if (!targetId) {
        // If none found, skip deletion gracefully
        return;
      }

      const deletePattern = `${IMAGING_SERVICE}.ImageSegmentationLayers.${MESSAGE_PATTERNS.DELETE}`;
      const result = await firstValueFrom(
        client.send<boolean>(deletePattern, { id: targetId })
      );

      expect(result).toBe(true);
      createdLayerId = null;
    });
  });
}
