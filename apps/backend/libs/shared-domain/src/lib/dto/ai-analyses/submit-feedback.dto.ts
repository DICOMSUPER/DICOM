import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SubmitFeedbackDto {
  @IsBoolean()
  @IsNotEmpty()
  isHelpful!: boolean;

  @IsOptional()
  @IsString()
  feedbackComment?: string;
}
