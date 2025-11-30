import {
  Transport,
  ClientProxyFactory,
  ClientProxy,
} from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

import { DicomStudy } from '@backend/shared-domain';
import {
  IMAGING_SERVICE,
  MESSAGE_PATTERNS,
} from '../../../support/constant/microservice.constant';

export function runDicomStudySignatureE2ETests(
  port = 5003,
  host = 'localhost'
) {
  describe('DicomStudySignatureController (e2e)', () => {
    let client: ClientProxy;

    beforeAll(async () => {
      client = ClientProxyFactory.create({
        transport: Transport.TCP,
        options: { host, port },
      });
    });

    afterAll(async () => {
      await client.close();
    });

    it('should get all signatures for a dicom study via message pattern', async () => {
      // Get all studies first (priority step to obtain a studyId)
      const findAllStudiesPattern = `${IMAGING_SERVICE}.DicomStudies.${MESSAGE_PATTERNS.FIND_ALL}`;
      const studies = await firstValueFrom(
        client.send<DicomStudy[]>(findAllStudiesPattern, {})
      );

      if (!studies || studies.length === 0) {
        console.warn(
          'No dicom studies available to fetch signatures for, skipping test.'
        );
        return;
      }

      const targetStudy = studies[Math.floor(Math.random() * studies.length)];

      // Direct signature pattern (not part of generic MESSAGE_PATTERNS constants)
      const getSignaturesPattern = 'ImagingService.DicomStudySignature.GetAll';
      const signatures = await firstValueFrom(
        client.send<any[]>(getSignaturesPattern, { studyId: targetStudy.id })
      );

      expect(signatures).toBeDefined();
      expect(Array.isArray(signatures)).toBe(true);
      expect(signatures.length).toBeGreaterThanOrEqual(0); // Empty array acceptable
    });
  });
}
