import {
  Transport,
  ClientProxyFactory,
  ClientProxy,
} from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

import {
  CreateImagingOrderDto,
  ImagingOrder,
  ImagingOrderForm,
} from '@backend/shared-domain';
import { OrderFormStatus, OrderStatus } from '@backend/shared-enums';
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

export function runImagingOrdersE2ETests(port = 5003, host = 'localhost') {
  describe('ImagingOrdersController (e2e)', () => {
    let client: ClientProxy;
    let createdOrderId: string | null = null;

    beforeAll(async () => {
      client = ClientProxyFactory.create({
        transport: Transport.TCP,
        options: { host, port },
      });
    });

    afterAll(async () => {
      // Cleanup if something remained
      if (createdOrderId) {
        const deletePattern = `${IMAGING_SERVICE}.ImagingOrders.${MESSAGE_PATTERNS.DELETE}`;
        try {
          await firstValueFrom(
            client.send<boolean>(deletePattern, { id: createdOrderId })
          );
        } catch {}
      }
      await client.close();
    });

    it('should create an imaging order via message pattern', async () => {
      // Get all orders first (priority step)
      const findAllOrdersPattern = `${IMAGING_SERVICE}.ImagingOrders.${MESSAGE_PATTERNS.FIND_ALL}`;
      const existingOrders = await firstValueFrom(
        client.send<ImagingOrder[]>(findAllOrdersPattern, {})
      );

      expect(Array.isArray(existingOrders)).toBe(true);

      // Get all request procedures, pick one random procedureId
      const findAllProceduresPattern = `${IMAGING_SERVICE}.RequestProcedure.${MESSAGE_PATTERNS.FIND_ALL}`;
      const procedures = await firstValueFrom(
        client.send<any[]>(findAllProceduresPattern, {})
      );

      const findAllPattern = `${IMAGING_SERVICE}.ImagingOrderForm.${MESSAGE_PATTERNS.FIND_ALL}`;
      const existingOrderFormsData = await firstValueFrom(
        client.send<any>(findAllPattern, {
          filter: { page: 1, limit: 100 },
          userId: undefined,
        })
      );

      let orderForms = existingOrderFormsData?.data || existingOrderFormsData;

      expect(orderForms).toBeDefined();

      orderForms = orderForms;

      if (orderForms.length === 0) {
        throw new Error(
          'No imaging order forms available to attach imaging order'
        );
      }
      if (!procedures || procedures.length === 0) {
        throw new Error(
          'No request procedures available to attach imaging order'
        );
      }

      const randomProcedure =
        procedures[Math.floor(Math.random() * procedures.length)];

      const randomOrderForm =
        orderForms[Math.floor(Math.random() * orderForms.length)];

      const createPattern = `${IMAGING_SERVICE}.ImagingOrders.${MESSAGE_PATTERNS.CREATE}`;

      const dto: CreateImagingOrderDto = {
        request_procedure_id: randomProcedure.id,
        orderStatus: OrderStatus.PENDING,
        imagingOrderFormId: randomOrderForm.id,
        clinicalIndication: `E2E Clinical Indication ${Date.now()}`,
        contrastRequired: false,
        specialInstructions: `E2E Special Instructions ${Date.now()}`,
      };

      const created = await firstValueFrom(
        client.send<ImagingOrder>(createPattern, dto)
      );

      expect(created).toBeDefined();
      expect(created.id).toBeDefined();
      expect(created.procedureId).toBe(dto.request_procedure_id);
      expect(created.orderStatus).toBe(dto.orderStatus);

      createdOrderId = created.id;
    });

    it('should find all imaging orders via message pattern', async () => {
      // Get all first (priority)
      const pattern = `${IMAGING_SERVICE}.ImagingOrders.${MESSAGE_PATTERNS.FIND_ALL}`;
      const result = await firstValueFrom(
        client.send<ImagingOrder[]>(pattern, {})
      );

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThanOrEqual(0);
    });

    it('should find one imaging order by ID via message pattern', async () => {
      // Get all first (priority)
      const findAllPattern = `${IMAGING_SERVICE}.ImagingOrders.${MESSAGE_PATTERNS.FIND_ALL}`;
      const allOrders = await firstValueFrom(
        client.send<ImagingOrder[]>(findAllPattern, {})
      );

      const targetId = createdOrderId ?? allOrders[0]?.id;
      if (!targetId) {
        throw new Error('No imaging orders found to test findOne');
      }

      const findOnePattern = `${IMAGING_SERVICE}.ImagingOrders.${MESSAGE_PATTERNS.FIND_ONE}`;
      const result = await firstValueFrom(
        client.send<ImagingOrder | null>(findOnePattern, { id: targetId })
      );

      expect(result).toBeDefined();
      expect(result?.id).toBe(targetId);
    });

    it('should update an imaging order via message pattern', async () => {
      // Get all first (priority)
      const findAllPattern = `${IMAGING_SERVICE}.ImagingOrders.${MESSAGE_PATTERNS.FIND_ALL}`;
      const allOrders = await firstValueFrom(
        client.send<ImagingOrder[]>(findAllPattern, {})
      );

      const targetId =
        createdOrderId ??
        allOrders.find((o) =>
          o.clinicalIndication?.startsWith('E2E Clinical Indication')
        )?.id;

      if (!targetId) {
        throw new Error('No imaging orders found to test update');
      }

      const updatePattern = `${IMAGING_SERVICE}.ImagingOrders.${MESSAGE_PATTERNS.UPDATE}`;
      const newInstruction = `Updated E2E ${Date.now()}`;
      const updatePayload = {
        id: targetId,
        updateImagingOrderDto: {
          specialInstructions: newInstruction,
          orderStatus: OrderStatus.IN_PROGRESS,
        },
      };

      const updated = await firstValueFrom(
        client.send<ImagingOrder | null>(updatePattern, updatePayload)
      );

      expect(updated).toBeDefined();
      expect(updated?.id).toBe(targetId);
      expect(updated?.specialInstructions).toBe(newInstruction);
      expect(updated?.orderStatus).toBe(OrderStatus.IN_PROGRESS);
    });

    it('should remove the created imaging order via message pattern', async () => {
      // Get all first (priority)
      const findAllPattern = `${IMAGING_SERVICE}.ImagingOrders.${MESSAGE_PATTERNS.FIND_ALL}`;
      const allOrders = await firstValueFrom(
        client.send<ImagingOrder[]>(findAllPattern, {})
      );

      const targetId =
        createdOrderId ??
        allOrders.find((o) =>
          o.clinicalIndication?.startsWith('E2E Clinical Indication')
        )?.id;

      if (!targetId) {
        // If none found, skip deletion gracefully
        return;
      }

      const deletePattern = `${IMAGING_SERVICE}.ImagingOrders.${MESSAGE_PATTERNS.DELETE}`;
      const result = await firstValueFrom(
        client.send<boolean>(deletePattern, { id: targetId })
      );

      expect(result).toBe(true);
      createdOrderId = null;
    });
  });
}
