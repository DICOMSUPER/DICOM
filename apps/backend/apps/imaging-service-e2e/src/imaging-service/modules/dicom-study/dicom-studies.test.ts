import {
  Transport,
  ClientProxyFactory,
  ClientProxy,
} from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

import {
  CreateDicomStudyDto,
  DicomStudy,
  ImagingOrder,
} from '@backend/shared-domain';
import { DicomStudyStatus, OrderStatus } from '@backend/shared-enums';
import {
  IMAGING_SERVICE,
  MESSAGE_PATTERNS,
} from '../../../support/constant/microservice.constant';

function randomTime() {
  const hh = String(Math.floor(Math.random() * 24)).padStart(2, '0');
  const mm = String(Math.floor(Math.random() * 60)).padStart(2, '0');
  const ss = String(Math.floor(Math.random() * 60)).padStart(2, '0');
  return `${hh}:${mm}:${ss}`;
}

function uuidv4() {
  // Simple UUID v4 generator (non-crypto) sufficient for tests
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function runDicomStudiesE2ETests(port = 5003, host = 'localhost') {
  describe('DicomStudiesController (e2e)', () => {
    let client: ClientProxy;
    let createdStudyId: string | null = null;
    let seededModalityId: string | null = null;
    let seededMachineId: string | null = null;

    beforeAll(async () => {
      client = ClientProxyFactory.create({
        transport: Transport.TCP,
        options: { host, port },
      });
    });

    afterAll(async () => {
      // Cleanup if something remained
      if (createdStudyId) {
        const deletePattern = `${IMAGING_SERVICE}.DicomStudies.${MESSAGE_PATTERNS.DELETE}`;
        try {
          await firstValueFrom(
            client.send<boolean>(deletePattern, { id: createdStudyId })
          );
        } catch {}
      }
      // Cleanup seeded machine
      if (seededMachineId) {
        const deleteMachinePattern = `${IMAGING_SERVICE}.ModalityMachines.${MESSAGE_PATTERNS.DELETE}`;
        try {
          await firstValueFrom(
            client.send<boolean>(deleteMachinePattern, { id: seededMachineId })
          );
        } catch {}
      }
      // Cleanup seeded modality
      if (seededModalityId) {
        const deleteModalityPattern = `${IMAGING_SERVICE}.ImagingModalities.${MESSAGE_PATTERNS.DELETE}`;
        try {
          await firstValueFrom(
            client.send<boolean>(deleteModalityPattern, {
              id: seededModalityId,
            })
          );
        } catch {}
      }
      await client.close();
    });

    it('should create a dicom study via message pattern', async () => {
      // Get all studies first (priority step)
      const findAllStudiesPattern = `${IMAGING_SERVICE}.DicomStudies.${MESSAGE_PATTERNS.FIND_ALL}`;
      const existingStudies = await firstValueFrom(
        client.send<DicomStudy[]>(findAllStudiesPattern, {})
      );

      expect(Array.isArray(existingStudies)).toBe(true);

      // Get all imaging orders, pick one random orderId
      const findAllOrdersPattern = `${IMAGING_SERVICE}.ImagingOrders.${MESSAGE_PATTERNS.FIND_ALL}`;
      let orders = await firstValueFrom(
        client.send<ImagingOrder[]>(findAllOrdersPattern, {})
      );

      orders = orders.filter((o) => o.orderStatus === OrderStatus.IN_PROGRESS);
      if (!orders || orders.length === 0) {
        throw new Error('No imaging orders available to attach dicom study');
      }

      const randomOrder = orders[Math.floor(Math.random() * orders.length)];

      // Get all imaging modalities, pick one
      const findAllModalitiesPattern = `${IMAGING_SERVICE}.ImagingModalities.${MESSAGE_PATTERNS.FIND_ALL}`;
      let modalities = await firstValueFrom(
        client.send<any[]>(findAllModalitiesPattern, {})
      );
      let chosenModality =
        modalities[Math.floor(Math.random() * (modalities.length || 1))];

      // Seed a modality if none exist
      if (!modalities || modalities.length === 0) {
        const createModalityPattern = `${IMAGING_SERVICE}.ImagingModalities.${MESSAGE_PATTERNS.CREATE}`;
        const modalityDto = {
          modalityCode: `E2E_${Date.now()}`,
          modalityName: `E2E Modality ${Date.now()}`,
          description: 'E2E seeded modality',
          isActive: true,
        };
        const createdModality = await firstValueFrom(
          client.send<any>(createModalityPattern, modalityDto)
        );
        seededModalityId = createdModality.id;
        chosenModality = createdModality;
        modalities = [createdModality];
      }

      // Get modality machines by modalityId; fallback to any if none
      const findAllMachinesPattern = `${IMAGING_SERVICE}.ModalityMachines.${MESSAGE_PATTERNS.FIND_ALL}`;
      let machinesResponse = await firstValueFrom(
        client.send<any>(findAllMachinesPattern, {
          modalityId: chosenModality.id,
        })
      );

      let machines = machinesResponse?.data || machinesResponse;
      if (!Array.isArray(machines)) {
        machines = [];
      }

      if (!machines || machines.length === 0) {
        machinesResponse = await firstValueFrom(
          client.send<any>(findAllMachinesPattern, {})
        );
        machines = machinesResponse?.data || machinesResponse;
        if (!Array.isArray(machines)) {
          machines = [];
        }
      }
      // Seed a machine if none exist
      if (!machines || machines.length === 0) {
        const createMachinePattern = `${IMAGING_SERVICE}.ModalityMachines.${MESSAGE_PATTERNS.CREATE}`;
        const machineDto = {
          createModalityMachineDto: {
            name: `E2E Machine ${Date.now()}`,
            modalityId: chosenModality.id,
            manufacturer: 'E2E Inc.',
            model: 'Model-X',
            serialNumber: `SN-${Date.now()}`,
            status: 'active',
          },
        };
        const createdMachine = await firstValueFrom(
          client.send<any>(createMachinePattern, machineDto)
        );
        seededMachineId = createdMachine.id;
        machines = [createdMachine];
      }
      // Prefer machine that matches chosen modality if present
      const matchingMachine = machines.find(
        (m) => m.modalityId === chosenModality.id
      );
      const chosenMachine = matchingMachine ?? machines[0];

      const createPattern = `${IMAGING_SERVICE}.DicomStudies.${MESSAGE_PATTERNS.CREATE}`;

      const dto: CreateDicomStudyDto = {
        studyInstanceUid: uuidv4(),
        patientId: uuidv4(),
        orderId: randomOrder.id,
        modalityId: matchingMachine
          ? chosenModality.id
          : chosenMachine.modalityId ?? chosenModality.id,
        studyDate: new Date(),
        modalityMachineId: chosenMachine.id,
        studyTime: randomTime(),
        studyDescription: `E2E Study ${Date.now()}`,
        referringPhysician: 'Dr. E2E Tester',
        performingTechnicianId: uuidv4(),
        verifyingRadiologistId: undefined,
        studyStatus: DicomStudyStatus.SCANNED,
        storagePath: 'e2e/storage/path',
      };

      const payload = { createDicomStudyDto: dto };

      const created = await firstValueFrom(
        client.send<DicomStudy>(createPattern, payload)
      );

      expect(created).toBeDefined();
      expect(created.id).toBeDefined();
      expect(created.orderId).toBe(dto.orderId);
      expect(created.studyInstanceUid).toBe(dto.studyInstanceUid);

      createdStudyId = created.id;
    });

    it('should find all dicom studies via message pattern', async () => {
      // Get all first (priority)
      const pattern = `${IMAGING_SERVICE}.DicomStudies.${MESSAGE_PATTERNS.FIND_ALL}`;
      const result = await firstValueFrom(
        client.send<DicomStudy[]>(pattern, {})
      );

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThanOrEqual(0);
    });

    it('should find one dicom study by ID via message pattern', async () => {
      // Get all first (priority)
      const findAllPattern = `${IMAGING_SERVICE}.DicomStudies.${MESSAGE_PATTERNS.FIND_ALL}`;
      const allStudies = await firstValueFrom(
        client.send<DicomStudy[]>(findAllPattern, {})
      );

      const targetId = createdStudyId ?? allStudies[0]?.id;
      if (!targetId) {
        throw new Error('No dicom studies found to test findOne');
      }

      const findOnePattern = `${IMAGING_SERVICE}.DicomStudies.${MESSAGE_PATTERNS.FIND_ONE}`;
      const result = await firstValueFrom(
        client.send<DicomStudy | null>(findOnePattern, { id: targetId })
      );

      expect(result).toBeDefined();
      expect(result?.id).toBe(targetId);
    });

    it('should update a dicom study via message pattern', async () => {
      // Get all first (priority)
      const findAllPattern = `${IMAGING_SERVICE}.DicomStudies.${MESSAGE_PATTERNS.FIND_ALL}`;
      const allStudies = await firstValueFrom(
        client.send<DicomStudy[]>(findAllPattern, {})
      );

      const targetId = createdStudyId ?? allStudies[0]?.id;
      if (!targetId) {
        throw new Error('No dicom studies found to test update');
      }

      const updatePattern = `${IMAGING_SERVICE}.DicomStudies.${MESSAGE_PATTERNS.UPDATE}`;
      const newDescription = `Updated E2E ${Date.now()}`;
      const updatePayload = {
        id: targetId,
        updateDicomStudyDto: { studyDescription: newDescription },
      };

      const updated = await firstValueFrom(
        client.send<DicomStudy | null>(updatePattern, updatePayload)
      );

      expect(updated).toBeDefined();
      expect(updated?.id).toBe(targetId);
      expect(updated?.studyDescription).toBe(newDescription);
    });

    it('should remove the created dicom study via message pattern', async () => {
      // Get all first (priority)
      const findAllPattern = `${IMAGING_SERVICE}.DicomStudies.${MESSAGE_PATTERNS.FIND_ALL}`;
      const allStudies = await firstValueFrom(
        client.send<DicomStudy[]>(findAllPattern, {})
      );

      const targetId =
        createdStudyId ??
        allStudies.find((s) => s.studyDescription?.startsWith('E2E Study'))?.id;
      if (!targetId) {
        // If none found, skip deletion gracefully
        return;
      }

      const deletePattern = `${IMAGING_SERVICE}.DicomStudies.${MESSAGE_PATTERNS.DELETE}`;
      const result = await firstValueFrom(
        client.send<boolean>(deletePattern, { id: targetId })
      );

      expect(result).toBe(true);
      createdStudyId = null;
    });
  });
}
