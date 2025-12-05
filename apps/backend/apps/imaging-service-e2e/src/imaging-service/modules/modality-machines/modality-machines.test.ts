import { ClientProxy, ClientsModule, Transport } from '@nestjs/microservices';
import { Test, TestingModule } from '@nestjs/testing';
import { firstValueFrom } from 'rxjs';
import {
  IMAGING_SERVICE,
  MESSAGE_PATTERNS,
} from '../../../support/constant/microservice.constant';
import {
  CreateModalityMachineDto,
  UpdateModalityMachineDto,
} from '@backend/shared-domain';
import { MachineStatus } from '@backend/shared-enums';

const moduleName = 'ModalityMachines';

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function runModalityMachinesE2ETests() {
  describe('ModalityMachines (e2e)', () => {
    let app: TestingModule;
    let client: ClientProxy;
    let createdMachineId: string | null = null;

    beforeAll(async () => {
      app = await Test.createTestingModule({
        imports: [
          ClientsModule.register([
            {
              name: IMAGING_SERVICE,
              transport: Transport.TCP,
              options: {
                host: 'localhost',
                port: 5003,
              },
            },
          ]),
        ],
      }).compile();

      client = app.get<ClientProxy>(IMAGING_SERVICE);
      await client.connect();
    });

    afterAll(async () => {
      // Cleanup: Delete the created machine if it exists
      if (createdMachineId) {
        try {
          await firstValueFrom(
            client.send(
              `${IMAGING_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.DELETE}`,
              { id: createdMachineId }
            )
          );
        } catch (error) {
          console.warn(`Failed to cleanup machine ${createdMachineId}:`, error);
        }
      }

      await client.close();
      await app.close();
    });

    it('should create a new modality machine', async () => {
      // Get all imaging modalities to select one for the foreign key
      const modalities = await firstValueFrom(
        client.send(
          `${IMAGING_SERVICE}.ImagingModalities.${MESSAGE_PATTERNS.FIND_ALL}`,
          {}
        )
      );

      expect(modalities).toBeDefined();
      expect(Array.isArray(modalities)).toBe(true);
      expect(modalities.length).toBeGreaterThan(0);

      // Select a random modality
      const randomModality =
        modalities[Math.floor(Math.random() * modalities.length)];

      // Generate a test UUID for roomId (since room is in another database)
      const testRoomId = uuidv4();

      const createDto: CreateModalityMachineDto = {
        name: `E2E Test Machine ${Date.now()}`,
        modalityId: randomModality.id,
        manufacturer: 'E2E Test Manufacturer',
        model: 'E2E Test Model',
        serialNumber: `E2E-SN-${Date.now()}`,
        roomId: testRoomId,
        status: MachineStatus.ACTIVE,
      };

      const result = await firstValueFrom(
        client.send(
          `${IMAGING_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.CREATE}`,
          { createModalityMachineDto: createDto }
        )
      );

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.name).toBe(createDto.name);
      expect(result.modalityId).toBe(createDto.modalityId);
      expect(result.manufacturer).toBe(createDto.manufacturer);
      expect(result.model).toBe(createDto.model);
      expect(result.serialNumber).toBe(createDto.serialNumber);
      expect(result.roomId).toBe(createDto.roomId);
      expect(result.status).toBe(createDto.status);

      createdMachineId = result.id;
    });

    it('should find all modality machines', async () => {
      const result = await firstValueFrom(
        client.send(
          `${IMAGING_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.FIND_ALL}`,
          {}
        )
      );

      expect(result).toBeDefined();
      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data.length).toBeGreaterThan(0);
    });

    it('should find one modality machine', async () => {
      expect(createdMachineId).not.toBeNull();

      const result = await firstValueFrom(
        client.send(
          `${IMAGING_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.FIND_ONE}`,
          { id: createdMachineId }
        )
      );

      expect(result).toBeDefined();
      expect(result.id).toBe(createdMachineId);
      expect(result.name).toContain('E2E Test Machine');
    });

    it('should update a modality machine', async () => {
      expect(createdMachineId).not.toBeNull();

      // Get all machines to find the one we created
      const allMachines = await firstValueFrom(
        client.send(
          `${IMAGING_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.FIND_ALL}`,
          {}
        )
      );

      const targetMachine = allMachines.data.find((m) =>
        m.name?.startsWith('E2E Test Machine')
      );

      expect(targetMachine).toBeDefined();

      const updateDto: UpdateModalityMachineDto = {
        name: `Updated E2E Machine ${Date.now()}`,
        manufacturer: 'Updated Manufacturer',
        status: MachineStatus.MAINTENANCE,
      };

      const result = await firstValueFrom(
        client.send(
          `${IMAGING_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.UPDATE}`,
          { id: targetMachine.id, updateModalityMachineDto: updateDto }
        )
      );

      expect(result).toBeDefined();
      expect(result.id).toBe(targetMachine.id);
      expect(result.name).toBe(updateDto.name);
      expect(result.manufacturer).toBe(updateDto.manufacturer);
      expect(result.status).toBe(updateDto.status);
    });

    it('should delete a modality machine', async () => {
      // Get all machines to find the one we created
      const allMachines = await firstValueFrom(
        client.send(
          `${IMAGING_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.FIND_ALL}`,
          {}
        )
      );

      const targetMachine = allMachines.data.find(
        (m) =>
          m.name?.startsWith('Updated E2E Machine') ||
          m.name?.startsWith('E2E Test Machine')
      );

      if (targetMachine) {
        const result = await firstValueFrom(
          client.send(
            `${IMAGING_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.DELETE}`,
            { id: targetMachine.id }
          )
        );

        expect(result).toBeDefined();
        expect(result.success).toBe(true);

        // Clear the createdMachineId since we've already deleted it
        createdMachineId = null;
      }
    });
  });
}
