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
import { Between, Repository } from 'typeorm';
import * as ExcelJS from 'exceljs';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import OpenAI from 'openai';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AiAnalysesService {
  private openai: OpenAI;
  constructor(
    @InjectRepository(AiAnalysis)
    private readonly aiAnalysisRepository: Repository<AiAnalysis>,
    private readonly redisService: RedisService,
    private readonly paginationService: PaginationService,
    private readonly cloudinaryService: CloudinaryService,
    private readonly configService: ConfigService
  ) {
    this.openai = new OpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: this.configService.get('API_KEY'),
      defaultHeaders: {
        'HTTP-Referer': this.configService.get('SITE_URL'),
        'X-Title': this.configService.get('SITE_NAME'),
      },
    });
  }
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
    folder: string,
    selectedStudyId?: string
  ): Promise<AiResultDiagnosis> {
    try {
      console.log('🔍 Starting AI diagnosis...');
      console.log('📦 Parameters:', {
        aiModelId,
        modelName,
        versionName,
        userId,
        folder,
        selectedStudyId,
        imageLength: base64Image?.length || 0,
      });

      if (!base64Image) {
        throw new BadRequestException('Base64 image data is required');
      }

      console.log(
        '🔑 API Key loaded:',
        process.env.ROBOFLOW_API_KEY ? 'Yes' : 'No'
      );
      console.log(
        '🔑 API Key value:',
        process.env.ROBOFLOW_API_KEY?.substring(0, 10) + '...'
      );

      // Step 1: Call Roboflow AI
      console.log('📡 Calling Roboflow API...');
      const result = await axios<AiResultDiagnosis>({
        method: 'POST',
        url: `https://serverless.roboflow.com/${aiModelId}`,
        params: {
          api_key: `${process.env.ROBOFLOW_API_KEY}`,
        },
        data: base64Image,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      console.log(
        '✅ AI result received:',
        JSON.stringify(result.data).substring(0, 200)
      );

      // Step 2: Upload to Cloudinary
      console.log('☁️ Uploading to Cloudinary...');

      // Ensure base64 has proper data URI format
      let formattedBase64 = base64Image;
      if (!base64Image.startsWith('data:')) {
        // Detect image type from base64 header
        const imageType =
          base64Image.startsWith('/9j/') || base64Image.startsWith('iVBOR')
            ? 'image/jpeg'
            : base64Image.startsWith('iVBOR')
            ? 'image/png'
            : 'image/jpeg'; // default
        formattedBase64 = `data:${imageType};base64,${base64Image}`;
        console.log('📝 Formatted base64 with data URI prefix');
      }

      const image = await this.cloudinaryService.uploadBase64ToCloudinary(
        formattedBase64,
        {
          folder: folder,
          resource_type: 'auto',
        }
      );
      console.log('✅ Image uploaded:', image.secure_url);

      // Step 3: Analyze diagnosis with AI (only if predictions exist)
      let aiAnalyzeMessage = '';
      if (result.data.predictions && result.data.predictions.length > 0) {
        console.log('🤖 Analyzing diagnosis with AI...');
        aiAnalyzeMessage = await this.analyzeDiagnosisWithImageAndROI(
          image.secure_url,
          modelName,
          result.data
        );
        console.log('✅ AI analysis completed');
      } else {
        console.log('⚠️ No predictions found, skipping AI analysis');
        aiAnalyzeMessage = 'No abnormalities detected in the image.';
      }

      // Step 4: Save to database
      console.log('💾 Saving to database...');
      const savedAnalysis = await this.aiAnalysisRepository.save({
        analysisResults: result.data,
        analysisStatus: AnalysisStatus.COMPLETED,
        aiModelId: aiModelId,
        modelName: modelName,
        versionName: versionName,
        userId: userId,
        studyId: selectedStudyId || '',
        originalImage: image.secure_url,
        originalImageName: image.public_id,
        aiAnalyzeMessage: aiAnalyzeMessage,
      });
      console.log('✅ Analysis saved with ID:', savedAnalysis.id);

      // Step 5: Return result with analysisId and AI message
      const response = {
        ...result.data,
        analysisId: savedAnalysis.id,
        aiAnalyzeMessage: aiAnalyzeMessage,
      } as AiResultDiagnosis;

      console.log('✅ AI diagnosis completed successfully');
      return response;
    } catch (error: any) {
      console.error('❌ Error in diagnosisImageByAI:', error);
      console.error('❌ Error stack:', error?.stack);
      console.error('❌ Error response:', error?.response?.data);

      try {
        await this.aiAnalysisRepository.save({
          errorMessage: error.message || 'Unknown error',
          analysisStatus: AnalysisStatus.FAILED,
          aiModelId: aiModelId,
          modelName: modelName,
          versionName: versionName,
          userId: userId,
          studyId: selectedStudyId || '',
        });
      } catch (dbError) {
        console.error('❌ Failed to save error to database:', dbError);
      }

      throw new BadRequestException(
        'Failed to diagnose image: ' + (error.message || 'Unknown error')
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
      console.log(`Found ${result.data.length} AI analyses`);

      return result;
    } catch (error) {
      console.error('❌ Database error:', error);
      throw new BadRequestException('Error querying AI analyses: ' + error);
    }
  }

  async findOne(id: string): Promise<AiAnalysis> {
    console.log(`Finding AI analysis: ${id}`);
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

  async exportToExcel(filter: {
    fromDate?: string;
    toDate?: string;
    status?: AnalysisStatus;
    isHelpful?: boolean;
  }): Promise<Buffer> {
    console.log('📊 Exporting AI analyses to Excel with filters:', filter);
    const where: any = {};

    if (filter.fromDate || filter.toDate) {
      const fromDate = filter.fromDate
        ? new Date(filter.fromDate)
        : new Date('1970-01-01');
      // Set fromDate to start of day (00:00:00)
      fromDate.setHours(0, 0, 0, 0);

      const toDate = filter.toDate ? new Date(filter.toDate) : new Date();
      // Set toDate to end of day (23:59:59.999)
      toDate.setHours(23, 59, 59, 999);

      where.createdAt = Between(fromDate, toDate);
    }

    if (filter.status) {
      where.analysisStatus = filter.status;
    }

    if (filter.isHelpful !== undefined) {
      where.isHelpful = filter.isHelpful;
    }
    const analyses = await this.aiAnalysisRepository.find({
      where,
      order: { createdAt: 'DESC' },
    });

    console.log(`Found ${analyses.length} analyses to export`);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('AI Analyses');
    worksheet.columns = [
      { header: 'Analysis ID', key: 'analysisId', width: 35 },
      { header: 'Study ID', key: 'studyId', width: 35 },
      { header: 'Image Name', key: 'originalImageName', width: 30 },
      { header: 'Image URL', key: 'originalImage', width: 50 },
      { header: 'Model Name', key: 'modelName', width: 25 },
      { header: 'Version', key: 'versionName', width: 15 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Analysis Results', key: 'analysisResults', width: 50 }, // Increased width
      { header: 'Is Helpful', key: 'isHelpful', width: 12 },
      { header: 'Feedback Comment', key: 'feedbackComment', width: 40 },
      { header: 'Error Message', key: 'errorMessage', width: 40 },
      { header: 'Created At', key: 'createdAt', width: 20 },
      { header: 'Feedback At', key: 'feedbackAt', width: 20 },
    ];

    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' },
    };
    worksheet.getRow(1).alignment = {
      vertical: 'middle',
      horizontal: 'center',
    };

    analyses.forEach((analysis) => {
      worksheet.addRow({
        analysisId: analysis.id,
        studyId: analysis.studyId || 'N/A',
        originalImageName: analysis.originalImageName || 'N/A',
        originalImage: analysis.originalImage || 'N/A',
        modelName: analysis.modelName || 'N/A',
        versionName: analysis.versionName || 'N/A',
        status: analysis.analysisStatus,
        analysisResults: analysis.analysisResults
          ? JSON.stringify(analysis.analysisResults, null, 2)
          : 'N/A',
        isHelpful:
          analysis.isHelpful === true
            ? 'Yes'
            : analysis.isHelpful === false
            ? 'No'
            : 'N/A',
        feedbackComment: analysis.feedbackComment || '',
        errorMessage: analysis.errorMessage || '',
        createdAt: analysis.createdAt
          ? new Date(analysis.createdAt).toLocaleString('en-US')
          : '',
        feedbackAt: analysis.feedbackAt
          ? new Date(analysis.feedbackAt).toLocaleString('en-US')
          : '',
      });
    });
    // Apply borders to all cells
    worksheet.eachRow({ includeEmpty: false }, (row) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      });
    });

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();
    console.log('✅ Excel file generated successfully');

    return Buffer.from(buffer);
  }

  async analyzeDiagnosisWithImageAndROI(
    image_url: string,
    modelName: string,
    aiResult: AiResultDiagnosis
  ): Promise<string> {
    try {
      // Prepare prediction details for the prompt
      const predictionsText =
        aiResult.predictions
          ?.map((pred, idx) => {
            const area = pred.width * pred.height;
            const areaPercentage = (
              (area / (aiResult.image.width * aiResult.image.height)) *
              100
            ).toFixed(2);
            return `
Detection ${idx + 1}:
- Class: ${pred.class}
- Confidence: ${(pred.confidence * 100).toFixed(2)}%
- Location: (x: ${pred.x}, y: ${pred.y})
- Size: ${pred.width}x${pred.height} pixels
- Area Coverage: ${areaPercentage}% of image
- Bounding Box Points: ${pred.points?.length || 0} points`;
          })
          .join('\n') || 'No detections found';

      const totalDetections = aiResult.predictions?.length || 0;
      const totalArea =
        aiResult.predictions?.reduce(
          (sum, pred) => sum + pred.width * pred.height,
          0
        ) || 0;
      const totalAreaPercentage = (
        (totalArea / (aiResult.image.width * aiResult.image.height)) *
        100
      ).toFixed(2);

      const prompt = `You are a medical imaging AI assistant analyzing diagnostic results from the "${modelName}" model.

**IMAGE ANALYSIS TASK:**
Analyze the provided medical image and AI detection results to assess the patient's condition.

**AI MODEL INFORMATION:**
- Model Name: ${modelName}
- Image Dimensions: ${aiResult.image.width}x${aiResult.image.height} pixels
- Total Detections: ${totalDetections}
- Total Affected Area: ${totalAreaPercentage}% of image

**DETECTION RESULTS:**${predictionsText}

**ASSESSMENT REQUIREMENTS:**
Based on the detection results and image analysis, provide:

1. **Condition Severity Assessment:**
   - Evaluate severity based on:
     * Number of detections
     * Total area coverage (${totalAreaPercentage}%)
     * Distribution pattern
     * Confidence levels
   - Classify as: Mild, Moderate, or Severe

2. **Clinical Interpretation:**
   - Describe the detected abnormalities
   - Explain their significance
   - Note any concerning patterns

3. **Recommendations:**
   - Suggest next steps for patient care
   - Indicate if urgent attention is needed
   - Mention any follow-up imaging required

4. **Confidence Assessment:**
   - Comment on the reliability of these findings
   - Note any limitations or areas of uncertainty

Provide a clear, professional medical assessment in 200-300 words.`;

      const completion = await this.openai.chat.completions.create({
        model: 'google/gemma-3-27b-it:free',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: prompt,
              },
              {
                type: 'image_url',
                image_url: {
                  url: image_url,
                },
              },
            ],
          },
        ],
      });

      return completion.choices[0].message.content as string;
    } catch (error) {
      console.error('❌ Error in analyzeDiagnosisWithImageAndROI:', error);
      throw new BadRequestException(
        'Failed to analyze diagnosis: ' +
          (error instanceof Error ? error.message : 'Unknown error')
      );
    }
  }

  async getByStudyId(studyId: string): Promise<AiAnalysis[]> {
    console.log(`Retrieving AI analyses for study ID: ${studyId}`);
    const analyses = await this.aiAnalysisRepository.find({
      where: { studyId },
      order: { createdAt: 'DESC' },
    });
    return analyses;
  }
}
