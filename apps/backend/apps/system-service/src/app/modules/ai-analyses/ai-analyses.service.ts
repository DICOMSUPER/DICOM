import { PaginatedResponseDto, PaginationService } from '@backend/database';
import { RedisService } from '@backend/redis';
import {
  AiAnalysis,
  CreateAiAnalysisDto,
  FilterAiAnalysisDto,
  UpdateAiAnalysisDto,
} from '@backend/shared-domain';
import { AnalysisStatus } from '@backend/shared-enums';
import { AiResultDiagnosis } from '@backend/shared-interfaces';
import { createCacheKey } from '@backend/shared-utils';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import { Repository } from 'typeorm';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class AiAnalysesService {
  constructor(
    @InjectRepository(AiAnalysis)
    private readonly aiAnalysisRepository: Repository<AiAnalysis>,
    private readonly redisService: RedisService,
    private readonly paginationService: PaginationService,
    private readonly cloudinaryService: CloudinaryService
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
    aiModelId: string,
    modelName: string,
    versionName: string,
    userId: string,
    // folder: string,
    selectedStudyId?: string
  ): Promise<AiResultDiagnosis> {
    try {
      if (!base64Image) {
        throw new BadRequestException('Base64 image data is required');
      }
      const result = await axios<AiResultDiagnosis>({
        method: 'POST',
        url: `https://serverless.roboflow.com/${aiModelId}`,
        params: {
          api_key: 'V4g8kiNFVYuqGTcVDwhl',
        },
        data: base64Image,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      console.log("AI result", result);
      
      // const image = await this.cloudinaryService.uploadBase64ToCloudinary(
      //   base64Image,
      //   {
      //     folder: folder,
      //     resource_type: 'auto',
      //   }
      // );
      await this.aiAnalysisRepository.save({
        analysisResults: result.data,
        analysisStatus: AnalysisStatus.COMPLETED,
        aiModelId: aiModelId,
        modelName: modelName,
        versionName: versionName,
        userId: userId,
        studyId: selectedStudyId || '',
        // originalImageUrl: image.secure_url,
        // originalImageName: image.public_id,
      });

      return result.data;
    } catch (error: any) {
      console.log('Error diagnosing image:', error);
      await this.aiAnalysisRepository.save({
        errorMessage: error.message,
        analysisStatus: AnalysisStatus.FAILED,
        aiModelId: aiModelId,
        modelName: modelName,
        versionName: versionName,
        userId: userId,
        studyId: selectedStudyId,
      });
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
      order: { createdAt: 'DESC' },
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
    console.log(` Updating AI analysis: ${id}`);
    const aiAnalysis = await this.findOne(id);
    Object.assign(aiAnalysis, updateAiAnalysisDto);
    const updatedAnalysis = await this.aiAnalysisRepository.save(aiAnalysis);
    console.log('AI analysis updated successfully:', updatedAnalysis.id);
    return updatedAnalysis;
  }

  async submitFeedback(
    id: string,
    userId: string,
    isHelpful: boolean,
    feedbackComment?: string
  ): Promise<AiAnalysis> {
    console.log(`📝 Submitting feedback for AI analysis: ${id}`);
    const aiAnalysis = await this.findOne(id);

    aiAnalysis.isHelpful = isHelpful;
    aiAnalysis.feedbackComment = feedbackComment;
    aiAnalysis.feedbackUserId = userId;
    aiAnalysis.feedbackAt = new Date();

    const updatedAnalysis = await this.aiAnalysisRepository.save(aiAnalysis);
    console.log('Feedback submitted successfully:', updatedAnalysis.id);

    const keyName = createCacheKey.system(
      'ai_analyses',
      undefined,
      'filter_ai_analyses'
    );
    await this.redisService.delete(keyName);

    return updatedAnalysis;
  }
}
