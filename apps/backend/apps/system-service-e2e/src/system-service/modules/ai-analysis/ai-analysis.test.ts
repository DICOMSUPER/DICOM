import {
  ClientProxyFactory,
  Transport,
  ClientProxy,
} from '@nestjs/microservices';
import { defaultIfEmpty, firstValueFrom } from 'rxjs';

import { CreateAiAnalysisDto } from '@backend/shared-domain';
import { FilterAiAnalysisDto } from '@backend/shared-domain';
import { AnalysisStatus } from '@backend/shared-enums';

describe('AiAnalysisController (e2e)', () => {
  let client: ClientProxy;
  let createdId: string;
  const TEST_USER_ID = `cbc6b1bf-acd7-49ba-94a2-4c7a8e4a81a8`;
  const TEST_STUDY_ID = `03550531-0f99-4820-b96a-7ebca99b9e50`;

  beforeAll(async () => {
    client = ClientProxyFactory.create({
      transport: Transport.TCP,
      options: { host: 'localhost', port: 5005 }, // chỉnh port nếu cần
    });
  });

  afterAll(async () => {
    await client.close();
  });

  it('should create an AI analysis', async () => {
    const payload: CreateAiAnalysisDto = {
      userId: TEST_USER_ID,
      studyId: TEST_STUDY_ID,
      analysisStatus: AnalysisStatus.PENDING,
      aiModelId: 'test-ai-model-id',
      modelName: 'TestModel',
      versionName: 'v1',
      analysisResults: { result: 'pending' },
      findings: 'Initial findings',
      errorMessage: '',
    };

    const result = await firstValueFrom(
      client.send<any>('ai_analysis.create', payload)
    );
    expect(result).toBeDefined();
    expect(result.id).toBeDefined();
    expect(result.userId).toBe(TEST_USER_ID);
    createdId = result.id;
    console.log('Created AI analysis ID:', createdId);
  });

  it('should get all AI analyses (paginated)', async () => {
    const filter: FilterAiAnalysisDto = { page: 1, limit: 10 };
    const result = await firstValueFrom(
      client.send<any>('ai_analysis.findAll', filter)
    );
    expect(result).toBeDefined();
    expect(Array.isArray(result.data)).toBe(true);
  });

  it('should get AI analysis by id', async () => {
    const result = await firstValueFrom(
      client.send<any>('ai_analysis.findOne', { id: createdId })
    );
    expect(result).toBeDefined();
    expect(result.id).toBe(createdId);
  });

  // it('should update AI analysis', async () => {
  //   const updatePayload = {
  //     id: createdId,
  //     updateAiAnalysisDto: {
  //       findings: 'Updated findings',
  //       analysisStatus: AnalysisStatus.COMPLETED,
  //     },
  //   };
  //   const result = await firstValueFrom(
  //     client.send<any>('ai_analysis.update', updatePayload)
  //   );
  //   console.log('Update ai analysis result:', result);
  //   expect(result).toBeDefined();
  //   expect(result.findings).toBe('Updated findings');
  //   expect(result.analysisStatus || result.status).toBe(
  //     AnalysisStatus.COMPLETED
  //   );
  // });

});
