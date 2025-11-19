import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  AiModel,
  CreateAiAnalysisDto,
  FilterAiAnalysisDto,
  UpdateAiAnalysisDto,
} from '@backend/shared-domain';
import { AiAnalysis } from '@backend/shared-domain';
import { RedisService } from '@backend/redis';
import { createCacheKey } from '@backend/shared-utils';
import { PaginatedResponseDto, PaginationService } from '@backend/database';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { AiResultDiagnosis } from '@backend/shared-interfaces';
import axios from 'axios';
import { AnalysisStatus } from '@backend/shared-enums';

@Injectable()
export class AiAnalysesService {
  constructor(
    @InjectRepository(AiAnalysis)
    private readonly aiAnalysisRepository: Repository<AiAnalysis>,
    @InjectRepository(AiModel)
    private readonly aiModelRepository: Repository<AiModel>,
    private readonly redisService: RedisService,
    private readonly paginationService: PaginationService,
    // private readonly cloudinaryService: CloudinaryService
  ) {}
  async create(createAiAnalysisDto: CreateAiAnalysisDto): Promise<AiAnalysis> {
    console.log('Creating AI analysis:', createAiAnalysisDto);

    const aiAnalysis = this.aiAnalysisRepository.create({
      ...createAiAnalysisDto,
    });

    const savedAnalysis = await this.aiAnalysisRepository.save(aiAnalysis);
    console.log('AI analysis created successfully:', savedAnalysis.id);

    return savedAnalysis;
  }
  //: Promise<AiResultDiagnosis>
  // async diagnosisImageByAI(base64Image: string, folder: string) {
  //   console.log('Diagnosing image using AI');
  //   const result = await this.cloudinaryService.uploadBase64ToCloudinary(
  //     base64Image,
  //     {
  //       folder: folder,
  //       resource_type: 'auto', // Auto detect image/video
  //     }
  //   );

  //   return result.secure_url;
  // }
  async diagnosisImageByAI(
    base64Image: string,
    aiModelId: string
  ): Promise<AiResultDiagnosis> {
    try {
      // const aiModel = await this.aiModelRepository.findOne({
      //   where: { id: aiModelId },
      // });
      // if (!aiModel) {
      //   throw new NotFoundException(`AI Model with ID ${aiModelId} not found`);
      // }
      const result = await axios<AiResultDiagnosis>({
        method: 'POST',
        url: `https://serverless.roboflow.com/effusion-chest-xray-segmentation/1`,
        params: {
          api_key: "31I5NP2qoFDBvXy8ybXD",
        },
        data: base64Image,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      // this.aiAnalysisRepository.create({
      //   analysisResults: result.data,
      //   analysisStatus: AnalysisStatus.COMPLETED,
      //   // aiModelId: aiModelId,
      // });

      
      return result.data;
    } catch (error: any) {
      console.log('Error diagnosing image:', error);
      // this.aiAnalysisRepository.create({
      //   errorMessage: error.message,
      //   analysisStatus: AnalysisStatus.FAILED,
      //   // aiModelId: aiModelId,
      // });
      throw new BadRequestException(
        'Failed to diagnose image: ' + error.message
      );
    }
  }
  async findAll(
    filter: FilterAiAnalysisDto
  ): Promise<PaginatedResponseDto<AiAnalysis>> {
    const { page, limit, patientId, studyId, status } = filter;

    // Generate cache key
    const keyName = createCacheKey.system(
      'ai_analyses',
      undefined,
      'filter_ai_analyses',
      { ...filter }
    );

    // Check cache
    const cachedService = await this.redisService.get<
      PaginatedResponseDto<AiAnalysis>
    >(keyName);
    if (cachedService) {
      console.log('AI analyses retrieved from cache');
      return cachedService;
    }

    // Build query options
    const options: any = {
      where: {},
      order: { startedAt: 'DESC' },
    };

    // Apply filters
    if (patientId) {
      options.where = {
        ...options.where,
        patientId,
      };
    }
    if (studyId) {
      options.where = {
        ...options.where,
        studyId,
      };
    }
    if (status) {
      options.where = {
        ...options.where,
        status,
      };
    }
    // if (modelName) {
    //   options.where = {
    //     ...options.where,
    //     modelName,
    //   };
    // }

    try {
      const result = await this.paginationService.paginate(
        AiAnalysis,
        { page, limit },
        options
      );

      await this.redisService.set(keyName, result, 3600);
      console.log(`📊 Found ${result.data.length} AI analyses`);

      return result;
    } catch (error) {
      console.error('❌ Database error:', error);
      throw new BadRequestException('Error querying AI analyses: ' + error);
    }
  }

  async findOne(id: string): Promise<AiAnalysis> {
    console.log(`🔍 Finding AI analysis: ${id}`);
    const aiAnalysis = await this.aiAnalysisRepository.findOne({
      where: { id },
    });

    if (!aiAnalysis) {
      throw new NotFoundException(`AI analysis with ID ${id} not found`);
    }
    return aiAnalysis;
  }

  async update(
    id: string,
    updateAiAnalysisDto: UpdateAiAnalysisDto
  ): Promise<AiAnalysis> {
    console.log(`🔄 Updating AI analysis: ${id}`);
    const aiAnalysis = await this.findOne(id);
    Object.assign(aiAnalysis, updateAiAnalysisDto);
    const updatedAnalysis = await this.aiAnalysisRepository.save(aiAnalysis);
    console.log('✅ AI analysis updated successfully:', updatedAnalysis.id);
    return updatedAnalysis;
  }

  async remove(id: string): Promise<void> {
    console.log(`🗑️ Removing AI analysis: ${id}`);
    const aiAnalysis = await this.findOne(id);
    await this.aiAnalysisRepository.remove(aiAnalysis);
    console.log('✅ AI analysis removed successfully:', id);
  }
}
