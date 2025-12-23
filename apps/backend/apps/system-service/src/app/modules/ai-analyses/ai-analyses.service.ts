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
    // if (cachedService) {
    //   console.log('AI analyses retrieved from cache');
    //   return cachedService;
    // }

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

  //   async analyzeDiagnosisWithImageAndROI(
  //     image_url: string,
  //     modelName: string,
  //     aiResult: AiResultDiagnosis
  //   ): Promise<string> {
  //     try {
  //       const predictionsText =
  //         aiResult.predictions
  //           ?.map((pred, idx) => {
  //             const area = pred.width * pred.height;
  //             const areaPercentage = (
  //               (area / (aiResult.image.width * aiResult.image.height)) *
  //               100
  //             ).toFixed(2);
  //             return `
  // Detection ${idx + 1}:
  // - Class: ${pred.class}
  // - Confidence: ${(pred.confidence * 100).toFixed(2)}%
  // - Location: (x: ${pred.x}, y: ${pred.y})
  // - Size: ${pred.width}x${pred.height} pixels
  // - Area Coverage: ${areaPercentage}% of image
  // - Bounding Box Points: ${pred.points?.length || 0} points`;
  //           })
  //           .join('\n') || 'No detections found';

  //       const totalDetections = aiResult.predictions?.length || 0;
  //       const totalArea =
  //         aiResult.predictions?.reduce(
  //           (sum, pred) => sum + pred.width * pred.height,
  //           0
  //         ) || 0;
  //       const totalAreaPercentage = (
  //         (totalArea / (aiResult.image.width * aiResult.image.height)) *
  //         100
  //       ).toFixed(2);

  //       const prompt = `You are a medical imaging AI assistant analyzing diagnostic results from the "${modelName}" model.

  // **IMAGE ANALYSIS TASK:**
  // Analyze the provided medical image and AI detection results to assess the patient's condition.

  // **AI MODEL INFORMATION:**
  // - Model Name: ${modelName}
  // - Image Dimensions: ${aiResult.image.width}x${aiResult.image.height} pixels
  // - Total Detections: ${totalDetections}
  // - Total Affected Area: ${totalAreaPercentage}% of image

  // **DETECTION RESULTS:**${predictionsText}

  // **ASSESSMENT REQUIREMENTS:**
  // Based on the detection results and image analysis, provide:

  // 1. **Condition Severity Assessment:**
  //    - Evaluate severity based on:
  //      * Number of detections
  //      * Total area coverage (${totalAreaPercentage}%)
  //      * Distribution pattern
  //      * Confidence levels
  //    - Classify as: Mild, Moderate, or Severe

  // 2. **Clinical Interpretation:**
  //    - Describe the detected abnormalities
  //    - Explain their significance
  //    - Note any concerning patterns

  // 3. **Recommendations:**
  //    - Suggest next steps for patient care
  //    - Indicate if urgent attention is needed
  //    - Mention any follow-up imaging required

  // 4. **Confidence Assessment:**
  //    - Comment on the reliability of these findings
  //    - Note any limitations or areas of uncertainty

  // Provide a clear, professional medical assessment in 200-300 words.`;

  //       const completion = await this.openai.chat.completions.create({
  //         model: 'google/gemma-3-27b-it:free',
  //         messages: [
  //           {
  //             role: 'user',
  //             content: [
  //               {
  //                 type: 'text',
  //                 text: prompt,
  //               },
  //               {
  //                 type: 'image_url',
  //                 image_url: {
  //                   url: image_url,
  //                 },
  //               },
  //             ],
  //           },
  //         ],
  //       });

  //       return completion.choices[0].message.content as string;
  //     } catch (error) {
  //       console.error('❌ Error in analyzeDiagnosisWithImageAndROI:', error);
  //       throw new BadRequestException(
  //         'Failed to analyze diagnosis: ' +
  //           (error instanceof Error ? error.message : 'Unknown error')
  //       );
  //     }
  //   }

  async analyzeDiagnosisWithImageAndROI(
    image_url: string,
    modelName: string,
    aiResult: AiResultDiagnosis
  ): Promise<string> {
    try {
      // Check if predictions exist
      if (!aiResult.predictions || aiResult.predictions.length === 0) {
        throw new BadRequestException('No predictions found in AI result');
      }

      // Prepare detailed information for each detection region
      const detectionsDetail = aiResult.predictions.map((pred, idx) => {
        const area = pred.width * pred.height;
        const areaPercentage = (
          (area / (aiResult.image.width * aiResult.image.height)) *
          100
        ).toFixed(2);

        // Get sample points from polygon
        const samplePoints =
          pred.points
            ?.slice(0, 4) // Take first 4 points as sample
            .map((p) => `(${p.x.toFixed(0)}, ${p.y.toFixed(0)})`)
            .join(', ') || 'N/A';

        // Determine relative position in image
        const posX = pred.x / aiResult.image.width;
        const posY = pred.y / aiResult.image.height;

        let horizontalPos = 'center';
        if (posX < 0.33) horizontalPos = 'left';
        else if (posX > 0.67) horizontalPos = 'right';

        let verticalPos = 'middle';
        if (posY < 0.33) verticalPos = 'upper';
        else if (posY > 0.67) verticalPos = 'lower';

        return {
          index: idx + 1,
          class: pred.class,
          confidence: (pred.confidence * 100).toFixed(2),
          centerX: pred.x,
          centerY: pred.y,
          width: pred.width,
          height: pred.height,
          area: area,
          areaPercentage: areaPercentage,
          samplePoints: samplePoints,
          totalPoints: pred.points?.length || 0,
          position: `${verticalPos} ${horizontalPos}`,
          relativeX: (posX * 100).toFixed(1),
          relativeY: (posY * 100).toFixed(1),
        };
      });

      // Create detailed text description of detection regions
      const detectionsText = detectionsDetail
        .map(
          (det) => `
   Detection Region #${det.index}:
   • Pathology Type: "${det.class}"
   • Confidence Score: ${det.confidence}%
   • Center Position: (${det.centerX}, ${det.centerY})
   • Relative Location: ${det.position} (${det.relativeX}% from left, ${det.relativeY}% from top)
   • Region Dimensions: ${det.width} × ${det.height} pixels
   • Area Coverage: ${det.area} pixels² (${det.areaPercentage}% of total image area)
   • Polygon Boundary: ${det.totalPoints} detailed boundary points
   • Sample Coordinates: ${det.samplePoints}...`
        )
        .join('\n');

      const totalDetections = aiResult.predictions.length;
      const totalArea = detectionsDetail.reduce(
        (sum, det) => sum + det.area,
        0
      );
      const totalAreaPercentage = (
        (totalArea / (aiResult.image.width * aiResult.image.height)) *
        100
      ).toFixed(2);

      // Create list of detected classes
      const detectedClasses = [
        ...new Set(detectionsDetail.map((d) => d.class)),
      ].join(', ');

      const prompt = `You are an experienced Diagnostic Imaging Specialist with years of expertise in medical image analysis. Please provide a comprehensive professional analysis of this AI diagnostic result.
 DIAGNOSTIC INFORMATION
 **Basic Information:**
   • AI Model: ${modelName}
   • Detected Pathology Types: ${detectedClasses}
   • Image Dimensions: ${aiResult.image.width} × ${aiResult.image.height} pixels
   • Total Regions Detected: ${totalDetections} outlined region(s)
   • Total Affected Area: ${totalAreaPercentage}% of total image area

${detectionsText}

**Please carefully observe the provided medical image and the polygon-outlined regions**, then provide a comprehensive analysis following this structure:

**1️ DETAILED ANATOMICAL LOCATION (4-5 sentences):**
   Based on polygon points and position within the image:
   • Precisely identify the pathology location within the organ (e.g., left/right lung, upper/middle/lower lobe)
   • Describe relative position compared to important anatomical structures
   • Assess distribution pattern: localized in one area or diffusely spread across multiple regions
   • Comment on the boundaries of the pathological region (well-defined or irregular)

**2️ SEVERITY ASSESSMENT (4-5 sentences):**
   Classify severity level: **MILD** / **MODERATE** / **SEVERE** / **CRITICAL**
   
   Assessment criteria:
   • Affected area: ${totalAreaPercentage}% of total area
     - Below 10%: Mild
     - 10-30%: Moderate
     - 30-50%: Severe
     - Above 50%: Critical
   • Number of lesions: ${totalDetections} region(s)
   • AI Confidence: ${detectionsDetail.map((d) => d.confidence).join('%, ')}%
   • Does the location affect critical organ function?

**3️ IMAGING CHARACTERISTICS DESCRIPTION (5-6 sentences):**
   Based on the actual image and polygon outlines:
   • Describe the shape and size of the pathological regions
   • Characterize density patterns (solid, hazy, heterogeneous, etc.)
   • Define boundaries (sharp, ill-defined, invasive, etc.)
   • Note relationships with surrounding structures
   • Compare with typical imaging features of this condition
   • Identify any additional abnormal findings (if present)

**4️ CLINICAL SIGNIFICANCE (3-4 sentences):**
   • Explain how this pathology impacts the patient
   • Common clinical symptoms associated with this finding
   • Initial prognosis assessment
   • Potential complications that may arise

**5️ MANAGEMENT RECOMMENDATIONS (4-5 sentences):**
   • Urgency level: EMERGENCY / URGENT / ROUTINE / FOLLOW-UP
   • Additional diagnostic tests required
   • Suggested treatment approach
   • Timeline for follow-up/monitoring
   • Special considerations for patient care

**6️ RELIABILITY ASSESSMENT (2-3 sentences):**
   • Confidence level of AI results (based on confidence scores)
   • Factors that may affect result accuracy
   • Recommendation for specialist physician confirmation

 IMPORTANT GUIDELINES

 MUST DO:
   • Carefully observe the image and polygon-marked regions
   • Use accurate medical terminology with clear explanations
   • Provide evidence-based assessment from specific imaging findings
   • Maintain objective, professional analysis
   • Write in plain text format WITHOUT any markdown formatting

 DO NOT:
   • Make 100% definitive diagnoses (these are AI-assisted results)
   • Ignore information from polygon points
   • Provide vague, non-specific analysis
   • Use alarming or panic-inducing language
   • Use markdown formatting like ** or * or # for styling
   • Include word count or any meta-information at the end

Please write a professional medical report in PLAIN TEXT (no markdown, no bold markers, no asterisks) about 200-250 words that is valuable for clinical decision-making!`;

      const openAiModel = this.configService.get('OPENAI_MODEL');
      console.log('Model name:', openAiModel);
      const completion = await this.openai.chat.completions.create({
        model: openAiModel,
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
        temperature: 0.7,
        // max_tokens: 300,
      });

      const analysisResult = completion.choices[0].message.content as string;

      // Logging for debugging
      console.log('AI Analysis completed successfully');
      console.log('Detection summary:', {
        modelName,
        totalDetections,
        totalAreaPercentage: `${totalAreaPercentage}%`,
        classes: detectedClasses,
      });

      return analysisResult;
    } catch (error) {
      console.error('Error in analyzeDiagnosisWithImageAndROI:', error);

      // More detailed error handling
      if (error instanceof BadRequestException) {
        throw error;
      }

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

  async getStats(): Promise<{
    total: number;
    completed: number;
    failed: number;
    pending: number;
  }> {
    const [total, completed, failed, pending] = await Promise.all([
      this.aiAnalysisRepository.count(),
      this.aiAnalysisRepository.count({
        where: { analysisStatus: AnalysisStatus.COMPLETED },
      }),
      this.aiAnalysisRepository.count({
        where: { analysisStatus: AnalysisStatus.FAILED },
      }),
      this.aiAnalysisRepository.count({
        where: { analysisStatus: AnalysisStatus.PENDING },
      }),
    ]);

    return {
      total,
      completed,
      failed,
      pending,
    };
  }

  async remove(id: string): Promise<{ success: boolean; message: string }> {
    console.log(`🗑️ Deleting AI analysis: ${id}`);

    try {
      // Find the AI analysis
      const aiAnalysis = await this.findOne(id);

      // Delete the Cloudinary image if it exists
      if (aiAnalysis.originalImageName) {
        try {
          console.log(`Deleting Cloudinary image: ${aiAnalysis.originalImageName}`);
          await this.cloudinaryService.deleteImageFromCloudinary(aiAnalysis.originalImageName);
          console.log('Cloudinary image deleted successfully');
        } catch (cloudinaryError) {
          // Log error but don't fail the deletion
          console.error(
            'Failed to delete Cloudinary image:',
            cloudinaryError
          );
          console.warn(
            'Continuing with database deletion despite Cloudinary error'
          );
        }
      } else {
        console.log('No Cloudinary image to delete');
      }

      // Delete from database
      await this.aiAnalysisRepository.remove(aiAnalysis);
      console.log('AI analysis deleted from database');

      // Clear related cache
      const keyName = createCacheKey.system(
        'ai_analyses',
        undefined,
        'filter_ai_analyses'
      );
      await this.redisService.delete(keyName);
      console.log('Cache cleared');

      return {
        success: true,
        message: 'AI analysis deleted successfully',
      };
    } catch (error) {
      console.error('Error deleting AI analysis:', error);
      throw error;
    }
  }
}
