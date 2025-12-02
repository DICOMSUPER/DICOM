import {
  Transport,
  ClientProxyFactory,
  ClientProxy,
} from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

import { ImagingOrderForm } from '@backend/shared-domain';
import { OrderFormStatus } from '@backend/shared-enums';
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

export function runImagingOrderFormsE2ETests(port = 5003, host = 'localhost') {
  describe('ImagingOrderFormController (e2e)', () => {
    let client: ClientProxy;
    let createdOrderFormId: string | null = null;
    let createdImagingOrderIds: string[] = [];

    beforeAll(async () => {
      client = ClientProxyFactory.create({
        transport: Transport.TCP,
        options: { host, port },
      });
    });

    afterAll(async () => {
      // Cleanup imaging orders first
      if (createdImagingOrderIds.length > 0) {
        const deleteOrderPattern = `${IMAGING_SERVICE}.ImagingOrders.${MESSAGE_PATTERNS.DELETE}`;
        for (const orderId of createdImagingOrderIds) {
          try {
            await firstValueFrom(
              client.send<boolean>(deleteOrderPattern, { id: orderId })
            );
          } catch {}
        }
      }

      // Then cleanup order form
      if (createdOrderFormId) {
        const deletePattern = `${IMAGING_SERVICE}.ImagingOrderForm.${MESSAGE_PATTERNS.DELETE}`;
        try {
          await firstValueFrom(
            client.send<boolean>(deletePattern, { id: createdOrderFormId })
          );
        } catch {}
      }
      await client.close();
    });

    it('should create an imaging order form via message pattern', async () => {
      // Get all order forms first (priority step)
      const findAllPattern = `${IMAGING_SERVICE}.ImagingOrderForm.${MESSAGE_PATTERNS.FIND_ALL}`;
      const existingOrderForms = await firstValueFrom(
        client.send<any>(findAllPattern, {
          filter: {},
          userId: uuidv4(),
        })
      );

      expect(existingOrderForms).toBeDefined();

      const createPattern = `${IMAGING_SERVICE}.ImagingOrderForm.${MESSAGE_PATTERNS.CREATE}`;

      const dto = {
        patientId: uuidv4(),
        encounterId: uuidv4(),
        orderFormStatus: OrderFormStatus.IN_PROGRESS,
        roomId: uuidv4(),
        diagnosis: 'E2E Test Diagnosis',
        notes: `E2E Order Form ${Date.now()}`,
        imagingOrders: [
          {
            modalityId: uuidv4(),
            bodyPartId: uuidv4(),
            orderStatus: 'pending',
            urgency: 'routine',
            clinicalNotes: 'E2E test order',
          },
        ],
      };

      const payload = {
        createImagingOrderFormDto: dto,
        userId: uuidv4(),
      };

      const created = await firstValueFrom(
        client.send<ImagingOrderForm>(createPattern, payload)
      );

      expect(created).toBeDefined();
      expect(created.id).toBeDefined();
      expect(created.patientId).toBe(dto.patientId);

      createdOrderFormId = created.id;

      // Store imaging order IDs for cleanup
      if (created.imagingOrders && Array.isArray(created.imagingOrders)) {
        createdImagingOrderIds = created.imagingOrders.map(
          (order: any) => order.id
        );
      }
    });

    it('should find all imaging order forms via message pattern', async () => {
      // Get all first (priority)
      const pattern = `${IMAGING_SERVICE}.ImagingOrderForm.${MESSAGE_PATTERNS.FIND_ALL}`;
      const result = await firstValueFrom(
        client.send<any>(pattern, {
          filter: {},
          userId: uuidv4(),
        })
      );

      expect(result).toBeDefined();
    });

    it('should find one imaging order form by ID via message pattern', async () => {
      if (!createdOrderFormId) {
        console.warn('No order form created to test findOne');
        return;
      }

      const findOnePattern = `${IMAGING_SERVICE}.ImagingOrderForm.${MESSAGE_PATTERNS.FIND_ONE}`;
      const result = await firstValueFrom(
        client.send<ImagingOrderForm | null>(findOnePattern, {
          id: createdOrderFormId,
        })
      );

      expect(result).toBeDefined();
      expect(result?.id).toBe(createdOrderFormId);
    });

    it('should update an imaging order form via message pattern', async () => {
      if (!createdOrderFormId) {
        console.warn('No order form created to test update');
        return;
      }

      // First, mark all imaging orders as completed
      if (createdImagingOrderIds.length > 0) {
        const updateOrderPattern = `${IMAGING_SERVICE}.ImagingOrders.${MESSAGE_PATTERNS.UPDATE}`;
        for (const orderId of createdImagingOrderIds) {
          await firstValueFrom(
            client.send<any>(updateOrderPattern, {
              id: orderId,
              updateImagingOrderDto: { orderStatus: 'completed' },
            })
          );
        }
      }

      const updatePattern = `${IMAGING_SERVICE}.ImagingOrderForm.${MESSAGE_PATTERNS.UPDATE}`;
      const newNotes = `Updated E2E ${Date.now()}`;
      const updatePayload = {
        id: createdOrderFormId,
        updateDto: {
          notes: newNotes,
          orderFormStatus: OrderFormStatus.COMPLETED,
        },
      };

      const updated = await firstValueFrom(
        client.send<ImagingOrderForm | null>(updatePattern, updatePayload)
      );

      expect(updated).toBeDefined();
      expect(updated?.id).toBe(createdOrderFormId);
      expect(updated?.notes).toBe(newNotes);
    });

    it('should remove the created imaging order form via message pattern', async () => {
      if (!createdOrderFormId) {
        return;
      }

      const deletePattern = `${IMAGING_SERVICE}.ImagingOrderForm.${MESSAGE_PATTERNS.DELETE}`;
      const result = await firstValueFrom(
        client.send<boolean>(deletePattern, { id: createdOrderFormId })
      );

      expect(result).toBe(true);
      createdOrderFormId = null;
    });
  });
}
