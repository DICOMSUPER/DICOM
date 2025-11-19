import { PaginatedResponseDto, PaginationService } from '@backend/database';
import { RedisService } from '@backend/redis';
import {
  AiModel,
  CreateAiModelDto,
  FilterAiModelDto,
  UpdateAiModelDto,
} from '@backend/shared-domain';
import { createCacheKey } from '@backend/shared-utils';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';


@Injectable()
export class AiModelService {
  constructor(
    @InjectRepository(AiModel)
    private readonly aiModelRepository: Repository<AiModel>,
    private readonly redisService: RedisService,
    private readonly paginationService: PaginationService,
  ) {}

  async create(createAiModelDto: CreateAiModelDto): Promise<AiModel> {
    console.log('Creating AI model:', createAiModelDto);

    const aiModel = this.aiModelRepository.create({
      ...createAiModelDto,
    });

    const savedModel = await this.aiModelRepository.save(aiModel);
    console.log('AI model created successfully:', savedModel.id);
    return savedModel;
  }
  async findAll(
    filter: FilterAiModelDto
  ): Promise<PaginatedResponseDto<AiModel>> {
    const { page, limit,name, provider, externalModelId } = filter;

    // Generate cache key
    const keyName = createCacheKey.system(
      'ai_models',
      undefined,
      'filter_ai_models',
      { ...filter }
    );

    // Check cache
    const cachedService = await this.redisService.get<
      PaginatedResponseDto<AiModel>
    >(keyName);
    if (cachedService) {
      console.log('AI models retrieved from cache');
      return cachedService;
    }

    // Build query options
    const options: any = {
      where: {},
      order: { startedAt: 'DESC' },
    };

    // Apply filters
    if (name) {
      options.where = {
        ...options.where,
        name,
      };
    }
    if (provider) {
      options.where = {
        ...options.where,
        provider,
      };
    }
    if (externalModelId) {
      options.where = {
        ...options.where,
        externalModelId,
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
        AiModel,
        { page, limit },
        options
      );

      await this.redisService.set(keyName, result, 3600);
      console.log(`📊 Found ${result.data.length} AI models`);

      return result;
    } catch (error) {
      console.error('❌ Database error:', error);
      throw new BadRequestException('Error querying AI models: ' + error);
    }
  }

  async findOne(id: string): Promise<AiModel> {
    console.log(`🔍 Finding AI model: ${id}`);
    const aiModel = await this.aiModelRepository.findOne({
      where: { id },
    });

    if (!aiModel) {
      throw new NotFoundException(`AI model with ID ${id} not found`);
    }
    return aiModel;
  }

  async update(
    id: string,
    updateAiModelDto: UpdateAiModelDto
  ): Promise<AiModel> {
    console.log(`🔄 Updating AI model: ${id}`);
    const aiModel = await this.findOne(id);
    Object.assign(aiModel, updateAiModelDto);
    const updatedModel = await this.aiModelRepository.save(aiModel);
    console.log('✅ AI model updated successfully:', updatedModel.id);
    return updatedModel;
  }

  async remove(id: string): Promise<void> {
    console.log(`🗑️ Removing AI model: ${id}`);
    const aiModel = await this.findOne(id);
    await this.aiModelRepository.remove(aiModel);
    console.log('✅ AI model removed successfully:', id);
  }
}
