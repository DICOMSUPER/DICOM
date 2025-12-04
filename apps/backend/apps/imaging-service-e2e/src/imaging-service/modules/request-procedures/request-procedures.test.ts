import { ClientProxy, ClientsModule, Transport } from '@nestjs/microservices';
import { Test, TestingModule } from '@nestjs/testing';
import { firstValueFrom } from 'rxjs';
import {
  IMAGING_SERVICE,
  MESSAGE_PATTERNS,
} from '../../../support/constant/microservice.constant';
import {
  CreateRequestProcedureDto,
  UpdateRequestProcedureDto,
} from '@backend/shared-domain';

const moduleName = 'RequestProcedure';

export function runRequestProceduresE2ETests() {
  describe('RequestProcedures (e2e)', () => {
    let app: TestingModule;
    let client: ClientProxy;
    let createdProcedureId: string | null = null;

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
      // Cleanup: Delete the created procedure if it exists
      if (createdProcedureId) {
        try {
          await firstValueFrom(
            client.send(
              `${IMAGING_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.DELETE}`,
              { id: createdProcedureId }
            )
          );
        } catch (error) {
          console.warn(
            `Failed to cleanup procedure ${createdProcedureId}:`,
            error
          );
        }
      }

      await client.close();
      await app.close();
    });

    it('should create a new request procedure', async () => {
      // Get all body parts to select one for the foreign key
      const bodyParts = await firstValueFrom(
        client.send(
          `${IMAGING_SERVICE}.BodyPart.${MESSAGE_PATTERNS.FIND_ALL}`,
          {}
        )
      );

      expect(bodyParts).toBeDefined();
      expect(Array.isArray(bodyParts)).toBe(true);
      expect(bodyParts.length).toBeGreaterThan(0);

      // Select a random body part
      const randomBodyPart =
        bodyParts[Math.floor(Math.random() * bodyParts.length)];

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

      const createDto: CreateRequestProcedureDto = {
        name: `E2E Test Procedure ${Date.now()}`,
        modalityId: randomModality.id,
        bodyPartId: randomBodyPart.id,
        description: `E2E Test Description ${Date.now()}`,
        isActive: true,
      };

      const result = await firstValueFrom(
        client.send(
          `${IMAGING_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.CREATE}`,
          createDto
        )
      );

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.name).toBe(createDto.name);
      expect(result.modalityId).toBe(createDto.modalityId);
      expect(result.bodyPartId).toBe(createDto.bodyPartId);
      expect(result.description).toBe(createDto.description);
      expect(result.isActive).toBe(createDto.isActive);

      createdProcedureId = result.id;
    });

    it('should find all request procedures', async () => {
      const result = await firstValueFrom(
        client.send(
          `${IMAGING_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.FIND_ALL}`,
          {}
        )
      );

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should find one request procedure', async () => {
      expect(createdProcedureId).not.toBeNull();

      const result = await firstValueFrom(
        client.send(
          `${IMAGING_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.FIND_ONE}`,
          { id: createdProcedureId }
        )
      );

      expect(result).toBeDefined();
      expect(result.id).toBe(createdProcedureId);
      expect(result.name).toContain('E2E Test Procedure');
    });

    it('should update a request procedure', async () => {
      expect(createdProcedureId).not.toBeNull();

      // Get all procedures to find the one we created
      const allProcedures = await firstValueFrom(
        client.send(
          `${IMAGING_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.FIND_ALL}`,
          {}
        )
      );

      const targetProcedure = allProcedures.find((p) =>
        p.name?.startsWith('E2E Test Procedure')
      );

      expect(targetProcedure).toBeDefined();

      const updateDto: UpdateRequestProcedureDto = {
        name: `Updated E2E Procedure ${Date.now()}`,
        description: 'Updated E2E Description',
        isActive: false,
      };

      const result = await firstValueFrom(
        client.send(
          `${IMAGING_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.UPDATE}`,
          { id: targetProcedure.id, updateRequestProcedureDto: updateDto }
        )
      );

      expect(result).toBeDefined();
      expect(result.id).toBe(targetProcedure.id);
      expect(result.name).toBe(updateDto.name);
      expect(result.description).toBe(updateDto.description);
      expect(result.isActive).toBe(updateDto.isActive);
    });

    it('should delete a request procedure', async () => {
      // Get all procedures to find the one we created
      const allProcedures = await firstValueFrom(
        client.send(
          `${IMAGING_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.FIND_ALL}`,
          {}
        )
      );

      const targetProcedure = allProcedures.find(
        (p) =>
          p.name?.startsWith('Updated E2E Procedure') ||
          p.name?.startsWith('E2E Test Procedure')
      );

      if (targetProcedure) {
        const result = await firstValueFrom(
          client.send(
            `${IMAGING_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.DELETE}`,
            { id: targetProcedure.id }
          )
        );

        expect(result).toBeDefined();
        expect(result.success).toBe(true);

        // Clear the createdProcedureId since we've already deleted it
        createdProcedureId = null;
      }
    });
  });
}
